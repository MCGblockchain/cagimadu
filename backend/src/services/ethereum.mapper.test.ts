import { describe, expect, it } from 'vitest'
import {
  estimateOperationEth,
  networkPressure,
  percentVariation,
  shortAddress,
  volatilityLabel,
  weiToGwei,
} from './ethereum.mapper.js'

describe('ethereum.mapper', () => {
  it('converte wei para gwei sem perder a escala', () => {
    expect(weiToGwei(24_600_000_000n)).toBe(24.6)
  })

  it('calcula a variação percentual entre blocos', () => {
    expect(percentVariation(24.6, 22.1)).toBe(11.31)
    expect(percentVariation(10, 0)).toBe(0)
  })

  it('calcula o custo de uma operação em ETH', () => {
    expect(estimateOperationEth(24.6, 21_000)).toBe(0.0005166)
  })

  it('classifica pressão combinando ocupação e fee', () => {
    expect(networkPressure(20, 5)).toBe('Baixa')
    expect(networkPressure(65, 25)).toBe('Moderada')
    expect(networkPressure(90, 30)).toBe('Alta')
    expect(networkPressure(100, 100)).toBe('Crítica')
  })

  it('classifica volatilidade pelo coeficiente de variação', () => {
    expect(volatilityLabel([10, 10.2, 9.8])).toBe('Baixa')
    expect(volatilityLabel([10, 13, 8, 12])).toBe('Moderada')
    expect(volatilityLabel([5, 20, 40, 10])).toBe('Alta')
  })

  it('abrevia endereços longos', () => {
    expect(shortAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x123456…345678')
  })
})
