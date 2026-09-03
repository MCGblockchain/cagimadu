# Documentação Técnica

Este documento descreve o funcionamento interno do Cagimadu. Ele complementa o README: não repete instruções de instalação, deploy ou visão geral do produto.

## Escopo

Este material é voltado para manutenção e evolução do código. Portanto, cobre decisões de arquitetura, fluxo entre camadas, contratos internos, regras de cálculo e pontos de extensão.

Ficam fora deste documento:

| Tema | Onde consultar |
| --- | --- |
| Como instalar, executar ou publicar | `README.md` |
| Justificativa de produto e mercado | `docs/analise-de-negocios.md` |
| Evidências de execução contra a Mainnet | `docs/validacao/relatorio-de-validacao-tecnica.md` |

## 1. Visão de Arquitetura

O sistema é dividido em duas aplicações TypeScript no mesmo repositório:

| Camada | Responsabilidade técnica | Diretório |
| --- | --- | --- |
| Frontend | Renderização da interface, polling da API, fallback visual e simulações locais | `src/` |
| Backend | API REST, validação de entrada, cache, normalização dos dados Ethereum e tratamento de erros | `backend/src/` |

O backend é a única camada que consulta a Ethereum Mainnet. O frontend consome apenas os contratos HTTP expostos em `/api`.

Decisões centrais:

| Decisão | Consequência técnica |
| --- | --- |
| Controllers finos | Validação e formatação HTTP ficam separadas das regras de RPC |
| Serviço Ethereum isolado | Trocar provider ou estratégia de ingestão não exige reescrever controllers |
| Cache em memória | Operação simples, mas sem persistência entre reinícios |
| Tipos duplicados por camada | Baixa complexidade inicial, com custo manual ao alterar contratos |
| Simulador no frontend | Nova feature sem chamada adicional à API |

Fluxo resumido:

```text
React views
  -> src/services/api.ts
    -> Express routes/controllers
      -> EthereumService
        -> viem JSON-RPC provider
```

## 2. Backend

### 2.1 Composição da Aplicação

`backend/src/app.ts` monta a aplicação Express por meio de `createApp`.

Responsabilidades principais:

| Elemento | Função |
| --- | --- |
| `createApp` | Monta middlewares, rotas, handlers de erro e, quando existe build, serve o frontend |
| `cors` | Restringe origens a partir de `CORS_ORIGIN` |
| `express.json({ limit: '32kb' })` | Limita o corpo das requisições JSON |
| Headers manuais | Definem `X-Content-Type-Options` e `Referrer-Policy` |
| `app.disable('x-powered-by')` | Remove identificação do Express |

A função aceita dependências por parâmetro:

```ts
createApp({ ethereum })
```

Isso permite testar controllers e rotas sem consultar a rede real.

### 2.2 Rotas e Controllers

As rotas são separadas por domínio:

| Domínio | Arquivo de rotas | Controller |
| --- | --- | --- |
| Blocos | `backend/src/routes/blocks.routes.ts` | `BlocksController` |
| Fees | `backend/src/routes/fees.routes.ts` | `FeesController` |

Os controllers têm três responsabilidades:

1. Validar parâmetros com Zod.
2. Chamar a interface `EthereumServiceContract`.
3. Envolver a resposta no contrato `{ data, meta }`.

Eles não conhecem detalhes de JSON-RPC, cache ou mapeamento de campos da Ethereum.

### 2.3 Serviço Ethereum

`EthereumService` concentra o acesso à rede e implementa `EthereumServiceContract`.

Métodos públicos:

| Método | Uso |
| --- | --- |
| `getRecentBlocks(limit)` | Lista os blocos mais recentes, enriquecidos com fee e pressão |
| `getBlock(blockNumber)` | Consulta um bloco específico |
| `getCurrentFee()` | Calcula a fee recomendada atual e estimativas por operação |
| `getFeeHistory(blockCount)` | Retorna série histórica reduzida para renderização |

