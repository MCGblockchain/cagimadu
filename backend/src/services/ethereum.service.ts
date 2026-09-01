import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { env } from '../config/env.js'
import type { BlockModel } from '../models/block.model.js'
import type { CurrentFeeModel, FeeHistoryModel, FeeHistoryPointModel } from '../models/fee.model.js'
import { AppError } from '../utils/app-error.js'
import { MemoryCache, type CacheResult } from '../utils/memory-cache.js'
import {
  estimateOperationEth,
  networkPressure,
  percentVariation,
  shortAddress,
  volatilityLabel,
  weiToGwei,
} from './ethereum.mapper.js'

export interface EthereumServiceContract {
  getRecentBlocks(limit: number): Promise<CacheResult<BlockModel[]>>
  getBlock(blockNumber: bigint): Promise<CacheResult<BlockModel>>
  getCurrentFee(): Promise<CacheResult<CurrentFeeModel>>
  getFeeHistory(blockCount: number): Promise<CacheResult<FeeHistoryModel>>
}

const client = createPublicClient({
  chain: mainnet,
  transport: http(env.ETH_RPC_URL, {
    timeout: env.RPC_TIMEOUT_MS,
    retryCount: 1,
    retryDelay: 250,
  }),
})

const cache = new MemoryCache()

const chunks = <T>(values: T[], size: number): T[][] => {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size))
  return result
}

const asRpcError = (error: unknown): AppError => {
  const detail = error instanceof Error ? error.message : 'Falha desconhecida no provider.'
  return new AppError(`Não foi possível consultar a Ethereum. ${detail}`, 502, 'ETHEREUM_RPC_ERROR')
}

export class EthereumService implements EthereumServiceContract {
  async getRecentBlocks(limit: number): Promise<CacheResult<BlockModel[]>> {
    return cache.remember(`blocks:${limit}`, env.BLOCK_CACHE_TTL_MS, async () => {
      try {
        const latest = await client.getBlockNumber()
        const blockNumbers = Array.from({ length: limit }, (_, index) => latest - BigInt(index))
        const history = await client.getFeeHistory({
          blockCount: limit,
          blockTag: 'latest',
          rewardPercentiles: [50],
        })

        const priorityByBlock = new Map<string, bigint>()
        history.reward?.forEach((rewards, index) => {
          priorityByBlock.set((history.oldestBlock + BigInt(index)).toString(), rewards[0] ?? 0n)
        })

        const results: BlockModel[] = []
        for (const group of chunks(blockNumbers, 6)) {
          const received = await Promise.all(group.map(async (blockNumber) => {
            const block = await client.getBlock({ blockNumber, includeTransactions: false })
            return this.mapBlock(block, priorityByBlock.get(blockNumber.toString()) ?? 0n)
          }))
          results.push(...received)
        }
        return results
      } catch (error) {
        throw asRpcError(error)
      }
    })
  }

  async getBlock(blockNumber: bigint): Promise<CacheResult<BlockModel>> {
    return cache.remember(`block:${blockNumber}`, 60_000, async () => {
      try {
        const [block, history] = await Promise.all([
          client.getBlock({ blockNumber, includeTransactions: false }),
          client.getFeeHistory({ blockCount: 1, blockNumber, rewardPercentiles: [50] }),
        ])
        return this.mapBlock(block, history.reward?.[0]?.[0] ?? 0n)
      } catch (error) {
        throw asRpcError(error)
      }
    })
  }

