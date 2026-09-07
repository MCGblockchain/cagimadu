let PptxGenJS
try {
  PptxGenJS = require('pptxgenjs')
} catch {
  // Fallback used in the isolated build environment for this repository.
  PptxGenJS = require('/tmp/cagimadu-slide-tools/node_modules/pptxgenjs')
}
const path = require('path')

const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Equipe Cagimadu — Inteli Blockchain'
pptx.company = 'Cagimadu / Alphractal'
pptx.subject = 'MVP de monitoramento operacional de fees da Ethereum'
pptx.title = 'Cagimadu — Do dado on-chain à decisão operacional'
pptx.lang = 'pt-BR'
pptx.theme = {
  headFontFace: 'Ubuntu Sans',
  bodyFontFace: 'Ubuntu Sans',
  lang: 'pt-BR',
}
pptx.defineSlideMaster({
  title: 'CAGIMADU',
  background: { color: 'F5F4FA' },
  objects: [
    { line: { x: 0.45, y: 7.12, w: 12.43, h: 0, line: { color: 'DEDBE7', width: 0.7 } } },
    { text: { text: 'CAGIMADU  /  ETHEREUM FEE INTELLIGENCE', options: { x: 0.45, y: 7.18, w: 4.8, h: 0.14, fontFace: 'Noto Sans Mono', fontSize: 5.8, color: '8A8494', charSpacing: 1.2, margin: 0 } } },
  ],
  slideNumber: { x: 12.55, y: 7.15, w: 0.32, h: 0.18, color: '8A8494', fontFace: 'Noto Sans Mono', fontSize: 6.5, align: 'right', margin: 0 },
})

const S = pptx.ShapeType
const C = {
  bg: 'F5F4FA', paper: 'FFFFFF', ink: '16131D', muted: '706B79', faint: '95909F',
  violet: '7B3FF2', violet2: 'A87EFF', violetLight: 'EFE8FF', violetPale: 'F7F2FF',
  border: 'DCD8E5', green: '00A47A', greenLight: 'E6F7F2', orange: 'C87919', orangeLight: 'FFF1DE',
  red: 'DB4863', redLight: 'FDE9ED', navy: '211833', dark: '0E0B14', dark2: '1A1423',
}
const FONT = 'Ubuntu Sans'
const MONO = 'Noto Sans Mono'
const W = 13.333
const H = 7.5

const root = __dirname
const imgBlocks = path.join(root, 'screenshots', 'blocos-live.png')
const imgFees = path.join(root, 'screenshots', 'fees-live.png')
const imgMarket = path.join(root, 'screenshots', 'mercado.png')

function slideBase(section, index) {
  const slide = pptx.addSlide('CAGIMADU')
  slide.background = { color: C.bg }
  if (section) {
    slide.addText(section.toUpperCase(), { x: 0.48, y: 0.33, w: 4.4, h: 0.2, fontFace: MONO, fontSize: 7.5, bold: true, color: C.violet, charSpacing: 1.5, margin: 0 })
    slide.addShape(S.ellipse, { x: 0.48, y: 0.62, w: 0.055, h: 0.055, fill: { color: C.violet }, line: { color: C.violet } })
  }
  if (index) slide.addText(String(index).padStart(2, '0'), { x: 12.38, y: 0.32, w: 0.48, h: 0.2, fontFace: MONO, fontSize: 7.5, color: C.faint, align: 'right', margin: 0 })
  return slide
}

function brand(slide, x = 0.48, y = 0.34, scale = 1) {
  const sq = 0.13 * scale
  const gap = 0.025 * scale
  const coords = [[0, 0], [sq + gap, 0], [sq + gap, sq + gap]]
  coords.forEach(([dx, dy], i) => slide.addShape(S.rect, {
    x: x + dx, y: y + dy, w: sq, h: sq,
    fill: { color: i === 1 ? C.violet : C.violet2, transparency: i === 2 ? 8 : 0 },
    line: { color: i === 1 ? C.violet : C.violet2, transparency: 100 },
    rotate: i === 0 ? -3 : i === 2 ? 2 : 0,
  }))
  slide.addText('cagimadu', { x: x + 0.39 * scale, y: y - 0.005, w: 1.55 * scale, h: 0.25 * scale, fontFace: FONT, fontSize: 15 * scale, bold: true, color: C.ink, margin: 0, breakLine: false })
  slide.addText('.', { x: x + 1.58 * scale, y: y - 0.01, w: 0.16 * scale, h: 0.25 * scale, fontFace: FONT, fontSize: 16 * scale, bold: true, color: C.violet, margin: 0 })
}

function title(slide, kicker, heading, sub) {
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.52, y: 0.72, w: 4.7, h: 0.22, fontFace: MONO, fontSize: 8, color: C.violet, bold: true, charSpacing: 1.4, margin: 0 })
  slide.addText(heading, { x: 0.5, y: 1.02, w: 12.2, h: 0.62, fontFace: FONT, fontSize: 28, bold: true, color: C.ink, breakLine: false, margin: 0, fit: 'shrink' })
  if (sub) slide.addText(sub, { x: 0.52, y: 1.69, w: 11.7, h: 0.42, fontFace: FONT, fontSize: 14, color: C.muted, margin: 0, fit: 'shrink' })
}

function rounded(slide, x, y, w, h, fill = C.paper, border = C.border, radius = 0.08) {
  slide.addShape(S.roundRect, { x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: border, width: 0.8 } })
}

function chip(slide, text, x, y, w, color = C.violet, fill = C.violetLight) {
  slide.addShape(S.roundRect, { x, y, w, h: 0.28, rectRadius: 0.08, fill: { color: fill }, line: { color: fill } })
  slide.addText(text.toUpperCase(), { x: x + 0.08, y: y + 0.065, w: w - 0.16, h: 0.12, fontFace: MONO, fontSize: 6.2, bold: true, color, charSpacing: 0.7, align: 'center', margin: 0 })
}

function callout(slide, n, heading, body, x, y, w, color = C.violet) {
  slide.addText(String(n).padStart(2, '0'), { x, y, w: 0.42, h: 0.25, fontFace: MONO, fontSize: 8, bold: true, color, margin: 0 })
  slide.addShape(S.line, { x: x + 0.02, y: y + 0.34, w: w - 0.02, h: 0, line: { color: C.border, width: 0.8 } })
  slide.addText(heading, { x, y: y + 0.48, w, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: C.ink, margin: 0, fit: 'shrink' })
  slide.addText(body, { x, y: y + 0.98, w, h: 0.72, fontFace: FONT, fontSize: 13, color: C.muted, breakLine: false, margin: 0.01, valign: 'top', fit: 'shrink' })
}

