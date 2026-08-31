import { useEffect, useState } from 'react'
import { Layout } from './components/Layout'
import type { ViewId } from './types'
import { BlocksView } from './views/BlocksView'
import { FeesView } from './views/FeesView'
import { MarketView } from './views/MarketView'

const viewFromHash = (): ViewId => {
  const value = window.location.hash.replace('#/', '')
  return value === 'market' || value === 'fees' ? value : 'blocks'
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>(viewFromHash)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleHash = () => setActiveView(viewFromHash())
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const navigate = (view: ViewId) => {
    window.location.hash = `/${view}`
    setActiveView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout activeView={activeView} onNavigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div key={activeView} className="view-enter">
        {activeView === 'blocks' && <BlocksView searchQuery={searchQuery} />}
        {activeView === 'market' && <MarketView />}
        {activeView === 'fees' && <FeesView />}
      </div>
    </Layout>
  )
}
