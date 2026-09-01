export type ViewId = 'blocks' | 'market' | 'fees'

export interface BlockData {
  number: number
  age: string
  timestamp: string
  fee: number
  baseFee: number
  priorityFee: number
  gasUsed: number
  gasLimit: number
  utilization: number
  txs: number
  difficulty: 'Baixa' | 'Moderada' | 'Alta' | 'Crítica'
  validator: string
}

export interface FeePoint {
  time: string
  value: number
  usd?: number
  blockNumber?: number
}

export interface ApiMeta {
  source: 'ethereum-rpc'
  cached: boolean
  stale: boolean
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  meta: ApiMeta
}

export interface CurrentFeeData {
  blockNumber: number
  baseFeeGwei: number
  priorityFeeGwei: number
  recommendedFeeGwei: number
  previousRecommendedFeeGwei: number
  variationPercent: number
  networkPressure: BlockData['difficulty']
  estimates: {
    transfer: { gasUnits: number; eth: number }
    swap: { gasUnits: number; eth: number }
    nftMint: { gasUnits: number; eth: number }
  }
  updatedAt: string
}

export interface FeeHistoryData {
  points: Array<{
    blockNumber: number
    time: string
    value: number
    baseFeeGwei: number
    priorityFeeGwei: number
  }>
  minimum: number
  average: number
  maximum: number
  volatility: 'Baixa' | 'Moderada' | 'Alta'
  blockCount: number
}