O cliente RPC é criado com `viem`:

```ts
createPublicClient({
  chain: mainnet,
  transport: http(env.ETH_RPC_URL, {
    timeout: env.RPC_TIMEOUT_MS,
    retryCount: 1,
    retryDelay: 250,
  }),
})
```

### 2.4 Estratégia de Cache

O cache fica em `backend/src/utils/memory-cache.ts`.

Ele oferece três comportamentos:

| Comportamento | Descrição |
| --- | --- |
| TTL por chave | Cada consulta define sua validade em milissegundos |
| Deduplicação | Requisições simultâneas para a mesma chave compartilham a mesma Promise |
| Fallback stale | Se o provider falhar após sucesso anterior, retorna o último dado com `stale: true` |

Formato interno do retorno:

```ts
{
  data,
  cached,
  stale,
  updatedAt,
}
```

O controller transforma esse retorno no `meta` público da API.

Chaves usadas atualmente:

| Recurso | Chave |
| --- | --- |
| Lista de blocos | `blocks:${limit}` |
| Bloco específico | `block:${blockNumber}` |
| Fee atual | `fees:current` |
| Histórico de fees | `fees:history:${blockCount}` |

### 2.5 Normalização dos Dados

As funções puras ficam em `backend/src/services/ethereum.mapper.ts`.

| Função | Responsabilidade |
| --- | --- |
| `weiToGwei` | Converte `bigint` em Gwei numérico com quatro casas |
| `percentVariation` | Calcula variação percentual entre fee atual e anterior |
| `networkPressure` | Classifica pressão da rede a partir de ocupação e fee |
| `volatilityLabel` | Classifica volatilidade por coeficiente de variação |
| `estimateOperationEth` | Estima custo de operação em ETH |
| `shortAddress` | Abrevia endereços para exibição |

As funções são isoladas para manter as regras testáveis sem rede.

### 2.6 Pressão da Rede

A pressão combina ocupação do bloco e nível da fee:

```ts
score = utilization * 0.7 + Math.min(feeGwei, 100) * 0.3
```

Faixas:

| Score | Classificação |
| --- | --- |
| `>= 83` | `Crítica` |
| `>= 66` | `Alta` |
| `>= 45` | `Moderada` |
| `< 45` | `Baixa` |

O teto de `100 Gwei` evita que um pico extremo de fee domine totalmente a pontuação.

### 2.7 Histórico de Fees

`getFeeHistory(blockCount)` consulta `eth_feeHistory` e produz pontos com:

| Campo | Origem |
| --- | --- |
| `baseFeeGwei` | `baseFeePerGas[index]` |
| `priorityFeeGwei` | percentil 50 de `reward[index]` |
| `value` | `baseFeeGwei + priorityFeeGwei` |
| `blockNumber` | `oldestBlock + index` |
| `time` | aproximação baseada no timestamp do último bloco e 12s por bloco |

O `eth_feeHistory` retorna `baseFeePerGas` com uma entrada extra referente à projeção do próximo bloco. O contrato atual não expõe essa projeção; os pontos publicados correspondem apenas aos blocos do intervalo solicitado.

A série bruta é reduzida para aproximadamente 90 pontos antes de ser enviada ao frontend:

```ts
sampleEvery = Math.max(1, Math.ceil(rawPoints.length / 90))
```

Essa decisão evita enviar até 1024 pontos para o gráfico sem ganho visual proporcional.

### 2.8 Tratamento de Erros

Erros são tratados em `backend/src/middleware/error-handler.ts`.

| Origem | Resposta |
| --- | --- |
| `ZodError` | HTTP 400 com `VALIDATION_ERROR` e detalhes por campo |
| `AppError` | HTTP definido pelo erro, com código controlado |
| Erro inesperado | HTTP 500 com mensagem genérica |
| Rota inexistente | HTTP 404 com `ROUTE_NOT_FOUND` |

Falhas do provider são convertidas para:

```ts
ETHEREUM_RPC_ERROR
```