function kpi(slide, value, label, x, y, w, accent = C.violet, note = '') {
  rounded(slide, x, y, w, 1.12, C.paper)
  slide.addShape(S.rect, { x, y, w: 0.055, h: 1.12, fill: { color: accent }, line: { color: accent } })
  slide.addText(value, { x: x + 0.2, y: y + 0.17, w: w - 0.35, h: 0.38, fontFace: MONO, fontSize: 20, bold: true, color: C.ink, margin: 0, fit: 'shrink' })
  slide.addText(label, { x: x + 0.2, y: y + 0.63, w: w - 0.35, h: 0.22, fontFace: FONT, fontSize: 10.5, bold: true, color: C.muted, margin: 0, fit: 'shrink' })
  if (note) slide.addText(note, { x: x + 0.2, y: y + 0.89, w: w - 0.35, h: 0.12, fontFace: MONO, fontSize: 7, color: C.faint, margin: 0, fit: 'shrink' })
}

function flowNode(slide, x, y, w, h, eyebrow, heading, body, accent = C.violet, dark = false) {
  rounded(slide, x, y, w, h, dark ? C.dark2 : C.paper, dark ? '3B2D50' : C.border)
  slide.addShape(S.rect, { x, y, w: 0.055, h, fill: { color: accent }, line: { color: accent } })
  slide.addText(eyebrow.toUpperCase(), { x: x + 0.18, y: y + 0.18, w: w - 0.33, h: 0.15, fontFace: MONO, fontSize: 6, color: accent, bold: true, charSpacing: 0.8, margin: 0 })
  slide.addText(heading, { x: x + 0.18, y: y + 0.43, w: w - 0.33, h: 0.28, fontFace: FONT, fontSize: 14.5, bold: true, color: dark ? 'FFFFFF' : C.ink, margin: 0, fit: 'shrink' })
  slide.addText(body, { x: x + 0.18, y: y + 0.83, w: w - 0.33, h: h - 0.98, fontFace: FONT, fontSize: 10.5, color: dark ? 'BDB4CA' : C.muted, margin: 0, fit: 'shrink', valign: 'top' })
}

function arrow(slide, x1, y1, x2, y2, color = C.violet) {
  slide.addShape(S.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width: 1.5, endArrowType: 'triangle' } })
}

function browserFrame(slide, imagePath, x, y, w, h, label, live = false) {
  slide.addShape(S.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.paper }, line: { color: 'CFCAD9', width: 1 }, shadow: { type: 'outer', color: '8E849E', opacity: 0.18, blur: 3, angle: 45, distance: 2 } })
  slide.addShape(S.roundRect, { x: x + 0.04, y: y + 0.04, w: w - 0.08, h: 0.34, rectRadius: 0.06, fill: { color: 'F2F0F6' }, line: { color: 'F2F0F6' } })
  ;['DB4863', 'E2A33A', '00A47A'].forEach((c, i) => slide.addShape(S.ellipse, { x: x + 0.16 + i * 0.16, y: y + 0.15, w: 0.07, h: 0.07, fill: { color: c }, line: { color: c } }))
  slide.addText(label, { x: x + 0.65, y: y + 0.115, w: 2.8, h: 0.13, fontFace: MONO, fontSize: 5.8, color: C.muted, margin: 0 })
  if (live) chip(slide, 'mainnet live', x + w - 1.3, y + 0.075, 1.08, C.green, C.greenLight)
  slide.addImage({ path: imagePath, x: x + 0.04, y: y + 0.4, w: w - 0.08, h: h - 0.44 })
}

// 01 — Cover
{
  const slide = pptx.addSlide()
  slide.background = { color: C.bg }
  slide.addShape(S.rect, { x: 8.25, y: 0, w: 5.083, h: H, fill: { color: C.dark }, line: { color: C.dark } })
  for (let i = 0; i < 8; i++) {
    slide.addShape(S.line, { x: 8.25 + i * 0.72, y: 0, w: 0, h: H, line: { color: '211A2C', width: 0.5, transparency: 25 } })
  }
  for (let i = 0; i < 11; i++) {
    slide.addShape(S.line, { x: 8.25, y: i * 0.72, w: 5.083, h: 0, line: { color: '211A2C', width: 0.5, transparency: 25 } })
  }
  brand(slide, 0.65, 0.62, 1.2)
  slide.addText('ETHEREUM FEE INTELLIGENCE', { x: 0.68, y: 1.62, w: 4.4, h: 0.22, fontFace: MONO, fontSize: 8, bold: true, color: C.violet, charSpacing: 1.7, margin: 0 })
  slide.addText('Do dado on-chain\nà decisão operacional.', { x: 0.62, y: 2.05, w: 7.2, h: 1.55, fontFace: FONT, fontSize: 34, bold: true, color: C.ink, breakLine: false, margin: 0, fit: 'shrink' })
  slide.addText('Monitoramento em tempo real de custos de taxa na Ethereum — um MVP construído para transformar telemetria bruta em ação.', { x: 0.68, y: 3.95, w: 6.75, h: 0.84, fontFace: FONT, fontSize: 15, color: C.muted, margin: 0, fit: 'shrink' })
  chip(slide, 'MVP validado', 0.68, 5.15, 1.5, C.green, C.greenLight)
  chip(slide, 'Ethereum Mainnet', 2.35, 5.15, 1.78)
  chip(slide, 'MIT', 4.3, 5.15, 0.68, C.violet, C.violetLight)
  slide.addText('Equipe Cagimadu  •  Inteli Blockchain  •  Parceiro Alphractal', { x: 0.68, y: 6.52, w: 6.9, h: 0.25, fontFace: FONT, fontSize: 9.5, color: C.faint, margin: 0 })
  slide.addText('03 SET 2026', { x: 0.68, y: 6.87, w: 1.4, h: 0.16, fontFace: MONO, fontSize: 6.5, color: C.faint, margin: 0 })

  // Abstract live-network artwork
  const cx = 10.76, cy = 3.58
  ;[[0, -1.34], [-1.25, -0.42], [1.18, -0.62], [-1.52, 1.0], [1.48, 0.85], [0.15, 1.55]].forEach(([dx, dy], i) => {
    slide.addShape(S.line, { x: cx, y: cy, w: dx, h: dy, line: { color: i % 2 ? C.violet2 : C.green, transparency: 45, width: 1.2 } })
    slide.addShape(S.ellipse, { x: cx + dx - 0.07, y: cy + dy - 0.07, w: 0.14, h: 0.14, fill: { color: i % 2 ? C.violet2 : C.green }, line: { color: 'FFFFFF', transparency: 100 }, shadow: { type: 'outer', color: i % 2 ? C.violet2 : C.green, opacity: 0.3, blur: 4, angle: 0, distance: 0 } })
  })
  slide.addShape(S.hexagon, { x: cx - 0.76, y: cy - 0.68, w: 1.52, h: 1.36, fill: { color: C.violet, transparency: 6 }, line: { color: C.violet2, width: 1.2 } })
  slide.addShape(S.chevron, { x: cx - 0.28, y: cy - 0.36, w: 0.56, h: 0.72, rotate: 90, fill: { color: 'FFFFFF', transparency: 5 }, line: { color: 'FFFFFF', transparency: 100 } })
  slide.addText('LIVE', { x: 9.87, y: 5.65, w: 1.8, h: 0.25, fontFace: MONO, fontSize: 8, bold: true, color: C.green, align: 'center', charSpacing: 2.8, margin: 0 })
  slide.addText('MAINNET  /  ~12s', { x: 9.6, y: 6.05, w: 2.35, h: 0.2, fontFace: MONO, fontSize: 6.5, color: '9E91B2', align: 'center', charSpacing: 1.2, margin: 0 })
}

