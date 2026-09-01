export type NetworkPressure = 'Baixa' | 'Moderada' | 'Alta' | 'Crítica'

export interface BlockModel {
  number: number
  hash: string
  age: string
  timestamp: string
  fee: number
  baseFee: number
  priorityFee: number
  gasUsed: number
  gasLimit: number
  utilization: number
  txs: number
  difficulty: NetworkPressure
  validator: string
}
