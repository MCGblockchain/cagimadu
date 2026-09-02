# Relatório de Validação Técnica

Anexo do documento [Análise de Negócios](../analise-de-negocios.md).

**Data da execução:** 01/09/2026
**Ambiente:** Windows 11 Pro, Node.js v24.19.0, npm 11.17.0
**Alvo:** Ethereum Mainnet via provider PublicNode
**Commit base:** `f94f656`, branch `main`

Todas as evidências deste relatório vêm de execução real, não de leitura de código. Onde a conclusão depende apenas de inspeção do código-fonte, isso está declarado explicitamente.

---

## 1. Instalação e build

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Instalação de dependências | `npm install` | Aprovado. 330 pacotes em 36 segundos |
| Análise estática | `npx eslint .` | Aprovado. Zero apontamentos |
| Testes automatizados | `npx vitest run` | Aprovado. 11 de 11 passando, em 2 arquivos, em 1,52 segundo |
| Build do frontend | `tsc -b && vite build` | Aprovado. 238 módulos em 2,77 segundos |
| Build da API | `tsc -p backend/tsconfig.json` | Aprovado. Sem erros |

Artefatos gerados:

```
dist/index.html                   0.59 kB  gzip:  0.37 kB
dist/assets/index-DHuw4LUl.css   40.39 kB  gzip: 10.04 kB
dist/assets/index-C9i3f_wc.js   249.86 kB  gzip: 79.33 kB
```

**Avaliação.** Um pacote de 79 kB comprimido para uma aplicação React com gráfico em D3 é um número saudável. O uso de módulos individuais do D3, em vez do pacote completo, é uma decisão acertada de custo de carregamento.

**Aviso registrado.** O pacote `esbuild` teve seu script de pós-instalação bloqueado pela política de scripts do npm. Isso não impediu o build.

---

## 2. Execução em modo produção

Comando executado:

```
NODE_ENV=production node dist-api/server.js
```

Saída:

```
Cagimadu API disponível em http://localhost:3333
Ethereum RPC: ethereum-rpc.publicnode.com
```

Aprovado. O servidor sobe, serve a API sob o prefixo de API e o frontend compilado nas demais rotas, conforme documentado.

---

## 3. Endpoints, caminho feliz

### Verificação de saúde

```json
{"status":"ok","service":"cagimadu-api","timestamp":"2026-09-01T20:08:13.056Z"}
```

Aprovado, status 200. É o endpoint usado pela plataforma de hospedagem para verificação de saúde.

### Taxa atual

```json
{
  "data": {
    "blockNumber": 25884724,
    "baseFeeGwei": 0.0992,
    "priorityFeeGwei": 0.1048,
    "recommendedFeeGwei": 0.204,
    "previousRecommendedFeeGwei": 0.1157,
    "variationPercent": 76.32,
    "networkPressure": "Baixa",
    "estimates": {
      "transfer": { "gasUnits": 21000,  "eth": 0.00000428 },
      "swap":     { "gasUnits": 150000, "eth": 0.0000306  },
      "nftMint":  { "gasUnits": 100000, "eth": 0.0000204  }
    },
    "updatedAt": "2026-09-01T20:08:13.592Z"
  },
  "meta": { "source": "ethereum-rpc", "cached": false, "stale": false, "updatedAt": "..." }
}
```

Aprovado, status 200, com dados reais da Mainnet.

**Verificação aritmética independente**, feita fora do sistema:

```
taxa recomendada = 0,0992 + 0,1048 = 0,2040          confere
transferência    = 0,204 x 21.000 x 1e-9 = 0,00000428 confere
swap             = 0,204 x 150.000 x 1e-9 = 0,0000306 confere
emissão de NFT   = 0,204 x 100.000 x 1e-9 = 0,0000204 confere
variação         = (0,2040 - 0,1157) / 0,1157 x 100 = 76,32 por cento  confere
```

Todos os cálculos conferem.

### Histórico de taxas, 5 blocos