// 02 — Executive thesis
{
  const slide = slideBase('visão executiva', 2)
  title(slide, 'A tese', 'O usuário não precisa de mais um dado.\nPrecisa saber o que fazer agora.', 'Cagimadu converte o estado bruto da rede Ethereum em uma leitura operacional: custo, pressão e momento de execução.')
  const y = 2.72
  callout(slide, 1, 'Observar', 'Blocos, base fee, priority fee e ocupação chegam da Mainnet em ciclos próximos ao tempo de bloco.', 0.65, y, 3.42, C.violet)
  arrow(slide, 4.25, y + 0.86, 4.82, y + 0.86, C.border)
  callout(slide, 2, 'Traduzir', 'A API normaliza os dados, calcula a fee recomendada e classifica a pressão da rede.', 4.95, y, 3.42, C.green)
  arrow(slide, 8.55, y + 0.86, 9.12, y + 0.86, C.border)
  callout(slide, 3, 'Decidir', 'O painel estima o custo por operação e dá contexto para executar, aguardar ou monitorar.', 9.25, y, 3.42, C.orange)
  rounded(slide, 0.65, 5.45, 12.02, 1.02, C.navy, C.navy)
  slide.addText('MÉTRICA NORTEADORA', { x: 0.95, y: 5.72, w: 2.1, h: 0.16, fontFace: MONO, fontSize: 6.5, bold: true, color: C.violet2, charSpacing: 1.1, margin: 0 })
  slide.addText('decisões operacionais tomadas com confiança', { x: 3.0, y: 5.62, w: 6.6, h: 0.33, fontFace: FONT, fontSize: 17, bold: true, color: 'FFFFFF', margin: 0, fit: 'shrink' })
  slide.addText('não apenas visualizações consumidas', { x: 9.74, y: 5.72, w: 2.45, h: 0.18, fontFace: FONT, fontSize: 8.5, italic: true, color: 'BDB4CA', align: 'right', margin: 0 })
}

// 03 — Problem
{
  const slide = slideBase('negócio', 3)
  title(slide, 'O problema', 'Médias históricas descrevem o passado.\nA execução acontece no próximo bloco.', 'A EIP-1559 reprecifica a base fee bloco a bloco; a janela operacional muda em segundos, enquanto o custo do erro é assimétrico.')
  const axisY = 3.56
  slide.addShape(S.line, { x: 0.85, y: axisY, w: 11.65, h: 0, line: { color: C.border, width: 2 } })
  const points = [0.9, 3.7, 6.45, 9.2, 12.0]
  const labels = [
    ['MÉDIA', '24h', 'suaviza o sinal'],
    ['BLOCO', '~12s', 'novo estado'],
    ['PICO', '+12,5%', 'ajuste possível'],
    ['ORDEM', 'agora', 'decisão real'],
    ['CUSTO', 'assimétrico', 'errar custa'],
  ]
  points.forEach((x, i) => {
    const accent = i === 3 ? C.green : i === 4 ? C.red : C.violet
    slide.addShape(S.ellipse, { x: x - 0.09, y: axisY - 0.09, w: 0.18, h: 0.18, fill: { color: accent }, line: { color: C.paper, width: 1.5 } })
    slide.addText(labels[i][0], { x: x - 0.55, y: axisY - 0.62, w: 1.1, h: 0.16, fontFace: MONO, fontSize: 6.5, bold: true, color: accent, align: 'center', margin: 0 })
    slide.addText(labels[i][1], { x: x - 0.7, y: axisY + 0.28, w: 1.4, h: 0.32, fontFace: MONO, fontSize: i === 4 ? 12 : 16, bold: true, color: C.ink, align: 'center', margin: 0, fit: 'shrink' })
    slide.addText(labels[i][2], { x: x - 0.78, y: axisY + 0.73, w: 1.56, h: 0.24, fontFace: FONT, fontSize: 7.5, color: C.muted, align: 'center', margin: 0 })
  })
  rounded(slide, 0.85, 5.22, 11.65, 1.05, C.paper)
  slide.addText('A pergunta muda', { x: 1.15, y: 5.52, w: 1.55, h: 0.22, fontFace: FONT, fontSize: 11, bold: true, color: C.muted, margin: 0 })
  slide.addText('“quanto custou?”', { x: 3.15, y: 5.43, w: 2.25, h: 0.35, fontFace: FONT, fontSize: 17, color: C.faint, strike: true, margin: 0 })
  arrow(slide, 5.62, 5.62, 6.52, 5.62, C.violet)
  slide.addText('“quanto custa agora — e vale executar?”', { x: 6.8, y: 5.39, w: 4.95, h: 0.44, fontFace: FONT, fontSize: 18, bold: true, color: C.ink, margin: 0, fit: 'shrink' })
}