com status HTTP 502.

## 3. Frontend

### 3.1 Estrutura de Navegação

`src/App.tsx` controla a navegação por hash:

| Hash | View |
| --- | --- |
| `#/blocks` | `BlocksView` |
| `#/fees` | `FeesView` |
| `#/market` | `MarketView` |

Se o hash não for reconhecido, a aplicação volta para `blocks`.

### 3.2 Cliente da API

`src/services/api.ts` centraliza as chamadas HTTP.

Características:

| Recurso | Comportamento |
| --- | --- |
| Base URL | `/api` em produção; `VITE_API_URL` ou `localhost:3333/api` em desenvolvimento |
| Timeout | 10 segundos por requisição |
| Abort externo | As views podem cancelar requisições ao desmontar ou trocar estado |
| Erros | Normalizados em `ApiError` |

As views não chamam `fetch` diretamente.

### 3.3 Blocos

`BlocksView` consulta `api.blocks(40)` a cada 12 segundos.

Comportamentos locais:

| Recurso | Descrição |
| --- | --- |
| Busca | Filtra por número do bloco ou validador |
| Média | Calcula a fee média dos 12 primeiros blocos carregados |
| Drawer | Exibe detalhes do bloco selecionado |
| Fallback | Usa dados demonstrativos se a primeira consulta falhar |
| Stale | Exibe banner quando a API mantém último dado válido |

### 3.4 Fees

`FeesView` consulta dois recursos:

| Recurso | Frequência |
| --- | --- |
| `api.currentFee()` | 12 segundos |
| `api.feeHistory(period.blocks)` | 30 segundos |

O período selecionado no gráfico define o número de blocos:

| Rótulo | Blocos |
| --- | --- |
| `5M` | 25 |
| `20M` | 100 |
| `1H` | 300 |
| `3H` | 900 |

### 3.5 Simulador de Operação

`src/components/TransactionPlanner.tsx` é uma feature de frontend. Ela não cria endpoint novo.

Entradas:

```ts
current: CurrentFeeData
history: FeeHistoryData
```

Presets de gas:

| Operação | Gas |
| --- | --- |
| Transferência | 21.000 |
| Swap DEX | 150.000 |
| Mint NFT | 100.000 |
| Contrato | 260.000 |
| Custom | definido pelo usuário |

Fórmula de custo:

```ts
costEth = feeGwei * gasUnits * 1e-9
```

Comparações calculadas:

| Valor | Cálculo |
| --- | --- |
| Custo agora | `current.recommendedFeeGwei * gasUnits * 1e-9` |
| Custo na média | `history.average * gasUnits * 1e-9` |
| Custo na mínima | `history.minimum * gasUnits * 1e-9` |
| Economia potencial | diferença entre custo atual e custo na mínima, quando positiva |

Classificação do simulador:

| Critério | Rótulo |
| --- | --- |
| Fee atual até 12% acima da mínima recente | `Boa janela` |
| Fee atual até 8% acima da média recente | `Aceitável` |
| Fee atual até 28% acima da média recente | `Melhor esperar` |
| Acima de 28% da média recente | `Rede cara` |

A classificação é deliberadamente simples e local. Ela serve para orientar leitura de custo, não para executar ou recomendar transação financeira.

### 3.6 Mercado

`MarketView` é uma tela editorial demonstrativa. Ela não consulta a API atualmente.

Do ponto de vista técnico, isso significa:

| Item | Situação |
| --- | --- |
| Dados | Estáticos no componente |
| Integração externa | Ausente |
| Relação com backend | Nenhuma |

## 4. Contratos de Dados

### 4.1 Envelope da API

Todos os endpoints de dados retornam:

```ts
{
  data: T,
  meta: {
    source: 'ethereum-rpc',
    cached: boolean,
    stale: boolean,
    updatedAt: string,
  },
}
```

`cached` indica resposta servida sem nova consulta ao provider.

`stale` indica último dado válido reaproveitado após falha do provider.

