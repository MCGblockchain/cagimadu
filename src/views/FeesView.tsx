import { useMemo, useState } from 'react'
import { feeSeries } from '../data'
import { BookIcon, ExternalIcon, FuelIcon, LinkIcon, ShieldIcon } from '../components/Icons'
import { FeeChart } from '../components/FeeChart'

const periods = ['1H', '6H', '24H', '7D'] as const

export function FeesView() {
  const [period, setPeriod] = useState<(typeof periods)[number]>('6H')
  const visibleData = useMemo(() => {
    if (period === '1H') return feeSeries.slice(-13)
    if (period === '6H') return feeSeries
    if (period === '24H') return feeSeries.map((d, i) => ({ ...d, value: d.value + Math.sin(i * .7) * 3 }))
    return feeSeries.map((d, i) => ({ ...d, value: d.value + Math.cos(i * .4) * 8 + 5 }))
  }, [period])

  return (
    <div className="page page-fees">
      <section className="fee-hero-panel">
        <div className="fee-hero-copy"><span className="eyebrow"><i /> Atualizado há 2 segundos</span><p>Fee recomendada agora</p><div className="current-fee"><strong>24.60</strong><span>GWEI</span></div><div className="fee-change"><span>+11.3%</span> em relação ao bloco anterior <small>#23.184.920</small></div></div>
        <div className="fee-costs">
          <p>Estimativa por operação <span>ETH = $4.268,14</span></p>
          <div className="cost-row"><span><i className="cost-icon">↗</i>Transferência ETH</span><strong>$2.21<small>21k gas</small></strong></div>
          <div className="cost-row"><span><i className="cost-icon">◇</i>Swap em DEX</span><strong>$15.78<small>150k gas</small></strong></div>
          <div className="cost-row"><span><i className="cost-icon">⬡</i>Mint de NFT</span><strong>$10.52<small>100k gas</small></strong></div>
        </div>
        <div className="hero-watermark"><FuelIcon size={170} /></div>
      </section>

      <section className="chart-panel">
        <div className="chart-header"><div><span className="chart-kicker">FEE HISTORY</span><h2>Variação das taxas</h2><p>Preço recomendado para inclusão no próximo bloco</p></div><div className="chart-actions"><div className="chart-legend"><i /> Fee (Gwei)</div><div className="segmented">{periods.map((item) => <button key={item} className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div></div></div>
        <div className="chart-summary"><div><span>Mínima</span><strong>14.92 <small>Gwei</small></strong></div><div><span>Média</span><strong>25.81 <small>Gwei</small></strong></div><div><span>Máxima</span><strong>46.30 <small>Gwei</small></strong></div><div className="volatility"><span>Volatilidade</span><strong>Alta <i>↑</i></strong></div></div>
        <FeeChart data={visibleData} />
      </section>

      <section className="fee-bottom-grid">
        <article className="recommendation-card"><div><span className="card-kicker"><span>RECOMENDAÇÃO</span></span><h3>A rede está em uma janela moderada</h3><p>Transferências simples podem ser executadas agora. Para operações maiores, aguardar 15–30 minutos pode reduzir o custo em até 18%.</p></div><div className="traffic-gauge"><div className="gauge-track"><i /><i /><i /><i /></div><span><b /> Agora</span></div></article>
        <article className="links-card"><div className="card-kicker"><span>EXPLORE A REDE</span></div><div className="resource-links"><a href="https://etherscan.io/gastracker" target="_blank" rel="noreferrer"><span className="resource-icon"><LinkIcon /></span><span><strong>Etherscan Gas Tracker</strong><small>Valide estimativas diretamente no explorer</small></span><ExternalIcon size={16}/></a><a href="https://ethereum.org/pt-br/gas/" target="_blank" rel="noreferrer"><span className="resource-icon"><BookIcon /></span><span><strong>Entenda o gas</strong><small>Guia oficial da Ethereum Foundation</small></span><ExternalIcon size={16}/></a><a href="https://beaconcha.in/" target="_blank" rel="noreferrer"><span className="resource-icon"><ShieldIcon /></span><span><strong>Beaconcha.in</strong><small>Consenso, validadores e épocas</small></span><ExternalIcon size={16}/></a></div></article>
      </section>
      <p className="data-disclaimer">Dados demonstrativos para o protótipo acadêmico. As estimativas não constituem recomendação financeira.</p>
    </div>
  )
}
