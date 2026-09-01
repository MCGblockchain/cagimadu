import { formatGwei } from 'viem'
import type { NetworkPressure } from '../models/block.model.js'

export const weiToGwei = (value: bigint | undefined | null): number =>
  Number(Number(formatGwei(value ?? 0n)).toFixed(4))

export const percentVariation = (current: number, previous: number): number => {
  if (previous === 0) return 0
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

export const networkPressure = (utilization: number, feeGwei: number): NetworkPressure => {
  const score = utilization * 0.7 + Math.min(feeGwei, 100) * 0.3
  if (score >= 83) return 'Crítica'
  if (score >= 66) return 'Alta'
  if (score >= 45) return 'Moderada'
  return 'Baixa'
}

export const volatilityLabel = (values: number[]): 'Baixa' | 'Moderada' | 'Alta' => {
  if (values.length < 2) return 'Baixa'
  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  if (average === 0) return 'Baixa'
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length
  const coefficient = Math.sqrt(variance) / average
  if (coefficient >= 0.3) return 'Alta'
  if (coefficient >= 0.12) return 'Moderada'
  return 'Baixa'
}

export const estimateOperationEth = (feeGwei: number, gasUnits: number): number =>
  Number((feeGwei * gasUnits * 1e-9).toFixed(8))

export const shortAddress = (address: string): string =>
  address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address
