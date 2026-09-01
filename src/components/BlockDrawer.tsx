import type { BlockData } from '../types'
import { CloseIcon, CubeIcon, ExternalIcon } from './Icons'

interface BlockDrawerProps {
  block: BlockData | null
  onClose: () => void
}

export function BlockDrawer({ block, onClose }: BlockDrawerProps) {
  if (!block) return null
  return (
    <>
      <button className="drawer-scrim" aria-label="Fechar detalhes" onClick={onClose} />
      <aside className="block-drawer">
        <div className="drawer-head">
          <div className="drawer-title"><span className="drawer-cube"><CubeIcon /></span><span><small>Detalhes do bloco</small><strong>#{block.number.toLocaleString('pt-BR')}</strong></span></div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar"><CloseIcon /></button>
        </div>
        <div className="drawer-live"><span><i className="status-dot" /> Confirmado</span><strong>{new Date(block.timestamp).toLocaleTimeString('pt-BR')}</strong></div>
        <div className="drawer-hero"><small>Fee recomendada</small><div><strong>{block.fee.toFixed(2)}</strong><span>Gwei</span></div><p>≈ {(block.fee * 21_000 * 1e-9).toFixed(8)} ETH por transferência</p></div>
        <div className="drawer-section"><h3>Composição da fee</h3><div className="fee-composition"><i style={{ width: '81%' }} /><i style={{ width: '19%' }} /></div><div className="composition-legend"><span><i />Base fee<strong>{block.baseFee} Gwei</strong></span><span><i />Priority fee<strong>{block.priorityFee} Gwei</strong></span></div></div>
        <div className="drawer-section"><h3>Dados do bloco</h3><dl className="detail-list"><div><dt>Transações</dt><dd>{block.txs}</dd></div><div><dt>Gas utilizado</dt><dd>{block.gasUsed}M / {block.gasLimit}M</dd></div><div><dt>Utilização</dt><dd>{block.utilization}%</dd></div><div><dt>Pressão da rede</dt><dd><span className={`difficulty ${block.difficulty.toLowerCase().replace('í', 'i')}`}><i />{block.difficulty}</span></dd></div><div><dt>Validador</dt><dd className="mono">{block.validator}</dd></div></dl></div>
        <a className="drawer-link" href={`https://etherscan.io/block/${block.number}`} target="_blank" rel="noreferrer">Ver no Etherscan <ExternalIcon size={16} /></a>
      </aside>
    </>
  )
}
