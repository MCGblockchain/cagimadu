import { useEffect, useRef, type ReactNode } from 'react'
import type { ViewId } from '../types'
import { BlocksIcon, CloseIcon, FeesIcon, MarketIcon, MenuIcon, SearchIcon } from './Icons'

const navItems: { id: ViewId; label: string; description: string; icon: typeof BlocksIcon }[] = [
  { id: 'blocks', label: 'Blocos', description: 'Explorador da rede', icon: BlocksIcon },
  { id: 'market', label: 'Análise de mercado', description: 'Inteligência Ethereum', icon: MarketIcon },
  { id: 'fees', label: 'Fees', description: 'Monitor em tempo real', icon: FeesIcon },
]

interface LayoutProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  menuOpen: boolean
  setMenuOpen: (value: boolean) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  children: ReactNode
}

export function Layout({ activeView, onNavigate, menuOpen, setMenuOpen, searchQuery, onSearchChange, children }: LayoutProps) {
  const activeLabel = navItems.find((item) => item.id === activeView)?.label
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (activeView === 'blocks' && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [activeView])

  return (
    <div className="app-shell">
      {menuOpen && <button className="menu-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand-row">
          <button className="brand" onClick={() => onNavigate('blocks')}>
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>cagimadu<span className="brand-dot">.</span></span>
          </button>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><CloseIcon /></button>
        </div>

        <p className="sidebar-label">Inteligência on-chain</p>
        <nav className="main-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const ItemIcon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => { onNavigate(item.id); setMenuOpen(false) }}
              >
                <span className="nav-icon"><ItemIcon size={19} /></span>
                <span className="nav-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                {item.id === 'fees' && <span className="live-mini">LIVE</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="network-card">
          <div className="network-card-head"><span className="eth-gem small"><i /></span><span><small>Rede ativa</small><strong>Ethereum</strong></span></div>
          <div className="network-row"><span><i className="status-dot" /> Mainnet</span><strong>12.1s</strong></div>
        </div>
        <p className="sidebar-foot">Ethereum RPC · MVP 0.2</p>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><MenuIcon /></button>
            <div className="breadcrumb"><span>Cagimadu</span><i>/</i><strong>{activeLabel}</strong></div>
          </div>
          <div className="topbar-actions">
            {activeView === 'blocks' && (
              <label className="search-field">
                <SearchIcon size={17} />
                <input ref={searchRef} value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar número ou validador" aria-label="Buscar bloco por número ou validador" />
                {searchQuery ? <button type="button" onClick={() => onSearchChange('')} aria-label="Limpar busca"><CloseIcon size={14} /></button> : <kbd>⌘ K</kbd>}
              </label>
            )}
            <div className="topbar-network"><i className="status-dot" /><span>ETH</span><strong>Mainnet</strong></div>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