  async getCurrentFee(): Promise<CacheResult<CurrentFeeModel>> {
    return cache.remember('fees:current', env.FEE_CACHE_TTL_MS, async () => {
      try {
        const [latest, history] = await Promise.all([
          client.getBlock({ blockTag: 'latest', includeTransactions: false }),
          client.getFeeHistory({ blockCount: 2, blockTag: 'latest', rewardPercentiles: [50] }),
        ])

        const previousBase = weiToGwei(history.baseFeePerGas[0])
        const currentBase = weiToGwei(history.baseFeePerGas[1])
        const previousPriority = weiToGwei(history.reward?.[0]?.[0])
        const currentPriority = weiToGwei(history.reward?.[1]?.[0])
        const previousFee = previousBase + previousPriority
        const currentFee = currentBase + currentPriority
        const utilization = (history.gasUsedRatio[1] ?? 0) * 100

        return {
          blockNumber: Number(latest.number),
          baseFeeGwei: Number(currentBase.toFixed(4)),
          priorityFeeGwei: Number(currentPriority.toFixed(4)),
          recommendedFeeGwei: Number(currentFee.toFixed(4)),
          previousRecommendedFeeGwei: Number(previousFee.toFixed(4)),
          variationPercent: percentVariation(currentFee, previousFee),
          networkPressure: networkPressure(utilization, currentFee),
          estimates: {
            transfer: { gasUnits: 21_000, eth: estimateOperationEth(currentFee, 21_000) },
            swap: { gasUnits: 150_000, eth: estimateOperationEth(currentFee, 150_000) },
            nftMint: { gasUnits: 100_000, eth: estimateOperationEth(currentFee, 100_000) },
          },
          updatedAt: new Date().toISOString(),
        }
      } catch (error) {
        throw asRpcError(error)
      }
    })
  }

  async getFeeHistory(blockCount: number): Promise<CacheResult<FeeHistoryModel>> {
    return cache.remember(`fees:history:${blockCount}`, env.FEE_CACHE_TTL_MS, async () => {
      try {
        const [latest, history] = await Promise.all([
          client.getBlock({ blockTag: 'latest', includeTransactions: false }),
          client.getFeeHistory({ blockCount, blockTag: 'latest', rewardPercentiles: [50] }),
        ])

        const rawPoints: FeeHistoryPointModel[] = Array.from({ length: blockCount }, (_, index) => {
          const baseFee = weiToGwei(history.baseFeePerGas[index])
          const priorityFee = weiToGwei(history.reward?.[index]?.[0])
          const value = Number((baseFee + priorityFee).toFixed(4))
          const secondsFromLatest = (blockCount - 1 - index) * 12
          const timestamp = Number(latest.timestamp) * 1_000 - secondsFromLatest * 1_000
          return {
            blockNumber: Number(history.oldestBlock + BigInt(index)),
            time: new Date(timestamp).toISOString(),
            value,
            baseFeeGwei: baseFee,
            priorityFeeGwei: priorityFee,
          }
        })

        const sampleEvery = Math.max(1, Math.ceil(rawPoints.length / 90))
        const points = rawPoints.filter((_, index) => index % sampleEvery === 0 || index === rawPoints.length - 1)
        const values = rawPoints.map((point) => point.value)
        const minimum = Math.min(...values)
        const maximum = Math.max(...values)
        const average = values.reduce((sum, value) => sum + value, 0) / values.length

        return {
          points,
          minimum: Number(minimum.toFixed(2)),
          average: Number(average.toFixed(2)),
          maximum: Number(maximum.toFixed(2)),
          volatility: volatilityLabel(values),
          blockCount,
        }
      } catch (error) {
        throw asRpcError(error)
      }
    })
  }

  private mapBlock(
    block: Awaited<ReturnType<typeof client.getBlock>>,
    priorityFeeWei: bigint,
  ): BlockModel {
    const baseFee = weiToGwei(block.baseFeePerGas)
    const priorityFee = weiToGwei(priorityFeeWei)
    const fee = Number((baseFee + priorityFee).toFixed(4))
    const utilization = Number(((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(2))
    const timestampMs = Number(block.timestamp) * 1_000
    const ageSeconds = Math.max(0, Math.round((Date.now() - timestampMs) / 1_000))
    const age = ageSeconds < 10 ? 'agora' : ageSeconds < 60 ? `${ageSeconds}s` : `${Math.floor(ageSeconds / 60)}min`

    return {
      number: Number(block.number),
      hash: block.hash ?? '',
      age,
      timestamp: new Date(timestampMs).toISOString(),
      fee,
      baseFee,
      priorityFee,
      gasUsed: Number((Number(block.gasUsed) / 1_000_000).toFixed(2)),
      gasLimit: Number((Number(block.gasLimit) / 1_000_000).toFixed(2)),
      utilization,
      txs: block.transactions.length,
      difficulty: networkPressure(utilization, fee),
      validator: shortAddress(block.miner),
    }
  }
}

export const ethereumService = new EthereumService()
