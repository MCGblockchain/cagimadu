import { useEffect, useMemo, useState } from 'react'
import { ActivityIcon, ClockIcon, FuelIcon, InfoIcon } from '../components/Icons'
import { BlockCard } from '../components/BlockCard'
import { BlockDrawer } from '../components/BlockDrawer'
import { blocks as mockBlocks } from '../data'
import { api } from '../services/api'
import type { ApiMeta, BlockData } from '../types'

interface BlocksViewProps {
  searchQuery: string
}

export function BlocksView({ searchQuery }: BlocksViewProps) {
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null)
  const [blockData, setBlockData] = useState<BlockData[]>([])
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const load = async () => {
      try {
        const response = await api.blocks(40, controller.signal)
        if (!active) return
        setBlockData(response.data)
        setMeta(response.meta)
        setUsingFallback(false)
        setError(null)
      } catch (loadError) {
        if (!active || controller.signal.aborted) return
        setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar os blocos.')
        setBlockData((current) => {
          if (current.length > 0) return current
          setUsingFallback(true)
          return mockBlocks
        })
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    const interval = window.setInterval(() => void load(), 12_000)
    return () => {
      active = false
      controller.abort()
      window.clearInterval(interval)
    }
  }, [reloadKey])

  const avgFee = useMemo(() => {
    const sample = blockData.slice(0, 12)
    return sample.length ? sample.reduce((sum, block) => sum + block.fee, 0) / sample.length : 0
  }, [blockData])

  const filteredBlocks = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase().replace(/[.#\s]/g, '')
    if (!normalized) return blockData
    return blockData.filter((block) =>
      block.number.toString().includes(normalized) ||
      block.number.toLocaleString('pt-BR').replace(/\./g, '').includes(normalized) ||
      block.validator.toLowerCase().includes(normalized),
    )
  }, [blockData, searchQuery])

  const latest = blockData[0]

  return (
    <div className="page page-blocks">
      <section className="page-heading">
        <div><span className="eyebrow"><i /> Ethereum mainnet · {usingFallback ? 'demonstração' : 'ao vivo'}</span><h1>Explorador de blocos</h1><p>Acompanhe fees, ocupação e pressão da rede a cada novo bloco.</p></div>
      </section>

      {(error || meta?.stale) && (
        <div className={`data-banner ${usingFallback ? 'error' : 'warning'}`}>
          <span><i />{usingFallback ? `${error} Exibindo dados demonstrativos.` : 'O provider está instável. Mantivemos o último dado válido.'}</span>
          <button onClick={() => { setLoading(true); setReloadKey((key) => key + 1) }}>Tentar novamente</button>
        </div>
      )}

      <section className="metric-strip" aria-label="Resumo da rede">
        <article><span className="metric-icon violet"><FuelIcon size={18} /></span><span><small>Fee média · 12 blocos</small><strong>{avgFee.toFixed(2)} <em>Gwei</em></strong></span><b className="positive">RPC</b></article>
        <article><span className="metric-icon green"><ClockIcon size={18} /></span><span><small>Tempo esperado</small><strong>12 <em>seg</em></strong></span><b>{loading ? 'atualizando' : 'estável'}</b></article>
        <article><span className="metric-icon orange"><ActivityIcon size={18} /></span><span><small>Pressão da rede</small><strong>{latest?.difficulty ?? '—'}</strong></span><b>{latest ? `${latest.utilization.toFixed(0)}%` : '—'}</b></article>
        <article className="metric-note"><InfoIcon size={17} /><p>Pressão combina ocupação do bloco e fee. Os dados são atualizados a cada bloco da Mainnet.</p></article>
      </section>

      <div className="section-toolbar"><div><h2>{searchQuery ? 'Resultado da busca' : 'Blocos recentes'}</h2><span>{searchQuery ? <><strong>{filteredBlocks.length}</strong> {filteredBlocks.length === 1 ? 'bloco encontrado' : 'blocos encontrados'}</> : <>{loading ? 'Consultando a rede…' : <>Atualizado às <strong>{meta ? new Date(meta.updatedAt).toLocaleTimeString('pt-BR') : '—'}</strong></>}</>}</span></div><div className="pressure-legend"><span><i className="low" />Baixa</span><span><i className="medium" />Moderada</span><span><i className="high" />Alta</span><span><i className="critical" />Crítica</span></div></div>

      {loading && blockData.length === 0 ? (
        <div className="loading-panel"><i /><span>Buscando os blocos mais recentes…</span></div>
      ) : filteredBlocks.length > 0 ? (
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
