import { useMemo, useState } from 'react'
import { blocks } from '../data'
import type { BlockData } from '../types'
import { ActivityIcon, ClockIcon, FuelIcon, InfoIcon } from '../components/Icons'
import { BlockCard } from '../components/BlockCard'
import { BlockDrawer } from '../components/BlockDrawer'

interface BlocksViewProps {
  searchQuery: string
}

export function BlocksView({ searchQuery }: BlocksViewProps) {
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null)
  const avgFee = useMemo(() => blocks.slice(0, 12).reduce((sum, block) => sum + block.fee, 0) / 12, [])
  const filteredBlocks = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase().replace(/[.#\s]/g, '')
    if (!normalized) return blocks
    return blocks.filter((block) =>
      block.number.toString().includes(normalized) ||
      block.number.toLocaleString('pt-BR').replace(/\./g, '').includes(normalized) ||
      block.validator.toLowerCase().includes(normalized),
    )
  }, [searchQuery])

  return (
    <div className="page page-blocks">
      <section className="page-heading">
        <div><span className="eyebrow"><i /> Ethereum mainnet · ao vivo</span><h1>Explorador de blocos</h1><p>Acompanhe fees, ocupação e pressão da rede a cada novo bloco.</p></div>
      </section>

      <section className="metric-strip" aria-label="Resumo da rede">
        <article><span className="metric-icon violet"><FuelIcon size={18} /></span><span><small>Fee média · 12 blocos</small><strong>{avgFee.toFixed(2)} <em>Gwei</em></strong></span><b className="positive">+3.8%</b></article>
        <article><span className="metric-icon green"><ClockIcon size={18} /></span><span><small>Tempo médio</small><strong>12.1 <em>seg</em></strong></span><b>estável</b></article>
        <article><span className="metric-icon orange"><ActivityIcon size={18} /></span><span><small>Pressão da rede</small><strong>Moderada</strong></span><b>68%</b></article>
        <article className="metric-note"><InfoIcon size={17} /><p>Os blocos mais recentes aparecem primeiro. Passe o cursor para explorar e clique para ver os detalhes.</p></article>
      </section>

      <div className="section-toolbar"><div><h2>{searchQuery ? 'Resultado da busca' : 'Blocos recentes'}</h2><span>{searchQuery ? <><strong>{filteredBlocks.length}</strong> {filteredBlocks.length === 1 ? 'bloco encontrado' : 'blocos encontrados'}</> : <>Atualização automática em <strong>08s</strong></>}</span></div><div className="pressure-legend"><span><i className="low" />Baixa</span><span><i className="medium" />Moderada</span><span><i className="high" />Alta</span><span><i className="critical" />Crítica</span></div></div>

      {filteredBlocks.length > 0 ? (
        <section className="blocks-grid">
          {filteredBlocks.map((block, index) => <BlockCard key={block.number} block={block} index={index} onSelect={setSelectedBlock} />)}
        </section>
      ) : (
        <div className="empty-search"><span>∅</span><h3>Nenhum bloco encontrado</h3><p>Tente buscar pelo número completo ou pelo endereço do validador.</p></div>
      )}
      {filteredBlocks.length > 0 && <div className="end-marker"><span /><p>Fim do intervalo carregado</p><span /></div>}
      <BlockDrawer block={selectedBlock} onClose={() => setSelectedBlock(null)} />
    </div>
  )
}