// 04 — Business fit
{
  const slide = slideBase('negócio', 4)
  title(slide, 'Encaixe estratégico', 'Mais densidade de valor para uma plataforma que já tem escala.', 'O módulo complementa a Alphractal: usa a cobertura existente e adiciona a camada operacional que ainda falta.')
  kpi(slide, '1.500+', 'métricas na plataforma', 0.62, 2.38, 2.75, C.violet, 'on-chain • macro • mercado')
  kpi(slide, '1.000+', 'endpoints documentados', 3.57, 2.38, 2.75, C.green, 'base pronta para integrar')
  kpi(slide, '1–5 min', 'cadência institucional', 6.52, 2.38, 2.75, C.orange, 'linha de base do produto')
  kpi(slide, '~12 s', 'cadência do módulo', 9.47, 2.38, 2.75, C.violet, 'até 25× mais frequente')
  rounded(slide, 0.62, 3.93, 5.75, 2.08, C.paper)
  chip(slide, 'já existe', 0.92, 4.22, 1.05, C.muted, 'EEEAF2')
  slide.addText('FeeMean / FeeMed / FeeTot', { x: 0.92, y: 4.72, w: 4.7, h: 0.35, fontFace: MONO, fontSize: 15, bold: true, color: C.ink, margin: 0, fit: 'shrink' })
  slide.addText('Agregados históricos, preço em moeda nativa e USD, alertas e dashboards.', { x: 0.92, y: 5.25, w: 4.75, h: 0.42, fontFace: FONT, fontSize: 10, color: C.muted, margin: 0, fit: 'shrink' })
  rounded(slide, 6.62, 3.93, 5.6, 2.08, C.navy, C.navy)
  chip(slide, 'cagimadu adiciona', 6.92, 4.22, 1.7, C.violet2, '35264B')
  slide.addText('Fee recomendada + pressão + custo', { x: 6.92, y: 4.72, w: 4.72, h: 0.35, fontFace: MONO, fontSize: 14.5, bold: true, color: 'FFFFFF', margin: 0, fit: 'shrink' })
  slide.addText('Uma leitura acionável do próximo movimento — pronta para alimentar o ecossistema de alertas existente.', { x: 6.92, y: 5.25, w: 4.72, h: 0.42, fontFace: FONT, fontSize: 10, color: 'C9C0D3', margin: 0, fit: 'shrink' })
}

// 05 — Solution pillars
{
  const slide = slideBase('produto', 5)
  title(slide, 'A solução', 'Quatro capacidades, uma decisão mais clara.', 'O MVP organiza a complexidade da rede em camadas progressivas: ver, entender, estimar e agir.')
  const cards = [
    ['01', 'Explorar blocos', 'Fee, ocupação, transações, validador e pressão por bloco.', C.violet],
    ['02', 'Monitorar fees', 'Fee recomendada, decomposição e histórico recente.', C.green],
    ['03', 'Simular operações', 'Custo estimado de transferência, swap e mint de NFT.', C.orange],
    ['04', 'Contextualizar', 'Sinais de rede traduzidos em linguagem operacional.', C.violet2],
  ]
  cards.forEach((c, i) => {
    const x = 0.62 + i * 3.04
    rounded(slide, x, 2.42, 2.75, 3.3, i === 3 ? C.navy : C.paper, i === 3 ? C.navy : C.border)
    slide.addText(c[0], { x: x + 0.25, y: 2.72, w: 0.45, h: 0.24, fontFace: MONO, fontSize: 8, bold: true, color: c[3], margin: 0 })
    slide.addShape(S.ellipse, { x: x + 0.25, y: 3.22, w: 0.6, h: 0.6, fill: { color: c[3], transparency: 86 }, line: { color: c[3], transparency: 55, width: 1 } })
    slide.addShape(i === 0 ? S.cube : i === 1 ? S.lineInv : i === 2 ? S.lightningBolt : S.diamond, { x: x + 0.42, y: 3.39, w: 0.26, h: 0.26, fill: { color: c[3] }, line: { color: c[3] } })
    slide.addText(c[1], { x: x + 0.25, y: 4.17, w: 2.15, h: 0.45, fontFace: FONT, fontSize: 16, bold: true, color: i === 3 ? 'FFFFFF' : C.ink, margin: 0, fit: 'shrink' })
    slide.addText(c[2], { x: x + 0.25, y: 4.78, w: 2.15, h: 0.65, fontFace: FONT, fontSize: 12.5, color: i === 3 ? 'C9C0D3' : C.muted, margin: 0, fit: 'shrink', valign: 'top' })
  })
}

// 06 — Architecture flow
{
  const slide = slideBase('arquitetura', 6)
  title(slide, 'Fluxo ponta a ponta', 'Da Mainnet ao insight, com contratos claros entre as camadas.', 'A separação em serviços, controllers e cliente HTTP mantém a regra de negócio fora da interface e facilita a evolução.')
  const y = 2.6
  flowNode(slide, 0.55, y, 2.0, 2.55, 'fonte', 'Ethereum Mainnet', 'Blocos + eth_feeHistory\nvia JSON-RPC', C.green, true)
  arrow(slide, 2.64, y + 1.28, 3.08, y + 1.28)
  flowNode(slide, 3.16, y, 2.0, 2.55, 'acesso', 'Viem service', 'Consulta, normalização, cálculos e amostragem.', C.violet)
  arrow(slide, 5.25, y + 1.28, 5.69, y + 1.28)
  flowNode(slide, 5.77, y, 2.0, 2.55, 'proteção', 'Cache resiliente', 'TTL + deduplicação + último valor válido.', C.orange)
  arrow(slide, 7.86, y + 1.28, 8.30, y + 1.28)
  flowNode(slide, 8.38, y, 2.0, 2.55, 'contrato', 'API REST', 'Zod → controller → envelope { data, meta }.', C.violet)
  arrow(slide, 10.47, y + 1.28, 10.91, y + 1.28)
  flowNode(slide, 10.99, y, 1.8, 2.55, 'experiência', 'React + D3', 'Blocos, Fees e Mercado.', C.green, true)
  rounded(slide, 1.33, 5.56, 10.66, 0.68, C.paper)
  slide.addText('↓ feedback operacional', { x: 1.62, y: 5.78, w: 2.35, h: 0.16, fontFace: MONO, fontSize: 7, color: C.violet, bold: true, margin: 0 })
  slide.addText('Atualização periódica  •  estado de cache visível  •  fallback identificado  •  erros estruturados', { x: 4.05, y: 5.72, w: 7.2, h: 0.25, fontFace: FONT, fontSize: 9.5, color: C.muted, margin: 0, fit: 'shrink' })
}

