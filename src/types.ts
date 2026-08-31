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
  usd: number
}
