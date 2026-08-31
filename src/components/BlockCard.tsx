import { scaleLinear } from 'd3-scale'
import type { MouseEvent } from 'react'
import type { BlockData } from '../types'
import { ChevronIcon, CubeIcon } from './Icons'

const hueScale = scaleLinear<string>().domain([14, 24, 36, 48]).range(['#39d9aa', '#a879ff', '#ffb85c', '#ff5470']).clamp(true)

interface BlockCardProps {
  block: BlockData
  index: number
  onSelect: (block: BlockData) => void
}

export function BlockCard({ block, index, onSelect }: BlockCardProps) {
  const color = hueScale(block.fee)

  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--rx', `${-y * 7}deg`)
    event.currentTarget.style.setProperty('--ry', `${x * 9}deg`)
  }

  const resetTilt = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty('--rx', '0deg')
    event.currentTarget.style.setProperty('--ry', '0deg')
  }

  return (
    <button
      className="block-card"
      style={{ '--block-color': color, '--delay': `${Math.min(index, 15) * 35}ms` } as React.CSSProperties}
      onClick={() => onSelect(block)}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
    >
      <span className="cube-top" /><span className="cube-side" />
      <span className="block-card-inner">
        <span className="block-card-head"><span className="cube-icon"><CubeIcon size={15} /></span><span className="block-age"><i />{block.age}</span></span>
        <span className="block-number">#{block.number.toLocaleString('pt-BR')}</span>
        <span className="fee-display"><strong>{block.fee.toFixed(2)}</strong><span>GWEI</span></span>
        <span className="util-row"><span>Uso do bloco</span><strong>{block.utilization}%</strong></span>
        <span className="util-track"><i style={{ width: `${block.utilization}%` }} /></span>
        <span className="block-card-foot"><span className={`difficulty ${block.difficulty.toLowerCase().replace('í', 'i')}`}><i />{block.difficulty}</span><ChevronIcon size={16} /></span>
      </span>
    </button>
  )
}
