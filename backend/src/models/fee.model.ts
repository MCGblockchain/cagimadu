import type { NetworkPressure } from './block.model.js'

export interface FeeEstimate {
  gasUnits: number
  eth: number
}

export interface CurrentFeeModel {
  blockNumber: number
  baseFeeGwei: number
  priorityFeeGwei: number
  recommendedFeeGwei: number
  previousRecommendedFeeGwei: number
  variationPercent: number
  networkPressure: NetworkPressure
  estimates: {
    transfer: FeeEstimate
    swap: FeeEstimate
    nftMint: FeeEstimate
  }
  updatedAt: string
}

export interface FeeHistoryPointModel {
  blockNumber: number
  time: string
  value: number
  baseFeeGwei: number
  priorityFeeGwei: number
}

export interface FeeHistoryModel {
  points: FeeHistoryPointModel[]
  minimum: number
  average: number
  maximum: number
  volatility: 'Baixa' | 'Moderada' | 'Alta'
  blockCount: number
}