Retornou 5 pontos com numeração sequencial de bloco, de 25.884.721 a 25.884.725, com base fee e prioridade decompostas, além de mínima de 0,12, média de 0,16, máxima de 0,21 e volatilidade classificada como Moderada. Aprovado, status 200.

### Listagem de blocos, limite 3

Amostra do primeiro item retornado:

```json
{
  "number": 25884725,
  "hash": "0xa2ac3d697fe0dd5ddccd84ba8f979f094c34699cf2bb904b26ffc3b4adfc9e8e",
  "age": "agora",
  "fee": 0.204, "baseFee": 0.0992, "priorityFee": 0.1048,
  "gasUsed": 19.06, "gasLimit": 60, "utilization": 31.76,
  "txs": 187, "difficulty": "Baixa", "validator": "0x4838b1...ad5f97"
}
```

Aprovado, status 200.

**Verificação de ocupação:** 19,06 dividido por 60 resulta em 31,77 por cento, contra 31,76 reportado. A diferença decorre de arredondamento na origem. Confere.

### Histórico no limite máximo, 1024 blocos

Aprovado, status 200. Retornou a série reduzida por amostragem, com blocos espaçados de doze em doze, o que confirma que a redução para cerca de 90 pontos ocorre no backend, como documentado.

### Histórico de 900 blocos, janela de três horas

Aprovado, status 200. O provider gratuito sustentou a janela sem erro.

---

## 4. Endpoints, casos de erro

| Cenário | Requisição | Resposta | Avaliação |
| --- | --- | --- | --- |
| Parâmetro acima do limite | histórico com 9999 blocos | Código de validação, com detalhe indicando limite máximo de 1024 | Correto, status 400 |
| Rota inexistente | caminho inválido sob a API | Código de rota não encontrada, com método e caminho | Correto, status 404 |
| Parâmetro não numérico | bloco identificado como `abc` | Código de validação, com mensagem sobre dígitos | Correto, status 400 |
| Bloco inexistente | bloco de número muito alto | Código de erro de RPC, com mensagem incluindo `Version: viem@2.56.1` | Ver observação, status 502 |
| Rota do frontend | raiz do servidor | HTML da aplicação | Correto, status 200 |

**Avaliação.** A validação de entrada é consistente: códigos estruturados, mensagens em português e detalhamento por campo. Quatro dos cinco cenários estão corretos.

**Observação, severidade baixa.** No caso do bloco inexistente, a mensagem devolvida ao cliente inclui a versão da biblioteca de acesso à blockchain. Vazar a versão de uma dependência para um cliente não autenticado é divulgação desnecessária de informação e facilita o mapeamento de vulnerabilidades conhecidas. A correção é sanitizar o erro na função que o constrói, preservando o detalhe apenas no registro do servidor. Registrado como risco R12 na análise de negócios.

---

## 5. Verificação do achado arquitetural

**Hipótese testada.** O provider já retorna a base fee projetada do próximo bloco, e o código a descarta.

Script executado contra a Mainnet, usando a mesma biblioteca do projeto:

```
latest block      : 25884757
oldestBlock       : 25884756
baseFeePerGas len : 3
reward len        : 2
baseFees (gwei)   : [ '0.071583269', '0.079764668', '0.085380144' ]
```

**Hipótese confirmada.** Com `blockCount` igual a 2, o array de base fees retorna três entradas: os dois blocos consultados e, na última posição, a base fee projetada do bloco seguinte, no caso 0,0854 Gwei para o bloco 25.884.758.

O método que calcula a taxa atual consome os índices 0 e 1 e ignora o índice 2. O dado de previsibilidade, exatamente o que o TAP pede sob o nome de previsibilidade de custos, já chega ao servidor a cada requisição e é descartado, sem qualquer custo adicional de RPC para aproveitá-lo.

Registrado como item 2 dos próximos passos na análise de negócios, e como a oportunidade de maior razão entre valor e esforço de toda a análise.

---

