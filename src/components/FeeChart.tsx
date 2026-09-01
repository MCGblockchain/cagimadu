import { max, min } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import { area, curveMonotoneX, line } from 'd3-shape'
import { useId, useState } from 'react'
import type { FeePoint } from '../types'

interface FeeChartProps { data: FeePoint[] }

export function FeeChart({ data }: FeeChartProps) {
  const [hovered, setHovered] = useState<number | null>(data.length - 1)
  const gradientId = useId().replace(/:/g, '')
  const width = 920
  const height = 330
  const margin = { top: 24, right: 20, bottom: 40, left: 52 }
  const x = scaleLinear().domain([0, Math.max(1, data.length - 1)]).range([margin.left, width - margin.right])
  const lowestValue = min(data, (d) => d.value) ?? 0
  const highestValue = max(data, (d) => d.value) ?? 1
  const low = Math.max(0, lowestValue * 0.82)
  const high = Math.max(highestValue * 1.18, low + 0.1)
  const y = scaleLinear().domain([low, high]).nice().range([height - margin.bottom, margin.top])
  const linePath = line<FeePoint>().x((_d, index) => x(index)).y((d) => y(d.value)).curve(curveMonotoneX)(data) ?? ''
  const areaPath = area<FeePoint>().x((_d, index) => x(index)).y0(height - margin.bottom).y1((d) => y(d.value)).curve(curveMonotoneX)(data) ?? ''
  const ticks = y.ticks(5)
  const active = hovered !== null ? data[hovered] : null
  const activeX = active && hovered !== null ? x(hovered) : 0
  const activeY = active ? y(active.value) : 0

  const handlePointer = (clientX: number, target: SVGSVGElement) => {
    const rect = target.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * width
    const usable = width - margin.left - margin.right
    const index = Math.max(0, Math.min(data.length - 1, Math.round(((svgX - margin.left) / usable) * (data.length - 1))))
    setHovered(index)
  }

  return (
    <div className="fee-chart-wrap">
      <svg className="fee-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" onPointerMove={(e) => handlePointer(e.clientX, e.currentTarget)} onPointerLeave={() => setHovered(data.length - 1)} role="img" aria-label="Variação da fee em Gwei">
        <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9b6cff" stopOpacity=".35"/><stop offset="1" stopColor="#9b6cff" stopOpacity="0"/></linearGradient><filter id={`${gradientId}glow`}><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {ticks.map((tick) => <g key={tick}><line className="grid-line" x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} /><text className="axis-label y-label" x={margin.left - 12} y={y(tick) + 4}>{tick}</text></g>)}
        {data.map((point, index) => ({ point, index })).filter(({ index }) => index % 8 === 0 || index === data.length - 1).map(({ point, index }) => <text key={point.blockNumber ?? `${point.time}-${index}`} className="axis-label" x={x(index)} y={height - 13} textAnchor="middle">{point.time}</text>)}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} className="main-line-glow" filter={`url(#${gradientId}glow)`} />
        <path d={linePath} className="main-line" />
        {active && <g className="chart-hover"><line x1={activeX} x2={activeX} y1={margin.top} y2={height - margin.bottom}/><circle cx={activeX} cy={activeY} r="7" className="point-halo"/><circle cx={activeX} cy={activeY} r="3.5" className="active-point"/></g>}
        <rect className="chart-hitbox" x={margin.left} y={margin.top} width={width-margin.left-margin.right} height={height-margin.top-margin.bottom} />
      </svg>
      {active && <div className="chart-tooltip" style={{ left: `${(activeX / width) * 100}%`, top: `${(activeY / height) * 100}%` }}><small>{active.time}</small><strong>{active.value.toFixed(2)} Gwei</strong><span>{active.blockNumber ? `Bloco #${active.blockNumber.toLocaleString('pt-BR')}` : active.usd ? `≈ $${active.usd.toFixed(4)}` : 'Dados on-chain'}</span></div>}
    </div>
  )
}
