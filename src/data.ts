import type { BlockData, FeePoint } from './types'

const feePattern = [24.6, 22.1, 25.8, 31.4, 28.9, 18.7, 16.2, 20.3, 27.5, 35.8, 42.1, 38.6, 29.4, 23.7, 19.8, 21.5, 26.3, 33.9, 30.2, 17.4, 14.9, 18.1, 22.8, 26.7]

const difficultyFor = (utilization: number): BlockData['difficulty'] => {
  if (utilization > 92) return 'Crítica'
  if (utilization > 78) return 'Alta'
  if (utilization > 58) return 'Moderada'
  return 'Baixa'
}

export const blocks: BlockData[] = Array.from({ length: 40 }, (_, index) => {
  const fee = feePattern[index % feePattern.length] + ((index * 7) % 5) * 0.34
  const utilization = 48 + ((index * 17) % 51)
  return {
    number: 23_184_921 - index,
    age: index === 0 ? 'agora' : `${index * 12}s`,
    timestamp: new Date(Date.now() - index * 12_000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    fee: Number(fee.toFixed(2)),
    baseFee: Number((fee * 0.81).toFixed(2)),
    priorityFee: Number((fee * 0.19).toFixed(2)),
    gasUsed: Number((utilization * 0.3).toFixed(2)),
    gasLimit: 30,
    utilization,
    txs: 112 + ((index * 83) % 281),
    difficulty: difficultyFor(utilization),
    validator: `0x${(0xa1b2c3 + index * 7919).toString(16)}…${(0xe91f - index * 13).toString(16)}`,
  }
})

export const feeSeries: FeePoint[] = Array.from({ length: 42 }, (_, index) => {
  const base = 20 + Math.sin(index / 3.2) * 7 + Math.cos(index / 1.8) * 3
  const spike = index > 27 && index < 33 ? (index - 27) * (33 - index) * 1.1 : 0
  const value = Number((base + spike).toFixed(2))
  const minutesAgo = (41 - index) * 5
  const date = new Date(Date.now() - minutesAgo * 60_000)
  return {
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    value,
    usd: Number((value * 0.00116).toFixed(4)),
  }
})