## 6. Verificação das regras de negócio

Confirmadas pela suíte de testes automatizados.

| Regra | Caso testado | Resultado |
| --- | --- | --- |
| Conversão de wei para Gwei | 24.600.000.000 wei resulta em 24,6 Gwei | Aprovado |
| Variação percentual | de 22,1 para 24,6 resulta em 11,31 por cento | Aprovado |
| Proteção contra divisão por zero | valor anterior zero resulta em zero por cento | Aprovado |
| Custo de operação em ETH | 24,6 Gwei com 21.000 de gas resulta em 0,0005166 ETH | Aprovado |
| Pressão da rede, quatro faixas | Baixa, Moderada, Alta e Crítica | Aprovado |
| Volatilidade, três faixas | por coeficiente de variação | Aprovado |
| Abreviação de endereço | 42 caracteres reduzidos a formato curto | Aprovado |

Testes de contrato da API cobrem a verificação de saúde, a listagem de blocos com repasse correto do limite ao serviço, a taxa atual e a presença dos metadados de origem.

**Avaliação.** A cobertura está concentrada onde importa: as funções puras de cálculo e os contratos de API. O serviço real não é testado contra a rede, o que é uma decisão correta, já que testes dependentes de RPC externo são frágeis. A injeção de dependência na criação da aplicação permite testar todo o restante sem rede.

---

## 7. Verificação das lacunas do TAP

Confirmação por inspeção direta do código-fonte de que os itens ausentes de fato não existem. Esta seção é a única baseada em inspeção, e não em execução.

| Item | Busca realizada | Resultado |
| --- | --- | --- |
| WebSocket na ingestão | Transporte na criação do cliente de acesso à blockchain | Transporte HTTP. Nenhuma ocorrência de transporte WebSocket |
| SSE na entrega | Rotas registradas no servidor e cliente nas telas | Apenas REST. O cliente usa intervalos de 12 e 30 segundos. Nenhuma ocorrência de conexão de eventos |
| Conversão para dólar | Modelos de dados do backend | Nenhum campo de preço ou de valor em dólar |
| Mempool | Métodos do serviço de acesso à Ethereum | Apenas consulta de blocos e de histórico de taxas, ambos sobre blocos confirmados |

A busca por termos relacionados a WebSocket, conexão de eventos e stream de eventos em todo o código-fonte de backend e frontend não retornou nenhuma ocorrência.

O tipo de ponto de série do frontend possui um campo opcional de valor em dólar, que nunca é preenchido pela API. A estrutura foi antecipada e não implementada.

---

## 8. Consumo de RPC por endpoint

Contagem obtida por leitura direta dos métodos do serviço.

| Endpoint | Chamadas por consulta ao provider | Composição |
| --- | --- | --- |
| Listagem de blocos, limite 40 | 42 | 1 consulta do número do bloco, 1 histórico de taxas e 40 consultas de bloco individuais |
| Bloco específico | 2 | 1 bloco e 1 histórico de taxas |
| Taxa atual | 2 | 1 bloco e 1 histórico de taxas |
| Histórico de taxas | 2 | 1 bloco e 1 histórico de taxas |

**Achado.** A listagem de blocos custa 21 vezes mais que os demais endpoints. Como a validade do cache é de 12 segundos e um bloco leva aproximadamente 12 segundos, na prática o cache expira a cada novo bloco e os 40 blocos são rebuscados, dos quais 39 não mudaram.

A projeção mensal e o impacto financeiro desse padrão estão na seção de viabilidade financeira da análise de negócios.

---

## 9. Observações de qualidade

### Pontos fortes verificados

