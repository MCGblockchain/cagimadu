# Cagimadu

MVP acadêmico para consulta de blocos e monitoramento de fees da Ethereum Mainnet. O projeto combina um frontend React com uma API REST em Node.js que consulta dados on-chain por JSON-RPC.

## Tecnologias

- Frontend: React, Vite, TypeScript e D3
- Backend: Node.js, Express, TypeScript e Viem
- Validação: Zod
- Testes: Vitest e Supertest
- Provider padrão: `https://ethereum-rpc.publicnode.com`

## Arquitetura

```text
backend/src/
├── config/       # ambiente e configuração
├── controllers/  # entrada e saída HTTP
├── middleware/   # erros e rotas inexistentes
├── models/       # contratos da API
├── routes/       # endpoints Express
├── services/     # consulta Ethereum e normalização
└── utils/        # cache e erros da aplicação

src/
├── components/   # interface reutilizável
├── services/     # cliente HTTP do frontend
└── views/        # Blocos, Mercado e Fees
```

O backend segue MVC, com uma camada `services` para impedir que regras de RPC e cache fiquem dentro dos controllers.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Instalação

```bash
npm install
cp .env.example .env
npm run dev
```

O comando inicia os dois serviços:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333`
- Health check: `http://localhost:3333/api/health`

Também é possível executar separadamente:

```bash
npm run dev:frontend
npm run dev:api
```

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3333` | Porta da API |
| `ETH_RPC_URL` | PublicNode Ethereum | Endpoint JSON-RPC |
| `CORS_ORIGIN` | localhost e 127.0.0.1 | Origens permitidas, separadas por vírgula |
| `RPC_TIMEOUT_MS` | `8000` | Timeout da consulta ao provider |
| `BLOCK_CACHE_TTL_MS` | `12000` | Cache da listagem de blocos |
| `FEE_CACHE_TTL_MS` | `10000` | Cache das consultas de fee |
| `VITE_API_URL` | `http://localhost:3333/api` | Override opcional apenas para desenvolvimento |

Para utilizar Alchemy, Infura ou outro provider, altere apenas `ETH_RPC_URL`. Chaves de provider devem ficar no `.env`, que não é versionado.

## API

### Blocos

```http
GET /api/blocks?limit=40
GET /api/blocks/:number
```

`limit` aceita valores entre 1 e 40. A resposta inclui número, hash, horário, validador, transações, base fee, prioridade mediana, ocupação e pressão calculada.

### Fees

```http
GET /api/fees/current
GET /api/fees/history?blocks=300
```

`blocks` aceita valores entre 2 e 1024. O histórico é reduzido para até aproximadamente 90 pontos antes de ser enviado ao gráfico.

Todas as respostas de dados usam o envelope:

```json
{
  "data": {},
  "meta": {
    "source": "ethereum-rpc",
    "cached": false,
    "stale": false,
    "updatedAt": "2026-08-31T21:00:00.000Z"
  }
}
```

## Cálculo das fees

A API utiliza `eth_feeHistory` com o percentil 50 das recompensas:

```text
fee recomendada = base fee + priority fee mediana
```

O custo estimado de uma operação é calculado em ETH:

```text
custo = fee em Gwei × gas da operação × 10⁻⁹
```

A pressão da rede combina ocupação do bloco e fee. A `difficulty` histórica não é usada porque deixou de ser um indicador operacional após a migração da Ethereum para Proof of Stake.

## Cache e indisponibilidade

- Requisições simultâneas para o mesmo recurso compartilham a mesma consulta RPC.
- Enquanto o TTL estiver válido, a API responde diretamente do cache.
- Se o provider falhar depois de uma resposta bem-sucedida, a API devolve o último valor com `meta.stale: true`.
- Se a primeira consulta falhar, o frontend identifica claramente o uso dos dados demonstrativos.
- O frontend atualiza Blocos e fee atual aproximadamente a cada 12 segundos.

## Validação

```bash
npm run lint
npm test
npm run build
```

Os testes cobrem cálculos de Gwei, custo em ETH, variação, pressão, volatilidade, validação dos controllers e contratos principais da API.

## Publicação gratuita no Render

O projeto está configurado para funcionar como um único Web Service: o Express serve a API em `/api` e o frontend compilado nas demais rotas.

1. Envie a versão mais recente para a branch `main` do GitHub.
2. Acesse [Render](https://dashboard.render.com/) e conecte sua conta do GitHub.
3. Clique em **New → Blueprint**.
4. Selecione o repositório `MCGblockchain/cagimadu`.
5. Confirme a criação do serviço gratuito descrito em `render.yaml`.

O Blueprint já configura:

```text
Build Command: npm ci --include=dev && npm run build
Start Command: npm start
Health Check: /api/health
Plan: Free
```

Se o nome `cagimadu` estiver disponível, a URL será:

```text
https://cagimadu.onrender.com
```

Se o nome já estiver em uso, o Render solicitará outro nome. No plano gratuito, o backend pode entrar em repouso após um período sem acessos; a primeira consulta depois disso pode demorar mais, mas a interface mantém um fallback visual identificado.

Para simular o ambiente publicado localmente:

```bash
npm run build
NODE_ENV=production npm start
```

Abra `http://localhost:3333`. Nesse modo, frontend e API utilizam a mesma origem.

## Documentação de negócio

A análise de negócios exigida pelo TAP está reunida em um único documento, [`docs/analise-de-negocios.md`](docs/analise-de-negocios.md), com análise de mercado, análise competitiva, personas e jornadas, proposta de valor, Business Model Canvas, SWOT, requisitos e user stories, matriz de rastreabilidade do TAP, KPIs, viabilidade financeira, riscos, stakeholders, próximos passos e oportunidades pós-projeto.

Duas seções concentram o essencial:

- [Rastreabilidade do TAP](docs/analise-de-negocios.md#rastreabilidade-do-tap), com cada cláusula do TAP mapeada para a evidência no código.
- [Relatório de validação técnica](docs/validacao/relatorio-de-validacao-tecnica.md), com as evidências de execução real contra a Ethereum Mainnet.

## Escopo atual

As telas de Blocos e Fees estão conectadas à Ethereum Mainnet. Análise de Mercado ainda usa conteúdo demonstrativo; sua integração com APIs de preço e notícias será definida em uma etapa posterior, sem IA neste primeiro momento.