// 07 — Stack
{
  const slide = slideBase('engenharia', 7)
  title(slide, 'Stack do MVP', 'Escolhas enxutas para entregar rápido — sem perder separação de responsabilidades.', 'TypeScript atravessa todo o produto; cada tecnologia tem um papel simples e explícito.')
  const columns = [
    ['FRONTEND', 'React', 'Vite', 'TypeScript', 'D3', C.violet],
    ['BACKEND', 'Node.js', 'Express', 'TypeScript', 'Viem', C.green],
    ['QUALIDADE', 'Zod', 'Vitest', 'Supertest', 'ESLint', C.orange],
    ['OPERAÇÃO', 'Render', 'PublicNode', 'Cache RAM', 'MIT', C.violet2],
  ]
  columns.forEach((col, i) => {
    const x = 0.62 + i * 3.04
    rounded(slide, x, 2.45, 2.75, 3.55, C.paper)
    slide.addText(col[0], { x: x + 0.25, y: 2.76, w: 2.2, h: 0.2, fontFace: MONO, fontSize: 7, bold: true, color: col[5], charSpacing: 1.1, margin: 0 })
    col.slice(1, 5).forEach((item, j) => {
      slide.addShape(S.ellipse, { x: x + 0.25, y: 3.3 + j * 0.61, w: 0.10, h: 0.10, fill: { color: col[5] }, line: { color: col[5] } })
      slide.addText(item, { x: x + 0.49, y: 3.19 + j * 0.61, w: 1.85, h: 0.29, fontFace: j === 2 ? MONO : FONT, fontSize: 13, bold: j === 0, color: C.ink, margin: 0, fit: 'shrink' })
    })
    slide.addShape(S.line, { x: x + 0.25, y: 5.72, w: 2.2, h: 0, line: { color: C.border, width: 0.8 } })
  })
  slide.addText('Princípio: trocar provider, rede ou camada de entrega sem reescrever a experiência.', { x: 1.35, y: 6.31, w: 10.65, h: 0.35, fontFace: FONT, fontSize: 13.5, bold: true, color: C.ink, align: 'center', margin: 0, fit: 'shrink' })
}

// 08 — API
{
  const slide = slideBase('api', 8)
  title(slide, 'Contrato de integração', 'Quatro endpoints para ler blocos e custos de execução.', 'Validação de entrada via Zod, respostas consistentes e metadados que tornam cache e obsolescência observáveis.')
  const endpoints = [
    ['GET', '/api/blocks?limit=40', 'blocos recentes', C.violet],
    ['GET', '/api/blocks/:number', 'detalhe do bloco', C.violet2],
    ['GET', '/api/fees/current', 'fee recomendada agora', C.green],
    ['GET', '/api/fees/history?blocks=300', 'série histórica', C.orange],
  ]
  endpoints.forEach((e, i) => {
    const y = 2.43 + i * 0.79
    rounded(slide, 0.62, y, 6.25, 0.62, C.paper)
    chip(slide, e[0], 0.79, y + 0.16, 0.62, e[3], e[3] === C.green ? C.greenLight : e[3] === C.orange ? C.orangeLight : C.violetLight)
    slide.addText(e[1], { x: 1.58, y: y + 0.15, w: 3.55, h: 0.22, fontFace: MONO, fontSize: 10.5, bold: true, color: C.ink, margin: 0, fit: 'shrink' })
    slide.addText(e[2], { x: 5.12, y: y + 0.16, w: 1.44, h: 0.2, fontFace: FONT, fontSize: 9.5, color: C.muted, align: 'right', margin: 0, fit: 'shrink' })
  })
  rounded(slide, 7.15, 2.43, 5.56, 3.77, C.dark, C.dark)
  slide.addText('RESPONSE ENVELOPE', { x: 7.47, y: 2.75, w: 2.5, h: 0.16, fontFace: MONO, fontSize: 6.5, color: C.violet2, bold: true, charSpacing: 1.1, margin: 0 })
  const code = [
    { text: '{\n', options: { color: 'A9A2B4' } },
    { text: '  "data"', options: { color: 'C8A9FF', bold: true } },
    { text: ': { ... },\n', options: { color: 'FFFFFF' } },
    { text: '  "meta"', options: { color: '8DE4C7', bold: true } },
    { text: ': {\n', options: { color: 'FFFFFF' } },
    { text: '    "source": "ethereum-rpc",\n    "cached": false,\n    "stale": false,\n    "updatedAt": "..."\n', options: { color: 'C9C0D3' } },
    { text: '  }\n}', options: { color: 'A9A2B4' } },
  ]
  slide.addText(code, { x: 7.47, y: 3.22, w: 4.55, h: 2.05, fontFace: MONO, fontSize: 11.5, breakLine: false, margin: 0.04, fit: 'shrink' })
  slide.addText('O envelope preserva contexto operacional; uma camada adaptadora alinha o formato ao padrão da Alphractal.', { x: 7.47, y: 5.55, w: 4.55, h: 0.38, fontFace: FONT, fontSize: 9, color: 'C9C0D3', margin: 0, fit: 'shrink' })
}

