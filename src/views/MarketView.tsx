import { ArrowIcon, BookIcon, ExternalIcon, MarketIcon } from '../components/Icons'

export function MarketView() {
  return (
    <div className="page page-market">
      <section className="page-heading market-heading">
        <div><span className="eyebrow"><i /> Ethereum intelligence</span><h1>Análise de mercado</h1><p>Os sinais que importam, traduzidos para decisões melhores.</p></div>
        <div className="issue-date"><span>Edição diária</span><strong>31 AGO · 2026</strong></div>
      </section>

      <section className="market-grid">
        <article className="market-story lead-story">
          <div className="story-art" aria-hidden="true">
            <div className="orbital orbital-one" /><div className="orbital orbital-two" /><div className="eth-gem hero"><i /></div>
            <div className="chart-trace"><svg viewBox="0 0 500 180" preserveAspectRatio="none"><path d="M0 152 C50 148 58 102 105 115 S165 140 206 78 S290 118 332 59 S407 77 500 17"/><path className="trace-glow" d="M0 152 C50 148 58 102 105 115 S165 140 206 78 S290 118 332 59 S407 77 500 17"/></svg></div>
          </div>
          <div className="story-content"><span className="story-tag">PANORAMA DA SEMANA</span><h2>Ethereum reencontra força enquanto a liquidez on-chain acelera</h2><p>Entradas em ETFs, atividade nas L2s e queda no saldo das exchanges formam uma estrutura construtiva — mas a volatilidade ainda pede atenção.</p><button className="text-link">Ler análise completa <ArrowIcon size={16} /></button></div>
          <div className="story-meta"><span>7 min de leitura</span><span>Equipe Cagimadu</span></div>
        </article>

        <article className="market-story fee-pulse">
          <div className="card-kicker"><span>FEE PULSE</span><i className="live-dot" /> AO VIVO</div>
          <div className="fee-pulse-main"><span>vs. bloco anterior</span><strong><em>+</em>11.3%</strong><p>24.60 <b>Gwei</b></p></div>
          <div className="mini-bars" aria-hidden="true">{[31,43,28,52,45,68,58,74,48,80,65,91].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
          <div className="pulse-footer"><span>Pressão atual <strong>Moderada</strong></span><button aria-label="Abrir fees"><ArrowIcon size={16} /></button></div>
        </article>

        <article className="market-story data-story">
          <div className="card-kicker"><span>NETWORK SNAPSHOT</span><MarketIcon size={17} /></div>
          <h3>A rede em números</h3>
          <div className="network-stat"><span>ETH</span><div><strong>$4.268,14</strong><small>+2.48% · 24h</small></div></div>
          <dl className="market-stats"><div><dt>TVL Ethereum</dt><dd>$91.4B</dd></div><div><dt>Gas médio</dt><dd>22.8 Gwei</dd></div><div><dt>ETH queimado · 24h</dt><dd>1,184.7</dd></div><div><dt>Blocos · 24h</dt><dd>7,128</dd></div></dl>
          <p className="source-line">Fonte: dados públicos Ethereum · mock</p>
        </article>

        <article className="market-story insight-story">
          <div className="insight-top"><span className="story-tag">LEITURA RÁPIDA</span><span>03</span></div>
          <BookIcon size={26} />
          <h3>O que o aumento do blob gas revela sobre a demanda das L2s?</h3>
          <p>O custo de publicação de dados voltou a subir. Entenda por que isso importa para rollups e para o burn de ETH.</p>
          <a href="https://ethereum.org/pt-br/roadmap/danksharding/" target="_blank" rel="noreferrer">Entender em 4 minutos <ExternalIcon size={15} /></a>
        </article>
      </section>

      <footer className="market-footer"><span>CAGIMADU BRIEF · #018</span><p>Curadoria independente sobre infraestrutura e economia da rede Ethereum.</p></footer>
    </div>
  )
}