### 4.2 Tipos Compartilhados por Forma

O backend define modelos em `backend/src/models`.

O frontend define tipos equivalentes em `src/types.ts`.

Não há pacote compartilhado de tipos. Ao alterar contrato de resposta, é necessário atualizar os dois lados.

## 5. Testes

A suíte automatizada cobre dois grupos:

| Arquivo | Cobertura |
| --- | --- |
| `backend/src/services/ethereum.mapper.test.ts` | Conversões, cálculo de custo, variação, pressão, volatilidade e abreviação |
| `backend/src/app.test.ts` | Health check, validação de parâmetros, envelopes e metadados com serviço mockado |

O serviço real não é testado contra a Mainnet em teste automatizado. Essa escolha evita instabilidade causada por rede externa, latência e limites do provider.

## 6. Pontos de Extensão

### 6.1 Novo Endpoint

Para adicionar um domínio ou endpoint:

1. Criar ou estender um model em `backend/src/models`.
2. Adicionar método em `EthereumServiceContract`.
3. Implementar o método em `EthereumService`.
4. Criar controller ou método de controller.
5. Registrar rota em `backend/src/routes`.
6. Expor rota em `createApp`.
7. Criar método correspondente em `src/services/api.ts`.
8. Atualizar tipos em `src/types.ts`.

### 6.2 Nova Rede

O desenho atual permite evoluir para múltiplas redes, mas ainda não está parametrizado por rede.

Pontos que precisariam mudar:

| Ponto | Mudança esperada |
| --- | --- |
| `EthereumService` | Receber chain e RPC por configuração |
| Rotas | Incluir rede na URL ou query |
| Cache | Incluir rede na chave |
| Tipos | Expor identificador da rede no retorno |
| Frontend | Adicionar seletor de rede e fallback por rede |

### 6.3 Streaming

O frontend hoje usa polling. Para migrar para SSE ou WebSocket:

| Camada | Alteração |
| --- | --- |
| Backend | Criar canal de eventos e publicar updates de fee/bloco |
| Serviço | Evitar refazer consultas completas quando apenas um bloco novo chega |
| Cache | Passar de cache passivo para estado atualizado por evento |
| Frontend | Trocar intervalos por assinatura com reconexão |

## 7. Cuidados de Manutenção

| Tema | Cuidado |
| --- | --- |
| Dependências | Evitar deixar versões em `latest` em ambientes que exijam reprodutibilidade |
| Contratos | Alterações na API exigem atualização manual dos tipos do frontend |
| Provider RPC | Mensagens de erro externas devem ser sanitizadas antes de expor ao cliente |
| Cache | O cache é local ao processo; reinício perde histórico e estado stale |
| Histórico | Timestamps são aproximados por intervalo médio de 12 segundos |
| Listagem de blocos | O endpoint é o mais caro em chamadas RPC quando o limite é alto |
| Dados demonstrativos | Qualquer fallback ou mock deve permanecer visualmente identificado |

## 8. Arquivos de Maior Interesse Técnico

| Arquivo | Por que importa |
| --- | --- |
| `backend/src/app.ts` | Composição da API e injeção de dependências |
| `backend/src/services/ethereum.service.ts` | Consulta RPC, cache e montagem dos modelos |
| `backend/src/services/ethereum.mapper.ts` | Regras de cálculo testáveis |
| `backend/src/utils/memory-cache.ts` | TTL, deduplicação e stale fallback |
| `backend/src/middleware/error-handler.ts` | Contrato de erro da API |
| `src/services/api.ts` | Cliente HTTP e normalização de falhas no frontend |
| `src/views/BlocksView.tsx` | Fluxo de blocos, busca e drawer |
| `src/views/FeesView.tsx` | Polling de fees, histórico e fallback |
| `src/components/TransactionPlanner.tsx` | Simulação local de custo por operação |
| `src/components/FeeChart.tsx` | Renderização do gráfico de histórico |