// 09 — Rules and calculations
{
  const slide = slideBase('regras de negócio', 9)
  title(slide, 'Do dado bruto ao insight', 'Cálculos simples, transparentes e auditáveis.', 'O valor do módulo está menos em “prever” e mais em tornar explícito como cada número vira uma decisão.')
  rounded(slide, 0.62, 2.42, 4.05, 3.65, C.navy, C.navy)
  chip(slide, 'fee recomendada', 0.92, 2.76, 1.42, C.violet2, '35264B')
  slide.addText('base fee\n+\npriority fee p50', { x: 1.0, y: 3.35, w: 3.25, h: 1.42, fontFace: MONO, fontSize: 20, bold: true, color: 'FFFFFF', align: 'center', valign: 'mid', margin: 0, fit: 'shrink' })
  slide.addShape(S.line, { x: 1.45, y: 4.47, w: 2.35, h: 0, line: { color: C.violet2, width: 1.5 } })
  slide.addText('Gwei', { x: 1.76, y: 5.2, w: 1.7, h: 0.3, fontFace: MONO, fontSize: 13, color: C.violet2, align: 'center', margin: 0 })

  rounded(slide, 4.92, 2.42, 3.63, 1.7, C.paper)
  slide.addText('Custo da operação', { x: 5.22, y: 2.76, w: 2.7, h: 0.25, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, margin: 0 })
  slide.addText('fee × gas × 10⁻⁹', { x: 5.22, y: 3.25, w: 2.68, h: 0.35, fontFace: MONO, fontSize: 15, bold: true, color: C.violet, margin: 0 })
  slide.addText('resultado em ETH', { x: 5.22, y: 3.68, w: 2.68, h: 0.16, fontFace: FONT, fontSize: 8, color: C.muted, margin: 0 })

  rounded(slide, 4.92, 4.37, 3.63, 1.7, C.paper)
  slide.addText('Pressão da rede', { x: 5.22, y: 4.72, w: 2.7, h: 0.25, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, margin: 0 })
  slide.addText('ocupação + fee', { x: 5.22, y: 5.18, w: 2.68, h: 0.35, fontFace: MONO, fontSize: 15, bold: true, color: C.green, margin: 0 })
  slide.addText('Baixa  •  Moderada  •  Alta  •  Crítica', { x: 5.22, y: 5.64, w: 2.78, h: 0.16, fontFace: FONT, fontSize: 7.5, color: C.muted, margin: 0, fit: 'shrink' })

  rounded(slide, 8.8, 2.42, 3.91, 3.65, C.paper)
  slide.addText('Um exemplo real', { x: 9.1, y: 2.76, w: 3.1, h: 0.26, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, margin: 0 })
  const rows = [['Fee', '0,2040 Gwei'], ['Transferência', '0,00000428 ETH'], ['Swap', '0,00003060 ETH'], ['Mint NFT', '0,00002040 ETH']]
  rows.forEach((r, i) => {
    const yy = 3.28 + i * 0.58
    slide.addText(r[0], { x: 9.1, y: yy, w: 1.35, h: 0.18, fontFace: FONT, fontSize: 10, color: C.muted, margin: 0 })
    slide.addText(r[1], { x: 10.3, y: yy - 0.02, w: 1.92, h: 0.2, fontFace: MONO, fontSize: 10, bold: true, color: i === 0 ? C.violet : C.ink, align: 'right', margin: 0, fit: 'shrink' })
    if (i < rows.length - 1) slide.addShape(S.line, { x: 9.1, y: yy + 0.34, w: 3.12, h: 0, line: { color: C.border, width: 0.6 } })
  })
  chip(slide, 'aritmética validada', 9.1, 5.6, 1.75, C.green, C.greenLight)
}

// 10 — Resilience
{
  const slide = slideBase('confiabilidade', 10)
  title(slide, 'Resiliência por desenho', 'Falhar com contexto é melhor do que falhar em silêncio.', 'A experiência distingue dados frescos, cacheados, obsoletos e demonstrativos — mantendo transparência com o usuário.')
  const x = 0.67, y = 2.75
  flowNode(slide, x, y, 2.18, 2.2, 'entrada', 'Requisição', 'Frontend pede blocos ou fees.', C.violet)
  arrow(slide, 2.94, y + 1.1, 3.42, y + 1.1)
  flowNode(slide, 3.5, y, 2.18, 2.2, 'decisão', 'Cache', 'Fresco? responde.\nEm voo? compartilha.', C.green)
  arrow(slide, 5.77, y + 1.1, 6.25, y + 1.1)
  flowNode(slide, 6.33, y, 2.18, 2.2, 'origem', 'Provider RPC', 'Consulta a Mainnet com timeout.', C.orange)
  arrow(slide, 8.6, y + 1.1, 9.08, y + 1.1)
  flowNode(slide, 9.16, y, 3.45, 2.2, 'saída', 'Resposta consciente', 'fresh → cached → stale\nsem histórico → demo identificado', C.violet, true)
  const badges = [
    ['TTL', '10–12 s', C.violet, C.violetLight],
    ['DEDUP', '1 consulta concorrente', C.green, C.greenLight],
    ['STALE', 'último valor válido', C.orange, C.orangeLight],
    ['ERROR', 'contrato estruturado', C.red, C.redLight],
  ]
  badges.forEach((b, i) => {
    const xx = 1.05 + i * 2.95
    rounded(slide, xx, 5.55, 2.55, 0.62, b[3], b[3])
    slide.addText(b[0], { x: xx + 0.16, y: 5.76, w: 0.68, h: 0.14, fontFace: MONO, fontSize: 6.3, bold: true, color: b[2], margin: 0 })
    slide.addText(b[1], { x: xx + 0.8, y: 5.73, w: 1.52, h: 0.18, fontFace: FONT, fontSize: 8, bold: true, color: C.ink, align: 'right', margin: 0, fit: 'shrink' })
  })
}