| Item | Observação |
| --- | --- |
| 1 | Deduplicação de requisições concorrentes. N usuários simultâneos geram uma única chamada ao provider, graças ao mapa de requisições pendentes no cache |
| 2 | Degradação graciosa. Em falha do provider após um sucesso anterior, a API devolve o último valor válido sinalizado como obsoleto e mantém status 200 |
| 3 | Injeção de dependência, que permite testar a API sem acesso à rede |
| 4 | Portabilidade de provider por uma única variável de ambiente |
| 5 | Validação do ambiente na inicialização, com falha explícita e mensagem clara |
| 6 | Cabeçalhos de segurança configurados e identificação de servidor desabilitada |
| 7 | Política de origem cruzada restrita a uma lista configurável |
| 8 | Redução da série no backend, de até 1024 pontos para cerca de 90, poupando banda e trabalho de renderização |
| 9 | Decisão de ignorar a dificuldade após a migração para Proof of Stake, documentada com justificativa |

### Pontos de atenção

| Item | Observação | Severidade | Risco associado |
| --- | --- | --- | --- |
| 1 | Todas as dependências fixadas em `"latest"`, tornando o build não reproduzível ao longo do tempo | Alta | R05 |
| 2 | A listagem de blocos faz 42 chamadas por atualização, das quais 39 buscam blocos que não mudaram | Média | R07 |
| 3 | Ausência de limitação de taxa de requisições na API | Média | R09 |
| 4 | Contrato de resposta com envelope, divergente do padrão de arrays simples da API da Alphractal | Média | R10 |
| 5 | Mensagem de erro expõe a versão de uma dependência | Baixa | R12 |
| 6 | Marcações de tempo do histórico são aproximadas, assumindo 12 segundos por bloco em vez do tempo real de cada um | Baixa | R13 |
| 7 | Tela de análise de mercado com dados fictícios, corretamente rotulados como tal na própria interface | Baixa | Documentado no README |
| 8 | Cache em memória, com perda do histórico no reinício | Baixa | R11 |

**Sobre o item 7.** A tela exibe a indicação de dado fictício na própria interface, e o README declara o escopo. Rotular dado fictício como fictício é a conduta correta em um protótipo. O registro serve apenas para que o parceiro não confunda a tela com uma entrega funcional.

---

## 10. Veredito

| Dimensão | Avaliação | Base |
| --- | --- | --- |
| O sistema funciona? | Sim | Verificado de ponta a ponta contra a Ethereum Mainnet |
| Os cálculos estão corretos? | Sim | Conferidos aritmeticamente de forma independente e cobertos por testes |
| É robusto a falhas? | Sim | Degradação graciosa, validação de entrada e erros estruturados |
| É integrável? | Sim, com ressalva | Camadas separadas e dependências injetáveis. O contrato de API exigirá adaptação ao padrão da plataforma |
| Cumpre o TAP? | Parcialmente | Quatro cláusulas não atendidas |
| Está pronto para produção? | Não | Faltam versões fixadas, limitação de taxa, monitoramento e a arquitetura de streaming |

**Conclusão.** O que foi construído é sólido e funciona. A qualidade de engenharia está acima do que se espera de um protótipo acadêmico de quatro semanas: arquitetura em camadas, testes, deduplicação de chamadas ao provider e degradação graciosa são decisões de quem pensou em operação real.

As lacunas são de escopo, não de execução. Três exigências explícitas do TAP, a ingestão por WebSocket, a entrega por SSE e a conversão para dólar, não foram implementadas, e são justamente as que sustentam o benefício arquitetural prometido ao parceiro.

---

## Como reproduzir esta validação

```bash
npm install
npx eslint .
npx vitest run
npm run build
NODE_ENV=production node dist-api/server.js
```

Em outro terminal:

```bash
curl http://localhost:3333/api/health
curl http://localhost:3333/api/fees/current
curl "http://localhost:3333/api/fees/history?blocks=5"
curl "http://localhost:3333/api/blocks?limit=3"
```

Casos de erro:

```bash
curl "http://localhost:3333/api/fees/history?blocks=9999"   # 400
curl http://localhost:3333/api/blocks/abc                    # 400
curl http://localhost:3333/api/naoexiste                     # 404
```

Os valores retornados variam conforme o estado da rede no momento da execução.
