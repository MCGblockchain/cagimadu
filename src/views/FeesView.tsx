import { useEffect, useMemo, useState } from 'react'
import { BookIcon, ExternalIcon, FuelIcon, LinkIcon, ShieldIcon } from '../components/Icons'
import { FeeChart } from '../components/FeeChart'
import { feeSeries } from '../data'
import { api } from '../services/api'
import type { ApiMeta, CurrentFeeData, FeeHistoryData, FeePoint } from '../types'

const periods = [
  { label: '5M', blocks: 25 },
  { label: '20M', blocks: 100 },
  { label: '1H', blocks: 300 },
  { label: '3H', blocks: 900 },
] as const

const fallbackCurrent: CurrentFeeData = {
  blockNumber: 23_184_921,
  baseFeeGwei: 19.93,
  priorityFeeGwei: 4.67,
  recommendedFeeGwei: 24.6,
  previousRecommendedFeeGwei: 22.1,
  variationPercent: 11.3,
  networkPressure: 'Moderada',
  estimates: {
    transfer: { gasUnits: 21_000, eth: 0.0005166 },
    swap: { gasUnits: 150_000, eth: 0.00369 },
    nftMint: { gasUnits: 100_000, eth: 0.00246 },
  },
  updatedAt: new Date().toISOString(),
}

const fallbackHistory: FeeHistoryData = {
  points: feeSeries.map((point, index) => ({
    blockNumber: 23_184_880 + index,
    time: new Date(Date.now() - (feeSeries.length - 1 - index) * 12_000).toISOString(),
    value: point.value,
    baseFeeGwei: point.value * 0.82,
    priorityFeeGwei: point.value * 0.18,
  })),
  minimum: Math.min(...feeSeries.map((point) => point.value)),
  average: feeSeries.reduce((sum, point) => sum + point.value, 0) / feeSeries.length,
  maximum: Math.max(...feeSeries.map((point) => point.value)),
  volatility: 'Alta',
  blockCount: feeSeries.length,
}

const recommendationFor = (pressure: CurrentFeeData['networkPressure']) => {
  if (pressure === 'Baixa') return { title: 'A rede está em uma boa janela', text: 'A pressão está baixa. Este é um momento favorável para executar transferências e operações mais complexas.' }
  if (pressure === 'Moderada') return { title: 'A rede está em uma janela moderada', text: 'Transferências simples podem ser executadas agora. Operações sem urgência podem aguardar uma redução da ocupação.' }
  if (pressure === 'Alta') return { title: 'A rede está sob pressão alta', text: 'Considere adiar operações sem urgência. A ocupação e a taxa recomendada estão acima da faixa habitual.' }
  return { title: 'A rede está em um pico de pressão', text: 'Evite operações não urgentes. A combinação de ocupação e fee indica um período de custo elevado.' }
}