// 11 — Documentation
{
  const slide = slideBase('documentação', 11)
  title(slide, 'Conhecimento que fica', 'O código entrega o MVP. A documentação reduz o custo da próxima decisão.', 'Negócio, arquitetura, validação e rastreabilidade foram organizados como um conjunto conectado — não como anexos isolados.')
  const docs = [
    ['01', 'Análise de negócios', 'Mercado, personas, proposta de valor, canvas, SWOT, KPIs, riscos e viabilidade.', 'docs/analise-de-negocios.md', C.violet],
    ['02', 'Documentação técnica', 'Arquitetura, camadas, regras, contratos, cache, frontend e pontos de extensão.', 'docs/documentacao-tecnica.md', C.green],
    ['03', 'Validação técnica', 'Build, lint, testes, endpoints reais, cálculos independentes e lacunas do TAP.', 'docs/validacao/relatorio-de-validacao-tecnica.md', C.orange],
  ]
  docs.forEach((d, i) => {
    const y = 2.43 + i * 1.2
    rounded(slide, 0.62, y, 8.28, 0.96, C.paper)
    slide.addText(d[0], { x: 0.88, y: y + 0.26, w: 0.45, h: 0.22, fontFace: MONO, fontSize: 8, bold: true, color: d[4], margin: 0 })
    slide.addText(d[1], { x: 1.45, y: y + 0.17, w: 2.4, h: 0.26, fontFace: FONT, fontSize: 13.5, bold: true, color: C.ink, margin: 0, fit: 'shrink' })
    slide.addText(d[2], { x: 3.92, y: y + 0.14, w: 4.58, h: 0.34, fontFace: FONT, fontSize: 10.5, color: C.muted, margin: 0, fit: 'shrink' })
    slide.addText(d[3], { x: 3.92, y: y + 0.59, w: 4.58, h: 0.14, fontFace: MONO, fontSize: 5.8, color: d[4], margin: 0, fit: 'shrink' })
  })
  rounded(slide, 9.18, 2.43, 3.53, 3.36, C.navy, C.navy)
  slide.addText('33', { x: 9.58, y: 2.95, w: 2.75, h: 0.72, fontFace: MONO, fontSize: 34, bold: true, color: 'FFFFFF', align: 'center', margin: 0 })
  slide.addText('cláusulas do TAP\nmapeadas até a evidência', { x: 9.58, y: 3.75, w: 2.75, h: 0.72, fontFace: FONT, fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', margin: 0, fit: 'shrink' })
  slide.addShape(S.line, { x: 9.78, y: 4.73, w: 2.35, h: 0, line: { color: '49385D', width: 1 } })
  slide.addText('decisão → requisito → código → teste', { x: 9.55, y: 5.05, w: 2.8, h: 0.3, fontFace: MONO, fontSize: 7, color: C.violet2, align: 'center', margin: 0, fit: 'shrink' })
}

// 12 — Validation
{
  const slide = slideBase('evidências', 12)
  title(slide, 'MVP validado de ponta a ponta', 'Funciona, calcula corretamente e degrada com transparência.', 'Execução real contra a Ethereum Mainnet em 01/09/2026, complementada por testes automatizados e inspeção arquitetural.')
  kpi(slide, '11 / 11', 'testes automatizados', 0.62, 2.43, 2.75, C.green, 'Vitest + Supertest')
  kpi(slide, '4', 'endpoints de dados', 3.57, 2.43, 2.75, C.violet, 'todos exercitados')
  kpi(slide, '79 kB', 'bundle JS gzip', 6.52, 2.43, 2.75, C.orange, 'React + D3')
  kpi(slide, 'R$ 0', 'infra do MVP', 9.47, 2.43, 2.75, C.violet2, 'plano gratuito')
  rounded(slide, 0.62, 3.92, 7.65, 2.05, C.paper)
  slide.addText('O que foi comprovado', { x: 0.94, y: 4.23, w: 2.4, h: 0.27, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, margin: 0 })
  const checks = ['build e lint sem erros', 'dados reais da Mainnet', 'cálculos conferidos de forma independente', 'cache, stale e erros estruturados']
  checks.forEach((t, i) => {
    slide.addShape(S.ellipse, { x: 0.94 + (i % 2) * 3.55, y: 4.82 + Math.floor(i / 2) * 0.48, w: 0.15, h: 0.15, fill: { color: C.green }, line: { color: C.green } })
    slide.addText(t, { x: 1.18 + (i % 2) * 3.55, y: 4.75 + Math.floor(i / 2) * 0.48, w: 2.95, h: 0.24, fontFace: FONT, fontSize: 10.5, color: C.muted, margin: 0, fit: 'shrink' })
  })
  rounded(slide, 8.55, 3.92, 4.17, 2.05, C.orangeLight, C.orangeLight)
  slide.addText('Pronto para produção?', { x: 8.88, y: 4.24, w: 3.45, h: 0.28, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, margin: 0 })
  slide.addText('Ainda não — e isso está documentado.', { x: 8.88, y: 4.72, w: 3.2, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.orange, margin: 0, fit: 'shrink' })
  slide.addText('Faltam versões fixadas, rate limit, observabilidade, USD e streaming.', { x: 8.88, y: 5.18, w: 3.2, h: 0.42, fontFace: FONT, fontSize: 9, color: C.muted, margin: 0, fit: 'shrink' })
}

// 13 — Product: blocks
{
  const slide = slideBase('produto ao vivo', 13)
  browserFrame(slide, imgBlocks, 2.0, 0.5, 11.05, 6.22, 'cagimadu / blocos', true)
  rounded(slide, 0.42, 1.04, 2.55, 4.95, C.navy, C.navy)
  slide.addText('01', { x: 0.72, y: 1.4, w: 0.4, h: 0.22, fontFace: MONO, fontSize: 8, bold: true, color: C.violet2, margin: 0 })
  slide.addText('Explorador\nde blocos', { x: 0.72, y: 1.82, w: 1.95, h: 0.9, fontFace: FONT, fontSize: 22, bold: true, color: 'FFFFFF', margin: 0, fit: 'shrink' })
  slide.addText('Uma visão operacional do que acabou de acontecer na rede.', { x: 0.72, y: 2.95, w: 1.85, h: 0.65, fontFace: FONT, fontSize: 10, color: 'C9C0D3', margin: 0, fit: 'shrink' })
  const bullets = ['fee por bloco', 'ocupação e pressão', 'transações e validador', 'atualização ao vivo']
  bullets.forEach((t, i) => {
    slide.addShape(S.ellipse, { x: 0.72, y: 4.0 + i * 0.38, w: 0.09, h: 0.09, fill: { color: i === 3 ? C.green : C.violet2 }, line: { color: i === 3 ? C.green : C.violet2 } })
    slide.addText(t, { x: 0.94, y: 3.91 + i * 0.38, w: 1.48, h: 0.2, fontFace: FONT, fontSize: 10.5, color: 'FFFFFF', margin: 0, fit: 'shrink' })
  })
  chip(slide, 'mainnet real', 0.72, 5.44, 1.35, C.green, '16382F')
}

// 14 — Product: fees
{
  const slide = slideBase('produto ao vivo', 14)
  browserFrame(slide, imgFees, 2.0, 0.5, 11.05, 6.22, 'cagimadu / fees', true)
  rounded(slide, 0.42, 1.04, 2.55, 4.95, C.navy, C.navy)
  slide.addText('02', { x: 0.72, y: 1.4, w: 0.4, h: 0.22, fontFace: MONO, fontSize: 8, bold: true, color: C.green, margin: 0 })
  slide.addText('Fee\nmonitor', { x: 0.72, y: 1.82, w: 1.95, h: 0.9, fontFace: FONT, fontSize: 22, bold: true, color: 'FFFFFF', margin: 0, fit: 'shrink' })
  slide.addText('Do número isolado à decisão de custo por operação.', { x: 0.72, y: 2.95, w: 1.85, h: 0.65, fontFace: FONT, fontSize: 10, color: 'C9C0D3', margin: 0, fit: 'shrink' })
  const bullets = ['fee recomendada', 'histórico de 300 blocos', 'volatilidade visível', 'estimativa por operação']
  bullets.forEach((t, i) => {
    slide.addShape(S.ellipse, { x: 0.72, y: 4.0 + i * 0.38, w: 0.09, h: 0.09, fill: { color: i === 0 ? C.green : C.violet2 }, line: { color: i === 0 ? C.green : C.violet2 } })
    slide.addText(t, { x: 0.94, y: 3.91 + i * 0.38, w: 1.48, h: 0.2, fontFace: FONT, fontSize: 10.5, color: 'FFFFFF', margin: 0, fit: 'shrink' })
  })
  chip(slide, 'mainnet real', 0.72, 5.44, 1.35, C.green, '16382F')
}

// 15 — Product: market direction
{
  const slide = slideBase('direção de produto', 15)
  browserFrame(slide, imgMarket, 2.0, 0.5, 11.05, 6.22, 'cagimadu / análise de mercado', false)
  rounded(slide, 0.42, 1.04, 2.55, 4.95, C.paper)
  slide.addText('03', { x: 0.72, y: 1.4, w: 0.4, h: 0.22, fontFace: MONO, fontSize: 8, bold: true, color: C.orange, margin: 0 })
  slide.addText('Contexto\nde mercado', { x: 0.72, y: 1.82, w: 1.95, h: 0.9, fontFace: FONT, fontSize: 20, bold: true, color: C.ink, margin: 0, fit: 'shrink' })
  slide.addText('A linguagem visual já antecipa como fees podem conversar com inteligência de mercado.', { x: 0.72, y: 2.95, w: 1.85, h: 0.82, fontFace: FONT, fontSize: 9.5, color: C.muted, margin: 0, fit: 'shrink' })
  const bullets = ['brief editorial', 'snapshot de rede', 'fee pulse', 'insight acionável']
  bullets.forEach((t, i) => {
    slide.addShape(S.ellipse, { x: 0.72, y: 4.0 + i * 0.38, w: 0.09, h: 0.09, fill: { color: C.violet }, line: { color: C.violet } })
    slide.addText(t, { x: 0.94, y: 3.91 + i * 0.38, w: 1.48, h: 0.2, fontFace: FONT, fontSize: 10.5, color: C.ink, margin: 0, fit: 'shrink' })
  })
  chip(slide, 'dados demonstrativos', 0.69, 5.42, 1.72, C.orange, C.orangeLight)
}

// 16 — Roadmap and close
{
  const slide = slideBase('próximos passos', 16)
  title(slide, 'Do MVP à integração', 'A próxima versão deve capturar valor antes de adicionar complexidade.', 'O roadmap prioriza ganhos quase gratuitos, depois compatibilidade comercial e, por fim, a arquitetura de streaming prevista no TAP.')
  const steps = [
    ['01', 'Fixar versões', 'minutos', 'build reproduzível', C.red],
    ['02', 'Próximo bloco', '≈ zero esforço', 'usar base fee já recebida', C.green],
    ['03', 'Conversão USD', 'baixo esforço', 'seguir convenção Alphractal', C.violet],
    ['04', 'SSE', 'médio esforço', 'entrega contínua de fees', C.orange],
    ['05', 'WebSocket', 'alto impacto', 'ingestão eficiente + escala', C.violet2],
  ]
  const xs = [0.62, 3.1, 5.58, 8.06, 10.54]
  steps.forEach((st, i) => {
    rounded(slide, xs[i], 2.55, 2.18, 2.62, i === 4 ? C.navy : C.paper, i === 4 ? C.navy : C.border)
    slide.addText(st[0], { x: xs[i] + 0.22, y: 2.86, w: 0.38, h: 0.2, fontFace: MONO, fontSize: 7.5, bold: true, color: st[4], margin: 0 })
    slide.addText(st[1], { x: xs[i] + 0.22, y: 3.34, w: 1.7, h: 0.38, fontFace: FONT, fontSize: 14.5, bold: true, color: i === 4 ? 'FFFFFF' : C.ink, margin: 0, fit: 'shrink' })
    slide.addText(st[2], { x: xs[i] + 0.22, y: 3.92, w: 1.7, h: 0.2, fontFace: MONO, fontSize: 6.5, bold: true, color: st[4], margin: 0, fit: 'shrink' })
    slide.addText(st[3], { x: xs[i] + 0.22, y: 4.4, w: 1.7, h: 0.38, fontFace: FONT, fontSize: 8.5, color: i === 4 ? 'C9C0D3' : C.muted, margin: 0, fit: 'shrink' })
    if (i < steps.length - 1) arrow(slide, xs[i] + 2.19, 3.86, xs[i] + 2.45, 3.86, C.border)
  })
  rounded(slide, 0.62, 5.58, 12.1, 0.72, C.navy, C.navy)
  slide.addText('Já provamos que funciona.', { x: 0.95, y: 5.81, w: 2.4, h: 0.22, fontFace: FONT, fontSize: 13, bold: true, color: 'FFFFFF', margin: 0 })
  slide.addText('Agora o foco é encaixar no ecossistema da Alphractal e transformar telemetria em hábito operacional.', { x: 3.35, y: 5.78, w: 8.58, h: 0.28, fontFace: FONT, fontSize: 11.5, color: 'D7CFDF', margin: 0, fit: 'shrink' })
}

async function main() {
  const out = path.join(root, 'Cagimadu-Apresentacao.pptx')
  await pptx.writeFile({ fileName: out })
  console.log(out)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
