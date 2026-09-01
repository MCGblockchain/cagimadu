import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from './app.js'
import type { BlockModel } from './models/block.model.js'
import type { CurrentFeeModel, FeeHistoryModel } from './models/fee.model.js'
import type { EthereumServiceContract } from './services/ethereum.service.js'
import type { CacheResult } from './utils/memory-cache.js'

const block: BlockModel = {
  number: 23_184_921,
  hash: '0xabc',
  age: 'agora',
  timestamp: '2026-08-31T21:00:00.000Z',
  fee: 24.6,
  baseFee: 21.4,
  priorityFee: 3.2,
  gasUsed: 15,
  gasLimit: 30,
  utilization: 50,
  txs: 180,
  difficulty: 'Moderada',
  validator: '0x1234…5678',
}

const currentFee: CurrentFeeModel = {
  blockNumber: block.number,
  baseFeeGwei: 21.4,
  priorityFeeGwei: 3.2,
  recommendedFeeGwei: 24.6,
  previousRecommendedFeeGwei: 22.1,
  variationPercent: 11.31,
  networkPressure: 'Moderada',
  estimates: {
    transfer: { gasUnits: 21_000, eth: 0.0005166 },
    swap: { gasUnits: 150_000, eth: 0.00369 },
    nftMint: { gasUnits: 100_000, eth: 0.00246 },
  },
  updatedAt: '2026-08-31T21:00:00.000Z',
}

const feeHistory: FeeHistoryModel = {
  points: [{ blockNumber: block.number, time: block.timestamp, value: 24.6, baseFeeGwei: 21.4, priorityFeeGwei: 3.2 }],
  minimum: 24.6,
  average: 24.6,
  maximum: 24.6,
  volatility: 'Baixa',
  blockCount: 2,
}

const cached = <T>(data: T): CacheResult<T> => ({
  data,
  cached: false,
  stale: false,
  updatedAt: '2026-08-31T21:00:00.000Z',
})

const service = {
  getRecentBlocks: vi.fn(async () => cached([block])),
  getBlock: vi.fn(async () => cached(block)),
  getCurrentFee: vi.fn(async () => cached(currentFee)),
  getFeeHistory: vi.fn(async () => cached(feeHistory)),
} satisfies EthereumServiceContract

const app = createApp({ ethereum: service })

describe('Cagimadu API', () => {
  it('responde ao health check', async () => {
    const response = await request(app).get('/api/health').expect(200)
    expect(response.body.status).toBe('ok')
  })

  it('lista blocos usando o service', async () => {
    const response = await request(app).get('/api/blocks?limit=10').expect(200)
    expect(response.body.data[0].number).toBe(block.number)
    expect(response.body.meta.source).toBe('ethereum-rpc')
    expect(service.getRecentBlocks).toHaveBeenCalledWith(10)
  })

  it('retorna a fee atual', async () => {
    const response = await request(app).get('/api/fees/current').expect(200)
    expect(response.body.data.recommendedFeeGwei).toBe(24.6)
  })

  it('rejeita intervalos maiores que o limite do RPC', async () => {
    const response = await request(app).get('/api/fees/history?blocks=5000').expect(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 404 para rotas inexistentes', async () => {
    const response = await request(app).get('/api/unknown').expect(404)
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND')
  })
})