export function FeesView() {
  const [period, setPeriod] = useState<(typeof periods)[number]>(periods[2])
  const [current, setCurrent] = useState<CurrentFeeData | null>(null)
  const [history, setHistory] = useState<FeeHistoryData | null>(null)
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const loadCurrent = async () => {
      try {
        const response = await api.currentFee(controller.signal)
        if (!active) return
        setCurrent(response.data)
        setMeta(response.meta)
        setCurrentError(null)
      } catch (error) {
        if (!active || controller.signal.aborted) return
        setCurrentError(error instanceof Error ? error.message : 'Falha ao consultar a fee atual.')
        setCurrent((value) => value ?? fallbackCurrent)
      }
    }

    const loadHistory = async () => {
      setHistoryLoading(true)
      try {
        const response = await api.feeHistory(period.blocks, controller.signal)
        if (!active) return
        setHistory(response.data)
        setMeta(response.meta)
        setHistoryError(null)
      } catch (error) {
        if (!active || controller.signal.aborted) return
        setHistoryError(error instanceof Error ? error.message : 'Falha ao consultar o histórico.')
        setHistory((value) => value ?? fallbackHistory)
      } finally {
        if (active) setHistoryLoading(false)
      }
    }

    void loadCurrent()
    void loadHistory()
    const currentInterval = window.setInterval(() => void loadCurrent(), 12_000)
    const historyInterval = window.setInterval(() => void loadHistory(), 30_000)
    return () => {
      active = false
      controller.abort()
      window.clearInterval(currentInterval)
      window.clearInterval(historyInterval)
    }
  }, [period, reloadKey])

  const fee = current ?? fallbackCurrent
  const historyData = history ?? fallbackHistory
  const hasError = Boolean(currentError || historyError)
  const recommendation = recommendationFor(fee.networkPressure)
  const variationSign = fee.variationPercent >= 0 ? '+' : ''
  const visibleData = useMemo<FeePoint[]>(() => historyData.points.map((point) => ({
    time: new Date(point.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    value: point.value,
    blockNumber: point.blockNumber,
  })), [historyData])

  return (
    <div className="page page-fees">
      {(hasError || meta?.stale) && (
        <div className={`data-banner ${hasError ? 'error' : 'warning'}`}>
          <span><i />{hasError ? `${currentError ?? historyError} ${!meta ? 'Exibindo dados demonstrativos.' : 'Mantivemos o último valor carregado.'}` : 'O provider está instável. Mantivemos o último dado válido.'}</span>
          <button onClick={() => setReloadKey((key) => key + 1)}>Tentar novamente</button>
        </div>
      )}

      <section className="fee-hero-panel">
        <div className="fee-hero-copy"><span className="eyebrow"><i /> {meta ? `Atualizado às ${new Date(meta.updatedAt).toLocaleTimeString('pt-BR')}` : 'Conectando à Ethereum'}</span><p>Fee recomendada agora</p><div className="current-fee"><strong>{fee.recommendedFeeGwei.toFixed(2)}</strong><span>GWEI</span></div><div className="fee-change"><span className={fee.variationPercent >= 0 ? 'up' : 'down'}>{variationSign}{fee.variationPercent.toFixed(2)}%</span> em relação ao bloco anterior <small>#{(fee.blockNumber - 1).toLocaleString('pt-BR')}</small></div></div>
        <div className="fee-costs">
          <p>Estimativa on-chain <span>fee × gas</span></p>
          <div className="cost-row"><span><i className="cost-icon">↗</i>Transferência ETH</span><strong>{fee.estimates.transfer.eth.toFixed(6)} ETH<small>{(fee.estimates.transfer.gasUnits / 1000).toFixed(0)}k gas</small></strong></div>
          <div className="cost-row"><span><i className="cost-icon">◇</i>Swap em DEX</span><strong>{fee.estimates.swap.eth.toFixed(6)} ETH<small>{(fee.estimates.swap.gasUnits / 1000).toFixed(0)}k gas</small></strong></div>
          <div className="cost-row"><span><i className="cost-icon">⬡</i>Mint de NFT</span><strong>{fee.estimates.nftMint.eth.toFixed(6)} ETH<small>{(fee.estimates.nftMint.gasUnits / 1000).toFixed(0)}k gas</small></strong></div>
        </div>
        <div className="hero-watermark"><FuelIcon size={170} /></div>
      </section>

      <section className="chart-panel">
        <div className="chart-header"><div><span className="chart-kicker">FEE HISTORY</span><h2>Variação das taxas</h2><p>Base fee + prioridade mediana dos blocos confirmados</p></div><div className="chart-actions"><div className="chart-legend"><i /> Fee (Gwei)</div><div className="segmented">{periods.map((item) => <button key={item.label} className={period.label === item.label ? 'active' : ''} onClick={() => setPeriod(item)}>{item.label}</button>)}</div></div></div>
        <div className="chart-summary"><div><span>Mínima</span><strong>{historyData.minimum.toFixed(2)} <small>Gwei</small></strong></div><div><span>Média</span><strong>{historyData.average.toFixed(2)} <small>Gwei</small></strong></div><div><span>Máxima</span><strong>{historyData.maximum.toFixed(2)} <small>Gwei</small></strong></div><div className="volatility"><span>Volatilidade</span><strong>{historyData.volatility} <i>↑</i></strong></div></div>
        {historyLoading && !history ? <div className="loading-panel chart-loading"><i /><span>Carregando histórico de fees…</span></div> : <FeeChart data={visibleData} />}
      </section>

      <section className="fee-bottom-grid">
        <article className="recommendation-card"><div><span className="card-kicker"><span>LEITURA DA REDE</span></span><h3>{recommendation.title}</h3><p>{recommendation.text}</p></div><div className="traffic-gauge"><div className="gauge-track"><i /><i /><i /><i /></div><span><b /> {fee.networkPressure}</span></div></article>
        <article className="links-card"><div className="card-kicker"><span>EXPLORE A REDE</span></div><div className="resource-links"><a href="https://etherscan.io/gastracker" target="_blank" rel="noreferrer"><span className="resource-icon"><LinkIcon /></span><span><strong>Etherscan Gas Tracker</strong><small>Valide estimativas diretamente no explorer</small></span><ExternalIcon size={16}/></a><a href="https://ethereum.org/pt-br/gas/" target="_blank" rel="noreferrer"><span className="resource-icon"><BookIcon /></span><span><strong>Entenda o gas</strong><small>Guia oficial da Ethereum Foundation</small></span><ExternalIcon size={16}/></a><a href="https://beaconcha.in/" target="_blank" rel="noreferrer"><span className="resource-icon"><ShieldIcon /></span><span><strong>Beaconcha.in</strong><small>Consenso, validadores e épocas</small></span><ExternalIcon size={16}/></a></div></article>
      </section>
      <p className="data-disclaimer">Dados on-chain via Ethereum JSON-RPC. Estimativas não constituem recomendação financeira.</p>
    </div>
  )
}
