# Análise de Negócios

## Sistema de monitoramento em tempo real de custos de taxa na rede Ethereum

**Parceiro:** Alphractal (Nortech Labs)
**Executor:** Equipe Cagimadu, Inteli Blockchain
**Base contratual:** TAP-Alphractal.pdf
**Versão:** 2.0
**Data:** 01/09/2026
**Licença:** MIT

Anexo técnico: [Relatório de validação técnica](validacao/relatorio-de-validacao-tecnica.md), com as evidências de execução contra a Ethereum Mainnet que sustentam as afirmações deste documento.

---

## Índice

1. [Sumário executivo](#1-sumário-executivo)
2. [O parceiro](#2-o-parceiro)
3. [Definição do problema](#3-definição-do-problema)
4. [Análise de mercado](#4-análise-de-mercado)
5. [Análise competitiva](#5-análise-competitiva)
6. [Personas e jornadas](#6-personas-e-jornadas)
7. [Proposta de valor](#7-proposta-de-valor)
8. [Business Model Canvas](#8-business-model-canvas)
9. [SWOT e matriz TOWS](#9-swot-e-matriz-tows)
10. [Requisitos, user stories e rastreabilidade do TAP](#10-requisitos-user-stories-e-rastreabilidade-do-tap)
11. [KPIs e métricas de sucesso](#11-kpis-e-métricas-de-sucesso)
12. [Viabilidade financeira](#12-viabilidade-financeira)
13. [Riscos](#13-riscos)
14. [Stakeholders](#14-stakeholders)
15. [Próximos passos](#15-próximos-passos)
16. [Oportunidades pós-projeto](#16-oportunidades-pós-projeto)
17. [Validação das afirmações deste documento](#17-validação-das-afirmações-deste-documento)

---

## 1. Sumário executivo

### O pedido

A Alphractal opera uma plataforma de inteligência de mercado Web3 com mais de 1.500 métricas distribuídas entre dados on-chain, derivativos, sentimento, macroeconomia e modelos proprietários. A sub aba "Fees" dessa plataforma apresenta médias históricas agregadas: informação descritiva, que responde à pergunta "quanto custou", mas não à pergunta "quanto custa agora e o que fazer a respeito".

O TAP pede a transição de dado informativo para indicador operacional acionável: uma camada de telemetria ao vivo que traduza o estado bruto da Ethereum em uma métrica de saúde da rede e em previsibilidade de custo para execuções institucionais.

### O que foi entregue

Um MVP funcional de ponta a ponta, publicado sob licença MIT:

* Backend em Node.js e TypeScript, arquitetura MVC com camada de serviço, consumindo a Ethereum Mainnet via biblioteca `viem` sobre JSON-RPC, com cache em memória, deduplicação de requisições concorrentes e degradação graciosa.
* Frontend em React, Vite e TypeScript, com gráfico construído sob medida em D3, três telas e fallback visual identificado quando o provider falha.
* API REST com quatro endpoints de dados, envelope padronizado e validação de entrada via Zod.
* Suíte de validação: 11 testes automatizados, ESLint sem apontamentos, build de produção funcional.

Todos esses itens foram verificados em execução real contra a Ethereum Mainnet em 01/09/2026.


### A recomendação central

O MVP cumpre o objetivo funcional: a aba Fees deixou de ser histórica e passou a ser operacional. O que ele não fecha é a prova de conceito arquitetural que o TAP posiciona como benefício estratégico para o parceiro, a base para escalar depois o monitoramento a outras redes L1 e L2.

A pesquisa sobre a plataforma da Alphractal, detalhada na seção 2, produziu três achados que alteram materialmente a priorização em relação a uma leitura puramente contratual:

1. **A plataforma já possui métricas de taxa em dólar.** A API da Alphractal expõe `FeeMeanUSD`, `FeeMedUSD`, `FeeTotUSD` e `fee_price_usd`. Existe, portanto, uma fonte de preço e uma convenção de nomenclatura já estabelecidas internamente. O gap de USD deixa de ser um problema de "buscar uma cotação" e passa a ser um problema de "adotar a convenção da casa", o que reduz o esforço e aumenta a urgência.

2. **A plataforma já possui um motor de alertas.** O recurso Smart Alerts oferece notificações multicondicionais por e-mail, Telegram e in-app. A recomendação de construir alertas de mudança de regime, que na versão anterior desta análise aparecia como desenvolvimento novo, converte-se em algo bem mais barato: expor `networkPressure` e `recommendedFeeGwei` como métricas no formato da plataforma, deixando o motor existente fazer o resto.

3. **A latência do módulo já supera a da plataforma que o hospedará.** A oferta institucional da Alphractal descreve streaming com frequência de atualização de 1 a 5 minutos. O módulo atualiza a cada 12 segundos, ou seja, entre 5 e 25 vezes mais rápido que a linha de base da plataforma. Isso não anula o requisito contratual de SSE e WebSocket, mas reposiciona sua justificativa: o argumento correto para implementá-los é conformidade com o TAP e redução de custo de RPC, não latência percebida pelo usuário.

### Ordem de execução recomendada

1. Fixar as versões das dependências, hoje todas em `"latest"`. Custo de minutos, risco alto.
2. Expor a base fee projetada do próximo bloco. O dado já chega do RPC a cada requisição e é descartado pelo código. Custo próximo de zero, sem chamadas adicionais.
3. Conversão para dólar, adotando a convenção `Ntv` e `USD` da própria Alphractal.
4. SSE no endpoint de fees.
5. WebSocket na ingestão, que fecha o benefício arquitetural e reduz o consumo de RPC em cerca de 94 por cento.

### Números-chave

| Indicador | Valor |
| --- | --- |
| Endpoints de dados entregues | 4 |
| Testes automatizados passando | 11 de 11 |
| Cláusulas do TAP mapeadas | 33 |
| Cláusulas exigíveis plenamente atendidas | 13 de 26, ou 50 por cento |
| Cláusulas exigíveis com entrega total ou parcial | 22 de 26, ou 85 por cento |
| Latência do dado no painel | até 12 segundos |
| Latência da plataforma que hospedará o módulo | 1 a 5 minutos |
| Custo de infraestrutura atual | zero |
| Consumo de RPC estimado no pico | 10,1 milhões de chamadas por mês |
| Consumo projetado com WebSocket | 0,65 milhão de chamadas por mês |

---

## 2. O parceiro

### Quem é a Alphractal

A Alphractal é uma plataforma de analytics cripto desenvolvida pela Nortech Labs, incubadora e gestora sediada em Brisbane, na Austrália. A proposta declarada é tornar dados cripto acessíveis, confiáveis e acionáveis para traders, analistas e instituições.

O que a pesquisa direta ao site e à documentação pública revelou, e que é relevante para o projeto:

**Cobertura de dados**

| Família de métricas | Quantidade declarada | Exemplos citados pela empresa |
| --- | --- | --- |
| On-chain | mais de 300 | supply, fluxos, SOPR |
| Macroeconomia | mais de 300 | liquidez, juros, risco |
| Market data | mais de 250 | preço, volume, capitalização |
| Sentimento | mais de 80 | Fear and Greed, social |
| Derivativos | mais de 60 | funding, open interest, liquidações |
| Modelos proprietários | 23 exclusivos | Pi Cycle, CVDD |
| **Total** | **mais de 1.500** | cobrindo mais de 1.000 ativos digitais |

**Recursos do produto**

| Recurso | Descrição |
| --- | --- |
| Alpha AI | Consulta em linguagem natural sobre as mais de 1.500 métricas, com capacidade de pesquisa aprofundada |
| Custom Dashboards | Montagem por arrastar e soltar, com gráficos, texto, imagens, fórmulas e resumos gerados por IA |
| Smart Alerts | Alertas multicondicionais sobre preço, on-chain, derivativos e sentimento, entregues por e-mail, Telegram e in-app |
| Screeners | Filtro e ranqueamento de ativos em tempo real |
| Research Reports | Análises semanais de mercado |
| API | Mais de 1.000 endpoints, até 10 milhões de chamadas por mês no plano institucional |

**Características técnicas da API**

A documentação pública informa que a API se organiza em rotas escopadas por ativo, com parâmetros `{asset}`, `startDate` e `endDate`, além de filtros opcionais de exchange, símbolo, timeframe e limite. As respostas são arrays JSON simples, sem envelope e sem paginação. Cada requisição custa 10 créditos, e o número de requisições por minuto varia conforme o plano. A oferta institucional descreve frequência de atualização de 1 a 5 minutos.

**Comercial**

A plataforma tem entrada gratuita, sem exigência de cartão de crédito, com um nível gratuito permanente e teste de 3 dias nos planos pagos. O site descreve a base como "milhares de analistas". Um levantamento em fontes secundárias menciona 19.000 usuários em 40 mercados, número que não foi encontrado no site no momento desta pesquisa e que, por isso, é tratado neste documento como não confirmado.

### O achado decisivo: a Alphractal já tem métricas de taxa

A documentação pública da API lista uma família de métricas dedicada a taxas e outra a blocos. Entre as métricas encontradas:

| Métrica | Natureza |
| --- | --- |
| `FeeMeanNtv`, `FeeMeanUSD` | Taxa média, em moeda nativa e em dólar |
| `FeeMedNtv`, `FeeMedUSD` | Taxa mediana, em moeda nativa e em dólar |
| `FeeTotNtv`, `FeeTotUSD` | Taxa total, em moeda nativa e em dólar |
| `fee_price`, `fee_price_usd` | Preço da taxa |
| `fee_to_market_cap_ratio` | Taxa relativa à capitalização |
| `GasLmtBlk`, `GasLmtBlkMean` | Limite de gas por bloco |
| `GasLmtTx`, `GasLmtTxMean` | Limite de gas por transação |
| `GasUsedTx`, `GasUsedTxMean` | Gas consumido por transação |

Esse achado tem quatro consequências diretas para o projeto.

**Primeira: ele confirma e nomeia o problema descrito no TAP.** As métricas existentes são agregados estatísticos, média, mediana e total. São exatamente as "médias históricas estáticas" que o TAP aponta como origem do ponto cego. Não se trata de uma limitação vaga, e sim de uma característica identificável do conjunto de métricas atual.

**Segunda: ela reduz o custo de fechar o gap de dólar.** Como `FeeMeanUSD` e `fee_price_usd` já existem, a plataforma já possui uma fonte de cotação e uma convenção de sufixos, `Ntv` para moeda nativa e `USD` para dólar. O módulo deveria adotar essa mesma convenção em vez de inventar a sua, o que transforma um trabalho de integração em um trabalho de nomenclatura.

**Terceira: ela indica onde o módulo não deve duplicar esforço.** Métricas de gas por bloco e por transação já existem. O valor do módulo não está em recalculá-las, e sim em produzir o que não existe: a taxa recomendada para o próximo bloco, a classificação de pressão da rede e a estimativa de custo por tipo de operação.

**Quarta: ela expõe uma incompatibilidade de contrato de API.** A API da Alphractal devolve arrays JSON simples, sem envelope, com rotas escopadas por ativo e recorte temporal por `startDate` e `endDate`. A API do módulo devolve um envelope `{ data, meta }`, com rotas sem escopo de ativo e recorte por quantidade de blocos. A integração exigirá uma camada de adaptação. Isso não é um defeito do módulo, já que o envelope com metadados de cache e obsolescência é uma boa decisão para o uso autônomo, mas é um custo de integração que precisa estar visível para a engenharia do parceiro.

### Leitura de negócio

A Alphractal não é uma startup em busca de validação de produto. É uma operação com base instalada, oferta institucional dedicada, API madura com mais de mil endpoints e recursos avançados como consulta em linguagem natural e alertas multicondicionais.

Isso muda a natureza do projeto. Não estamos provando que existe demanda, estamos aumentando a densidade de valor de uma feature existente para um público que já paga. Duas implicações práticas:

* O risco de adoção pelo mercado é baixo, mas o risco de qualidade percebida é alto, porque o usuário compara o módulo com o restante de uma plataforma madura.
* O critério de sucesso mais duro não é o usuário final, e sim a engenharia da Alphractal, que decide se o código entra ou não em produção. Essa persona está tratada na seção 6.

---

## 3. Definição do problema

### A formulação do TAP

O TAP identifica que a visualização atual da aba Fees se baseia em médias históricas estáticas, criando um ponto cego em relação à volatilidade instantânea da mempool. Declara três consequências: risco de execução por estimativas imprecisas, custo excessivo durante picos não previstos e assimetria de informação por falta de diagnóstico imediato da saúde da rede.

### Decomposição

O problema não é ausência de dado, já que a Ethereum é integralmente pública. É latência e tradução.

| Dado bruto disponível on-chain | Pergunta que o gestor precisa responder |
| --- | --- |
| `baseFeePerGas` em wei | Executo agora ou espero? |
| `maxPriorityFeePerGas` | Quanto isso custa em dólar? |
| `gasUsed` sobre `gasLimit` | A rede está saturada? |
| mempool pendente | O custo vai subir nos próximos blocos? |

Uma média histórica responde a "quanto custou". O gestor precisa de "quanto custa agora e o que fazer a respeito". A distância entre as duas respostas é o escopo do projeto.

### Por que a média histórica falha

A taxa da Ethereum é definida por um mecanismo de leilão introduzido pela EIP-1559, em que a base fee se ajusta bloco a bloco conforme a ocupação do bloco anterior, subindo quando a ocupação passa de 50 por cento e caindo quando fica abaixo. O ajuste é de até 12,5 por cento por bloco, e um bloco leva aproximadamente 12 segundos.

A implicação é direta: a taxa pode dobrar em cinco blocos, ou seja, em cerca de um minuto. Uma média de 24 horas suaviza precisamente o sinal que importa para quem vai executar uma ordem nos próximos dois minutos.

### Por que o custo do erro é assimétrico

Numa transação Ethereum, o gas é cobrado mesmo quando a transação falha. Os fundos permanecem com o remetente, mas a taxa é debitada. Estudos acadêmicos sobre transações privadas em Ethereum sob Proof of Stake registraram 658.362 falhas, correspondentes a 2,20 por cento do conjunto analisado, todas com taxa cobrada.

Disso decorre uma assimetria: subestimar a taxa produz transação travada ou revertida, com custo pago, objetivo não atingido e possível movimento adverso de preço no intervalo. Superestimar produz pagamento acima do necessário. Sem telemetria, o usuário institucional se protege superestimando, e paga esse prêmio de seguro em todas as operações.

### Quantificação

O custo de uma operação é calculável de forma exata pela fórmula implementada no módulo:

```
custo_em_ETH = fee_em_gwei × unidades_de_gas × 1e-9
```

**Cenário de referência.** Premissas declaradas para permitir recálculo: fundo executando 200 swaps em DEX por mês, 150.000 unidades de gas cada, ETH cotado a 4.268 dólares.

| Cenário | Fee em Gwei | Custo por swap em ETH | Custo por swap em USD | Custo mensal em USD |
| --- | --- | --- | --- | --- |
| Pico de congestionamento | 80,000 | 0,0120000 | 51,22 | 10.243 |
| Média de dia agitado | 40,000 | 0,0060000 | 25,61 | 5.122 |
| Média de dia calmo | 12,000 | 0,0018000 | 7,68 | 1.536 |
| Janela de baixa pressão | 5,000 | 0,0007500 | 3,20 | 640 |
| Medido em 01/09/2026 | 0,204 | 0,0000306 | 0,13 | 26 |

Deslocando metade das operações de um dia agitado, a 40 Gwei, para uma janela de baixa pressão, a 5 Gwei, a economia estimada é de 2.241 dólares por mês por fundo.

Três ressalvas necessárias sobre esse número:

1. Nem toda operação é adiável. Arbitragem e liquidação têm janela rígida. A economia se aplica ao subconjunto de operações discricionárias, como rebalanceamento, entrada gradual e gestão de tesouraria.
2. O regime medido em 01/09/2026 foi de 0,204 Gwei, ordens de magnitude abaixo dos cenários históricos de congestionamento. Em regime baixo, a economia absoluta por operação é irrelevante. A seção 4 trata dessa sensibilidade em detalhe.
3. A economia depende de mudança de comportamento do usuário, não apenas da existência da ferramenta. O painel informa, a decisão continua humana.

### O valor que independe do regime de taxa

Mesmo com gas barato, três valores permanecem:

* **Detecção de anomalia.** Um salto de 0,2 para 20 Gwei representa uma multiplicação por cem no custo relativo. A variação percentual bloco a bloco, já implementada no módulo, captura isso independentemente do nível absoluto.
* **Confirmação de janela.** Reduzir a hesitação antes de uma ordem grande tem valor operacional mesmo quando o custo é baixo.
* **Base para outras redes.** O TAP explicita que a arquitetura deve servir de prova de conceito para redes L1 e L2 adicionais, onde os regimes de taxa diferem substancialmente.

### Declaração do problema

> Gestores de fundos e traders institucionais que executam operações de alto volume na Ethereum decidem o momento e o custo de execução com base em médias históricas que suavizam justamente a volatilidade que os afeta. Sem um diagnóstico ao vivo da pressão da rede e da taxa recomendada, assumem uma de duas perdas: pagar prêmio de segurança em toda operação, ou executar em pico e ter a transação travada, com a taxa debitada de qualquer forma.

### Hipóteses de valor

| Código | Hipótese | Como testar | Situação |
| --- | --- | --- | --- |
| H1 | Um indicador único de pressão da rede é mais acionável do que taxas brutas | Teste de compreensão com usuários, medindo tempo até decisão | Implementado, não validado com usuário |
| H2 | Latência abaixo de um segundo muda o comportamento de execução em relação ao polling de 12 segundos | Teste A/B entre as duas arquiteturas durante picos | Bloqueado pela ausência de SSE e WebSocket |
| H3 | Custo em dólar é decisivo para o fechamento da decisão | Instrumentar a tela e medir engajamento no bloco de estimativas | Bloqueado pela ausência de conversão |
| H4 | Estimativas por tipo de operação são preferíveis a Gwei puro | Entrevista com gestores e comparação com o Etherscan | Implementado, não validado com usuário |

Vale notar que H2, na forma como está escrita, tornou-se menos central após a pesquisa sobre a plataforma. Se a Alphractal entrega dados institucionais com atualização de 1 a 5 minutos, um módulo que atualiza a cada 12 segundos já opera em outra ordem de grandeza. A hipótese que passa a merecer teste é diferente: se a notificação ativa, e não a frequência de atualização, é o que muda o comportamento.

---

## 4. Análise de mercado


### Definição do mercado

O produto vive na interseção de dois mercados. O primeiro é o de inteligência de mercado cripto, onde a Alphractal compete. O segundo é o de ferramentas de infraestrutura blockchain, onde estão os concorrentes diretos da feature, como APIs de gas e monitoramento de mempool.

Essa distinção é determinante para a estratégia. O módulo Fees é uma feature de retenção e diferenciação dentro do primeiro mercado, não um produto autônomo no segundo. O objetivo não é vencer o mercado de gas trackers, e sim evitar que o usuário precise sair da Alphractal para responder a uma pergunta operacional.

### Dimensionamento

Não existe número público confiável para um mercado de "monitoramento de gas fee". Em lugar de estimar um valor arbitrário, o dimensionamento aqui é feito de baixo para cima, a partir do que é verificável.

| Camada | Definição | Estimativa | Base |
| --- | --- | --- | --- |
| TAM | Todo usuário de plataformas de analytics cripto que executa transações on-chain | Não dimensionável com dado público confiável | Nenhuma fonte confiável encontrada |
| SAM | Base atual da Alphractal | "Milhares de analistas", conforme o site. Fontes secundárias mencionam 19.000 usuários em 40 mercados, número não confirmado no site | Site da empresa |
| SAM institucional | Fatia institucional da base | Não dimensionável sem dado do parceiro | A empresa possui oferta institucional dedicada, mas não publica o tamanho desse segmento |
| SOM em 12 meses | Usuários que abrem a aba Fees ao menos uma vez por semana | Não estimado neste documento | Ver observação abaixo |

**Observação metodológica.** A versão anterior desta análise estimava o SOM aplicando percentuais de engajamento típicos sobre a base. Esse cálculo foi removido por não ser sustentável: a premissa de que 15 a 25 por cento da base abriria a aba não tinha base empírica, e multiplicar uma estimativa por um número de usuários já incerto produziria uma falsa precisão.

A alternativa é direta e barata. A Alphractal já possui telemetria da aba Fees em produção. Uma única consulta ao analytics existente, medindo usuários únicos por semana na sub aba nos últimos 90 dias, substitui toda a estimativa por um número real. **Esta é a primeira pergunta a fazer ao parceiro na retomada do projeto.**

### Valor econômico movimentado

Como o produto entrega economia de custo, um dimensionamento alternativo é pela economia agregada gerada:

```
valor_anual = usuários_ativos × operações_por_mês × economia_média_por_operação × 12
```

Com mil usuários institucionais ativos e os parâmetros do cenário de referência da seção 3, chega-se a aproximadamente 26,9 milhões de dólares por ano. Esse número é fortemente sensível ao regime de taxa, como a próxima subseção demonstra, e não deve ser apresentado isoladamente ao parceiro.

### Sensibilidade ao regime de taxas

Este é o achado de maior impacto sobre a proposta de valor.

Na validação executada em 01/09/2026 contra a Ethereum Mainnet, a taxa recomendada medida foi de 0,204 Gwei, com a rede em ocupação de aproximadamente 31 por cento e pressão classificada como baixa. Gas trackers públicos consultados no mesmo período reportavam valores da mesma ordem de grandeza.

Nesse regime, uma transferência de ETH custa fração de centavo. O argumento de economia de custo, que sustenta o cálculo de 26,9 milhões de dólares acima, não se sustenta.

Isso não invalida o produto. Reposiciona-o.

| Regime | Fee típica | Proposta de valor dominante | Métrica de sucesso apropriada |
| --- | --- | --- | --- |
| Baixo, como o atual | abaixo de 5 Gwei | Confirmação de janela segura e detecção de anomalia | Redução do tempo até decisão |
| Médio | 5 a 40 Gwei | Otimização do timing de operações discricionárias | Economia por operação deslocada |
| Alto ou de pico | acima de 40 Gwei | Prevenção de perda e de transação travada | Operações adiadas com sucesso |

**Recomendação de comunicação.** Apresentar o valor como seguro contra volatilidade, não como economia contínua. A ferramenta custa pouco para manter e se paga no primeiro pico evitado. Esse enquadramento é robusto nos três regimes. O de economia mensal recorrente não é, e se apresentado durante um período de taxas baixas será desmentido pelos próprios dados que o painel exibe.

**Consequência para o roadmap.** Em regime baixo, o valor concentra-se na detecção de mudança de regime. Isso eleva a prioridade da notificação ativa, que a plataforma já sabe fazer por meio do Smart Alerts, acima da prioridade de reduzir a latência de atualização de 12 segundos para menos de um.

### Tendências

| Código | Tendência | Efeito sobre o produto |
| --- | --- | --- |
| T1 | Migração de atividade para redes L2 | Reduz a pressão de gas na camada 1, mas multiplica o número de redes a monitorar. O TAP já antecipa isso ao pedir que a arquitetura sirva de prova de conceito para outras redes |
| T2 | EIP-4844 e blob gas | Cria um segundo mercado de taxa, com dinâmica própria. Oportunidade de diferenciação a baixo custo |
| T3 | Institucionalização do cripto | Traz operadores acostumados a análise formal de custo de transação, que esperam custo medido e não estimado |
| T4 | Previsão de gas por aprendizado de máquina | A Blocknative posiciona previsão de próximo bloco com modelos preditivos sobre a mempool. Isso eleva a régua: telemetria reativa é o piso do mercado, previsão é o teto |
| T5 | Regime de taxas historicamente baixo | Desloca o valor de economizar para confiar e detectar anomalia |

### Cinco Forças de Porter

Análise no nível da feature dentro da plataforma, não da empresa.

**Rivalidade entre concorrentes: alta no mercado isolado, baixa no contexto.** Gas trackers são numerosos, maduros e majoritariamente gratuitos. O detalhe competitivo é que nenhum deles resolve o problema no contexto onde a decisão acontece. O usuário da Alphractal está analisando mercado, e sair para o Etherscan quebra a linha de raciocínio.

**Ameaça de novos entrantes: alta tecnicamente, baixa contextualmente.** Construir um gas tracker é acessível, com dados públicos, bibliotecas maduras e provedores RPC gratuitos. Este projeto é a prova, um MVP funcional em quatro semanas. A barreira não é técnica, é distribuição e contexto.

**Poder de barganha dos fornecedores: médio e mitigável.** O fornecedor crítico é o provedor RPC.

| Provedor | Custo | Risco |
| --- | --- | --- |
| PublicNode, em uso atualmente | Gratuito | Sem SLA, sem suporte, limite de requisições não contratual, sem acesso confiável à mempool |
| Alchemy ou Infura | Nível gratuito mais planos pagos | SLA contratual, WebSocket estável, mempool via assinatura |
| Nó próprio | Investimento inicial mais operação | Elimina o fornecedor, cria custo operacional fixo |

O poder do fornecedor é mitigado por uma decisão de design: a troca de provedor exige alterar uma única variável de ambiente, sem mudança de código.

**Poder de barganha dos compradores: médio a alto.** Usuários institucionais são exigentes e dispõem de alternativas gratuitas. Não pagariam pelo módulo isolado. O poder é mitigado pelo fato de a feature integrar uma assinatura já contratada.

**Ameaça de substitutos: alta.** Substitutos existem em abundância e são bons: carteiras com estimador embutido, agregadores de DEX que otimizam gas automaticamente, bots de execução, e a opção de simplesmente aceitar o que a carteira sugerir. Este é o risco competitivo mais sério, e a razão pela qual a integração contextual, e não a qualidade isolada do dado, precisa ser o eixo estratégico.

### Posicionamento recomendado

> O módulo não é um gas tracker. É a camada de decisão de execução dentro de uma plataforma de inteligência de mercado.

Consequências práticas dessa escolha:

* Não perseguir paridade de features com a Blocknative em previsão por aprendizado de máquina e cobertura de dezenas de redes. Perder essa corrida é irrelevante para o negócio da Alphractal.
* Investir na tradução: pressão da rede, recomendação de janela e custo por tipo de operação. O MVP já acertou nesse ponto.
* Cruzar taxa com as demais métricas da Alphractal. Um gas tracker isolado nunca poderá fazer isso, o que torna essa a vantagem estrutural mais difícil de atacar.

---

## 5. Análise competitiva

### Universo competitivo

| Camada | Quem | Natureza da ameaça |
| --- | --- | --- |
| Diretos | Etherscan Gas Tracker, Blocknative Gas Platform, Owlracle, extensões de navegador | Resolvem a mesma pergunta, de graça, fora do contexto |
| Indiretos | Dune, Nansen, Glassnode, Arkham, Token Terminal | Competem pela atenção do mesmo analista com outro recorte de dado on-chain |
| Substitutos | Estimador da MetaMask, agregadores de DEX, bots de execução, nó próprio do fundo | Resolvem a dor sem que o usuário perceba que tinha um problema de informação |

### Benchmark

| Critério | Cagimadu, este MVP | Etherscan Gas Tracker | Blocknative Gas Platform | Dune | MetaMask |
| --- | --- | --- | --- | --- | --- |
| Custo para o usuário | Incluso na assinatura | Gratuito | Nível gratuito mais planos comerciais | Gratuito e pago | Gratuito |
| Fonte do dado | `eth_feeHistory` sobre blocos confirmados | Blocos e mempool | Mempool em tempo real | SQL sobre dados indexados | Heurística do provider |
| Previsão de próximo bloco | Não | Estimativa por faixa | Sim, com modelos preditivos | Não | Sim, implícita |
| Redes cobertas | 1 | 1 por explorador | mais de 40 | Muitas | Muitas |
| Latência do dado | 12 segundos | Segundos | Abaixo de um segundo | Minutos a horas | Ao abrir a carteira |
| Custo em dólar | Não | Sim | Sim | Configurável | Sim |
| Custo por tipo de operação | Sim, três tipos | Sim | Via API | Configurável | Só a transação atual |
| Indicador sintético de pressão | Sim, quatro níveis | Não | Confiança da previsão | Não | Não |
| Recomendação textual de janela | Sim | Não | Não | Não | Não |
| Sinalização de dado obsoleto | Sim | Não aplicável | Não aplicável | Não aplicável | Não aplicável |
| Integração com métricas de mercado | Potencial, via Alphractal | Não | Não | Parcial | Não |
| API pública | Sim, REST | Sim | Sim | Sim | Não |
| Código aberto | Sim, MIT | Não | Não | Apenas as consultas | Parcial |

### Matriz de posicionamento

```
                     Alta profundidade técnica do dado
                                   |
               Blocknative         |
            (mempool, ML,          |
             40+ redes)            |          [ALVO]
                                   |       profundo e
                                   |       integrado
         Etherscan                 |
      (referência,                 |     [HOJE]
       standalone)                 |   integrado, mas
                                   |     dado raso
   --------------------------------+--------------------------------
      Baixa integração com         |     Alta integração com
      o fluxo de decisão           |     o fluxo de decisão
                                   |
               MetaMask            |
            (estimador             |
             embutido)             |
                                   |
                     Baixa profundidade técnica do dado
```

O quadrante superior direito, que combina dado profundo e integração ao fluxo de decisão, está vago. Nenhum concorrente reúne mempool em tempo real com o contexto de uma plataforma de inteligência de mercado.

A posição atual do módulo é integrada mas rasa: blocos confirmados, sem mempool, sem previsão, sem dólar. O caminho da posição atual para a posição-alvo é exatamente a lista de lacunas da seção 10. Isso reforça que essas lacunas não são detalhes de implementação, e sim a distância entre onde o produto está e onde ele seria defensável.

### Vantagens competitivas

Ordenadas por sustentabilidade.

| Ordem | Vantagem | Sustentabilidade | Justificativa |
| --- | --- | --- | --- |
| 1 | Contexto de decisão: o dado aparece onde a análise já acontece | Alta | Um concorrente externo não replica sem construir uma plataforma de analytics inteira |
| 2 | Cruzamento com as mais de 1.500 métricas da Alphractal | Alta | Ativo proprietário do parceiro |
| 3 | Tradução em vez de exibição: pressão, janela, custo por operação | Média | Copiável, mas exige uma decisão de produto que os concorrentes não tomaram |
| 4 | Portabilidade de provider por variável de ambiente | Média | Reduz dependência e poder de negociação do fornecedor |
| 5 | Transparência do método, com fórmulas abertas e código MIT | Média | Diferencia frente a caixas-pretas, e é auditável por cliente institucional |
| 6 | Custo de infraestrutura zero | Baixa | Vantagem transitória, desaparece com escala |

### Desvantagens competitivas

| Ordem | Desvantagem | Gravidade | Mitigação |
| --- | --- | --- | --- |
| 1 | Sem mempool, portanto reativo e não preditivo | Alta | Provider com assinatura de pendentes, o que exige plano pago |
| 2 | Sem previsão de próximo bloco | Alta | Ver observação abaixo |
| 3 | Sem conversão para dólar | Alta | A plataforma já tem cotação e convenção de nomes |
| 4 | Latência de 12 segundos contra menos de um segundo dos líderes | Baixa no contexto | A plataforma que hospedará o módulo atualiza a cada 1 a 5 minutos |
| 5 | Uma única rede | Média | Já previsto no TAP como prova de conceito para L1 e L2 |
| 6 | Provider gratuito sem SLA | Média | Migração para Alchemy ou Infura em produção |
| 7 | Sem histórico persistente | Baixa no MVP | Persistência é decisão de fase posterior |

**Observação sobre a desvantagem 2, verificada empiricamente.** A previsão da próxima base fee não exige aprendizado de máquina. A EIP-1559 a define por fórmula determinística a partir da ocupação do bloco atual, e a biblioteca `viem` já retorna esse valor: em `eth_feeHistory`, o array `baseFeePerGas` contém `blockCount + 1` entradas, e a última é a base fee projetada do próximo bloco.

Isso foi confirmado por execução contra a Mainnet em 01/09/2026. Com `blockCount: 2`, o array retornou três entradas, sendo a última a projeção do bloco seguinte. O código atual consome os índices 0 e 1 e ignora o índice 2, ou seja, **recebe o dado de previsibilidade a cada requisição e o descarta**.

Expor esse valor fecha parcialmente a lacuna competitiva mais visível frente à Blocknative, sem qualquer custo adicional de RPC. É o achado de maior razão entre valor e esforço de toda esta análise.

**Observação sobre a desvantagem 4.** A gravidade foi rebaixada de média para baixa após a pesquisa sobre a plataforma. A oferta institucional da Alphractal descreve atualização de 1 a 5 minutos. O módulo, com polling de 12 segundos, já é entre 5 e 25 vezes mais rápido que a linha de base da plataforma que o hospedará. A latência continua sendo motivo para implementar SSE e WebSocket, mas por conformidade contratual e economia de RPC, não por percepção do usuário.

### Estratégia competitiva recomendada

1. Não competir em profundidade bruta. A Blocknative tem anos de vantagem em mempool e modelagem preditiva, e perder essa corrida não afeta o negócio da Alphractal.
2. Competir em integração e interpretação, movendo o produto para o quadrante superior direito com o mínimo de profundidade necessária: próxima base fee, que é gratuita, dólar, que é barato, SSE, que é barato, e mempool, que é caro e adiável.
3. Usar o código aberto como ativo de confiança. Para público institucional, um método de cálculo auditável é argumento contra estimadores opacos.
4. Medir contra o Etherscan, não contra a Blocknative. O Etherscan é o parâmetro mental do usuário. Se o número do painel bater com o dele, a credibilidade está estabelecida. O link para essa validação cruzada já está na tela de Fees, o que é uma decisão de produto acertada.

---

## 6. Personas e jornadas

> Nota metodológica. As personas são hipóteses de trabalho derivadas do TAP, que menciona gestores de fundos e investidores corporativos, e do posicionamento institucional publicado pela Alphractal, que cita gestores de fundos, traders institucionais, desenvolvedores quantitativos e gestores de portfólio. Não houve pesquisa primária com usuários, já que o TAP prevê apenas dois encontros com o parceiro e nenhum acesso à base. Cada persona traz as perguntas que precisam ser validadas.

### Persona primária: gestor de fundo cripto

| Campo | Descrição |
| --- | --- |
| Nome de trabalho | Ricardo Menezes |
| Cargo | Gestor de portfólio em fundo cripto de médio porte |
| Contexto de uso | Múltiplos monitores, plataforma aberta ao longo do dia, decisões sob pressão de tempo |
| Maturidade técnica | Alta em mercado, média em blockchain. Entende gas, não lê JSON-RPC |
| Frequência de execução on-chain | Hipótese de 100 a 300 operações por mês, a validar |

**Objetivos.** Executar rebalanceamentos com custo previsível. Justificar decisões de execução ao comitê de investimento com dado auditável. Evitar transações travadas, que consomem taxa e deixam a posição exposta.

**Frustrações.** A média de 24 horas não informa se é seguro executar nos próximos dois minutos. Alternar entre a Alphractal e o Etherscan quebra a linha de raciocínio. Números em Gwei exigem conversão mental antes de virarem decisão.

**Atendimento pelo MVP**

| Necessidade | Situação |
| --- | --- |
| Taxa recomendada ao vivo com variação em relação ao bloco anterior | Atendido |
| Diagnóstico de saúde da rede em quatro níveis, com recomendação textual | Atendido |
| Custo em dólar | Não atendido |
| Alerta de mudança de regime | Não atendido, embora a plataforma já possua motor de alertas |
| Auditabilidade do método, com fórmulas abertas e link de validação cruzada | Atendido |

**A validar com o parceiro.** O gestor decide em Gwei ou em dólar? Qual o tamanho e a frequência típicos das operações on-chain da base institucional? Ele prefere ser notificado ou consultar quando precisa?

### Persona secundária: analista on-chain

| Campo | Descrição |
| --- | --- |
| Nome de trabalho | Marina Duarte |
| Cargo | Analista de pesquisa on-chain |
| Contexto de uso | Sessões longas de investigação, cruzando métricas para produzir relatórios |
| Maturidade técnica | Alta em blockchain. Lê contratos e consulta APIs diretamente |

**Objetivos.** Correlacionar picos de taxa com eventos de mercado, como liquidações, lançamentos e movimentos de grandes detentores. Extrair séries históricas para análise própria.

**Atendimento pelo MVP**

| Necessidade | Situação |
| --- | --- |
| Série histórica de taxas | Parcial. Até 1.024 blocos, cerca de 3,4 horas, sem persistência |
| Acesso programático | Atendido, com API REST documentada |
| Classificação de volatilidade | Atendido, por coeficiente de variação em três níveis |
| Correlação com outras métricas | Não atendido no MVP, depende da integração com a plataforma |

**Nota de produto.** O limite de 1.024 blocos não é arbitrário, é o teto prático de `eth_feeHistory` na maioria dos provedores. Estender o histórico exige persistência, não um parâmetro maior.

### Persona terciária: engenheiro de plataforma da Alphractal

| Campo | Descrição |
| --- | --- |
| Nome de trabalho | Thiago Nakamura |
| Cargo | Engenheiro de plataforma na Alphractal |
| Contexto de uso | Avalia se o módulo entra na plataforma de produção |
| Maturidade técnica | Muito alta |

Esta persona não é usuária do painel. É a guardiã da decisão de adoção, e a mais determinante para o sucesso do projeto. Costuma ser esquecida em análises centradas no usuário final.

**Objetivos.** Avaliar custo de manutenção e de integração. Garantir que a arquitetura escale para as demais redes do roadmap da empresa. Não herdar dívida técnica de um projeto acadêmico.

**Atendimento pelo MVP**

| Necessidade | Situação |
| --- | --- |
| Separação de camadas, com MVC, services e injeção de dependência | Atendido |
| Testabilidade, com service injetável por interface | Atendido, 11 testes |
| Portabilidade de provider | Atendido, por variável de ambiente |
| Validação de entrada e de ambiente | Atendido, via Zod |
| Arquitetura WebSocket e SSE prometida no TAP | Não atendido |
| Versões de dependência fixadas | Não atendido, todas em `"latest"` |
| Contrato de API compatível com o padrão da plataforma | Não atendido, ver observação |

**Observação sobre o contrato de API.** A API da Alphractal devolve arrays JSON simples, sem envelope, com rotas escopadas por ativo e recorte por `startDate` e `endDate`. A API do módulo devolve `{ data, meta }`, sem escopo de ativo e com recorte por quantidade de blocos. A integração exigirá uma camada de adaptação. O envelope do módulo é uma boa decisão para uso autônomo, porque carrega os metadados de cache e obsolescência, mas o custo de adaptação precisa estar declarado.

**Achado.** Para esta persona, a lacuna de WebSocket e SSE é a mais grave das quatro. O TAP vende ao parceiro a validação de nova arquitetura de dados como benefício estratégico, e é justamente esta persona quem julga se essa validação ocorreu. Um MVP com dados corretos e arquitetura de polling não entrega o benefício que foi prometido a ela.

### Jornada do usuário

Momento: Ricardo decide um rebalanceamento de 500 mil dólares, discricionário quanto ao horário.

| Etapa | Ação | Estado | Situação no MVP |
| --- | --- | --- | --- |
| 1. Gatilho | Decide rebalancear a carteira | Confiante | Fora de escopo |
| 2. Consulta | Abre a aba Fees | Neutro | Atendido, carrega em cerca de um segundo |
| 3. Diagnóstico | Lê a taxa recomendada e a pressão da rede | Atento | Atendido |
| 4. Tradução | Estima o custo da operação | Atrito | Parcial, apenas em ETH |
| 5. Contexto | Verifica se o valor está acima ou abaixo do normal | Analítico | Atendido, com gráfico e estatísticas |
| 6. Validação cruzada | Confere no Etherscan | Cético | Atendido, link presente na tela |
| 7. Decisão | Executa agora ou aguarda | Decidido | Parcial |
| 8. Espera | Se adiou, precisa saber quando voltar | Atrito maior | Não atendido |
| 9. Execução | Executa na carteira | Aliviado | Fora de escopo, o TAP exclui execução |

### Os dois pontos de atrito

**Etapa 4, a conversão mental para dólar.** O painel entrega 0,0000306 ETH. O gestor precisa saber quanto isso é em dólar. A conversão é trivial para o sistema e cognitivamente cara para o humano, repetida dezenas de vezes por dia. O agravante identificado na pesquisa é que a plataforma que hospedará o módulo já expõe taxas em dólar em suas próprias métricas, o que torna a ausência ainda mais visível para o usuário.

**Etapa 8, a espera cega.** É o atrito mais caro e o menos visível. Se o gestor decide adiar, o produto o abandona exatamente no momento em que ele mais precisaria dele, porque o painel não avisa quando a janela abre. Na prática, isso significa que ou ele executa assim que vê, ou esquece. A recomendação de aguardar uma janela melhor, que o MVP exibe hoje, é um conselho que o produto não ajuda a seguir.

Este atrito tem solução mais barata do que parecia. A Alphractal já opera o Smart Alerts, com alertas multicondicionais entregues por e-mail, Telegram e in-app. O módulo não precisa construir um sistema de notificação. Precisa expor `networkPressure` e `recommendedFeeGwei` como métricas consumíveis por esse motor.

### Mapa de empatia do gestor

| Dimensão | Conteúdo |
| --- | --- |
| Pensa e sente | Se eu errar a taxa, a transação trava e eu explico isso ao comitê. Pressão por eficiência de capital e desconfiança de números sem método explícito |
| Vê | Múltiplos painéis simultâneos, números em Gwei que precisa converter, concorrentes com mais dados |
| Ouve | Comitê cobrando custo de execução, analistas citando o Etherscan como referência, mercado discutindo redes L2 |
| Fala e faz | Confere no Etherscan antes de operações grandes, adia operações discricionárias por intuição, superestima a taxa por segurança |
| Dores | Taxa cobrada mesmo em transação falha, ponto cego entre a média histórica e o agora, troca de contexto entre ferramentas |
| Ganhos | Custo previsível, decisão defensável perante o comitê, menos tempo em ferramenta operacional e mais em análise |

### Casos de uso priorizados

| Código | Caso de uso | Persona | Frequência | Valor | Situação |
| --- | --- | --- | --- | --- | --- |
| UC1 | Consultar a taxa recomendada agora | Ricardo | Muito alta | Alto | Atendido |
| UC2 | Estimar o custo de uma operação específica | Ricardo | Alta | Alto | Parcial, apenas em ETH |
| UC3 | Diagnosticar a saúde da rede | Ricardo | Alta | Alto | Atendido |
| UC4 | Comparar a taxa atual com a faixa recente | Ricardo e Marina | Média | Médio | Atendido |
| UC5 | Ser alertado quando a pressão cair | Ricardo | Média | Alto | Não atendido |
| UC6 | Inspecionar um bloco específico | Marina | Baixa | Médio | Atendido |
| UC7 | Extrair a série via API | Marina | Média | Médio | Atendido |
| UC8 | Correlacionar taxa com métricas de mercado | Marina | Média | Alto | Fora do MVP |
| UC9 | Avaliar a arquitetura para adoção | Thiago | Uma vez | Crítico | Parcial |

UC5 e UC9 são os casos de alto valor não atendidos, e ambos convergem para o mesmo item técnico: a arquitetura de streaming exigida pelo TAP.

---

## 7. Proposta de valor

### Perfil do cliente

**Tarefas a realizar**

| Tipo | Tarefa |
| --- | --- |
| Funcional | Determinar o custo de uma operação on-chain antes de executá-la |
| Funcional | Decidir o momento de execução de operações discricionárias |
| Funcional | Evitar transações travadas ou revertidas |
| Social | Justificar a decisão de execução ao comitê de investimento |
| Emocional | Operar com confiança em vez de intuição |

**Dores**

| Código | Dor | Intensidade |
| --- | --- | --- |
| D1 | Média histórica não reflete o custo do próximo minuto | Alta |
| D2 | Taxa cobrada mesmo quando a transação falha | Alta |
| D3 | Troca de contexto entre a plataforma de análise e o gas tracker | Média |
| D4 | Gwei exige conversão mental para dólar | Média |
| D5 | Sem aviso quando a janela favorável se abre | Alta |
| D6 | Desconfiança de estimadores opacos | Média |

**Ganhos esperados**

| Código | Ganho |
| --- | --- |
| G1 | Custo previsível antes de executar |
| G2 | Diagnóstico da rede em uma olhada |
| G3 | Decisão auditável e defensável |
| G4 | Menos tempo em ferramenta operacional |
| G5 | Economia acumulada em operações deslocadas |

### Mapa de valor

**Produtos e serviços entregues.** Painel de taxa recomendada ao vivo com variação bloco a bloco. Indicador sintético de pressão da rede em quatro níveis. Estimativas de custo por tipo de operação, para transferência, swap e emissão de NFT. Gráfico histórico com mínima, média, máxima e volatilidade. Explorador de blocos recentes. API REST aberta e documentada.

**Analgésicos**

| Dor | Analgésico | Situação |
| --- | --- | --- |
| D1 | Taxa do bloco mais recente, atualizada a cada 12 segundos | Entregue |
| D2 | Pressão da rede com recomendação explícita de adiar em pico | Entregue |
| D3 | Módulo dentro da própria plataforma | Parcial, painel completo mas não integrado |
| D4 | Conversão para dólar | Não entregue |
| D5 | Alerta de mudança de regime | Não entregue |
| D6 | Fórmulas abertas, código MIT e link de validação no Etherscan | Entregue |

**Criadores de ganho**

| Ganho | Criador | Situação |
| --- | --- | --- |
| G1 | Estimativas por operação com unidades de gas explícitas | Parcial, apenas em ETH |
| G2 | Taxa, variação e pressão reunidas em uma tela | Entregue |
| G3 | Método publicado e verificável | Entregue |
| G4 | Leitura em segundos, sem configuração | Entregue |
| G5 | Recomendação de janela por nível de pressão | Entregue |

**Grau de encaixe.** Oito dos onze itens estão plenamente entregues. As três lacunas, D4, D5 e G1, concentram-se no mesmo eixo: fechar a decisão em unidade monetária e avisar quando agir. Não é coincidência que sejam exatamente os itens que o TAP exige e que não foram implementados.

### Declaração de proposta de valor

> Para gestores de fundos e traders institucionais que executam operações de alto volume na Ethereum e precisam decidir quando e a que custo executar, o Cagimadu é um módulo de telemetria ao vivo que traduz o estado bruto da rede em uma taxa recomendada, um diagnóstico de pressão e um custo estimado por operação, dentro da plataforma onde a análise já acontece. Diferente de gas trackers externos, que exibem números e exigem interpretação, o Cagimadu entrega a leitura e a recomendação, com método aberto e auditável.

---

## 8. Business Model Canvas

Modelo da feature dentro do negócio da Alphractal, não de um negócio autônomo.

### Segmentos de clientes

Primário: gestores de fundos e investidores corporativos, o segmento institucional da Alphractal. Secundário: analistas de pesquisa on-chain. Interno: time de engenharia da Alphractal, que decide a adoção.

### Proposta de valor por público

| Público | Valor |
| --- | --- |
| Usuário final | Previsibilidade de custo e diagnóstico operacional sem sair da plataforma |
| Alphractal | Transformação de uma sub aba descritiva em ferramenta operacional, diferenciação frente a concorrentes de analytics e validação de arquitetura reutilizável para outras redes |
| Inteli Blockchain | Portfólio público e canal com o ecossistema Web3 |

### Canais

Aba Fees da plataforma Alphractal, que é o canal-alvo. API REST, para consumo programático. Repositório público sob licença MIT, como canal de credibilidade técnica. Demo Day de 03/09/2026, como canal de entrega ao parceiro.

### Relacionamento com clientes

Autosserviço, sem onboarding e sem configuração. Transparência de método como construtor de confiança. Sem suporte após o encerramento do projeto, conforme restrição explícita do TAP.

### Fontes de receita

O módulo não gera receita direta. Contribui de forma indireta por três vias.

| Via | Mecanismo | Mensurável por |
| --- | --- | --- |
| Retenção | Reduz o motivo para o usuário sair da plataforma | Churn do segmento institucional |
| Diferenciação | Argumento de venda no nível institucional | Taxa de conversão institucional |
| Expansão | Base para monitoramento multi-rede | Novas features derivadas |

### Recursos-chave

Acesso a nó RPC Ethereum. Código-fonte sob licença MIT, com backend em Node e frontend em React. Conhecimento de EIP-1559 e da mecânica de gas, encapsulado na camada de mapeamento. Base de usuários e conjunto de mais de 1.500 métricas da Alphractal, que são ativos do parceiro.

### Atividades-chave

Ingestão e normalização de dados on-chain. Cálculo de taxa recomendada, pressão e volatilidade. Entrega ao painel com degradação graciosa. Manutenção da paridade com provedores de referência como o Etherscan.

### Parcerias-chave

| Parceiro | Papel | Criticidade |
| --- | --- | --- |
| Alphractal e Nortech Labs | Cliente, dono do canal e do contexto | Crítica |
| Provedor RPC | Fornecedor do dado bruto | Crítica, ponto único de falha |
| Render | Hospedagem do protótipo | Baixa, substituível |
| Inteli Blockchain | Executor do projeto | Crítica durante as quatro semanas |

### Estrutura de custos

Detalhada na seção 12.

---

## 9. SWOT e matriz TOWS

### Forças

| Código | Força | Evidência |
| --- | --- | --- |
| F1 | Arquitetura em camadas com injeção de dependência, testável e integrável | A função de criação da aplicação aceita o serviço injetado |
| F2 | Degradação graciosa: em falha do provider após sucesso, devolve o último valor válido sinalizado como obsoleto | Bloco de tratamento no cache em memória |
| F3 | Deduplicação de requisições concorrentes: N usuários simultâneos geram uma única chamada RPC | Mapa de requisições pendentes no cache |
| F4 | Portabilidade de provider por variável de ambiente | Configuração de ambiente validada por Zod |
| F5 | Validação de entrada e de ambiente com erros tipados | Verificado em execução |
| F6 | Tradução do dado bruto em indicador acionável | Pressão da rede, volatilidade e estimativas por operação |
| F7 | Cobertura de testes, lint limpo e build funcional | 11 testes passando |
| F8 | Decisão técnica correta de ignorar a dificuldade pós-Merge, documentada com justificativa | README do projeto |
| F9 | Custo operacional zero | Hospedagem e provider gratuitos |
| F10 | Latência superior à da plataforma que hospedará o módulo | 12 segundos contra 1 a 5 minutos |

### Fraquezas

| Código | Fraqueza | Gravidade |
| --- | --- | --- |
| W1 | Sem WebSocket, arquitetura exigida pelo TAP não implementada | Crítica |
| W2 | Sem SSE, entrega por polling contrariando o TAP | Crítica |
| W3 | Sem conversão para dólar, resultado esperado do TAP não entregue | Crítica |
| W4 | Sem leitura de mempool, sistema reativo e não preditivo | Alta |
| W5 | Dependências fixadas em `"latest"`, build não reproduzível | Alta |
| W6 | Contrato de API incompatível com o padrão da plataforma | Média |
| W7 | Cache em memória, com perda de estado no reinício | Média |
| W8 | Tela de análise de mercado com dados fictícios | Média |
| W9 | Sem limitação de taxa de requisições na API | Média |
| W10 | Identidade visual própria, não integrada ao design system da Alphractal | Média |
| W11 | Mensagem de erro expõe a versão de uma dependência ao cliente | Baixa |

### Oportunidades

| Código | Oportunidade | Facilidade de captura |
| --- | --- | --- |
| O1 | A base fee do próximo bloco já chega do RPC e é descartada | Muito alta |
| O2 | A plataforma já possui motor de alertas, dispensando construção própria | Muito alta |
| O3 | A plataforma já possui métricas de taxa em dólar, com fonte de cotação e convenção de nomes estabelecidas | Alta |
| O4 | O quadrante de dado profundo e integrado ao fluxo está vago no mercado | Média |
| O5 | Cruzamento com as mais de 1.500 métricas da Alphractal, impossível de replicar por concorrente externo | Média |
| O6 | Consulta em linguagem natural via Alpha AI sobre as métricas de taxa | Média |
| O7 | Expansão para redes L2, já prevista como benefício no TAP | Média |
| O8 | Blob gas da EIP-4844, ainda pouco explorado pelos concorrentes | Média |
| O9 | Código MIT como ativo de confiança frente a estimadores opacos | Alta |

### Ameaças

| Código | Ameaça | Severidade |
| --- | --- | --- |
| A1 | Regime de taxas baixo esvazia o argumento de economia de custo | Alta |
| A2 | Concorrentes com mempool e modelagem preditiva definem uma régua difícil | Alta |
| A3 | Substitutos embutidos em carteiras e agregadores resolvem a dor sem o painel | Alta |
| A4 | Provider gratuito pode degradar ou impor limites sem aviso | Média |
| A5 | Migração de atividade para redes L2 reduz a relevância da camada 1 isolada | Média |
| A6 | O TAP encerra o suporte ao fim do projeto, e sem manutenção o módulo se degrada | Alta |

### Matriz TOWS

| | Oportunidades | Ameaças |
| --- | --- | --- |
| **Forças** | **Estratégia de ataque.** Usar a arquitetura em camadas para expor a próxima base fee em poucas linhas, capturando O1. Usar a transparência do método como diferencial frente a caixas-pretas, capturando O9 | **Estratégia de defesa.** Usar a portabilidade de provider contra o risco de fornecedor. Usar a tradução em indicadores contra os substitutos, que fornecem número mas não leitura |
| **Fraquezas** | **Estratégia de reforço.** Expor pressão e taxa como métricas no formato da plataforma, aproveitando O2 e O3 para resolver W3 e o atrito da espera cega com esforço muito menor do que construir do zero | **Estratégia de contenção.** Sem WebSocket, SSE e versões fixadas, o módulo não é adotável em produção, e sem manutenção designada ele se degrada. Fechar W1, W2 e W5 antes do handover é pré-condição |

**Estratégia prioritária.** O maior risco não é competitivo, é o módulo não ser adotado pela Alphractal por falhar exatamente nos critérios de avaliação da persona de engenharia. Fechar W1, W2, W3 e W5 antes do handover vale mais do que qualquer feature nova.

---

## 10. Requisitos, user stories e rastreabilidade do TAP

### Requisitos funcionais


| Código | Requisito | Prioridade | Situação |
| --- | --- | --- | --- |
| RF01 | Consultar a taxa recomendada atual da Ethereum Mainnet | Must | Implementado |
| RF02 | Exibir a variação da taxa em relação ao bloco anterior | Must | Implementado |
| RF03 | Classificar a saúde e a pressão da rede em níveis | Must | Implementado |
| RF04 | Estimar o custo de operações típicas em ETH | Must | Implementado |
| RF05 | Converter as estimativas para dólar | Must | Não implementado |
| RF06 | Exibir o histórico de taxas em gráfico interativo | Must | Implementado |
| RF07 | Permitir seleção da janela temporal do histórico | Should | Implementado, com quatro períodos |
| RF08 | Apresentar mínima, média, máxima e volatilidade do período | Should | Implementado |
| RF09 | Ingerir dados via WebSocket em conexão contínua | Must | Não implementado |
| RF10 | Entregar dados ao painel via SSE | Must | Não implementado |
| RF11 | Capturar o lançamento de novos blocos instantaneamente | Must | Parcial, detecção por polling de 12 segundos |
| RF12 | Monitorar a volatilidade da mempool | Should | Parcial, blocos confirmados em vez de pendentes |
| RF13 | Listar blocos recentes com métricas por bloco | Should | Implementado |
| RF14 | Consultar um bloco específico por número | Could | Implementado |
| RF15 | Recomendar textualmente a ação conforme a pressão | Should | Implementado |
| RF16 | Sinalizar quando o dado exibido está obsoleto | Should | Implementado |
| RF17 | Expor API REST consumível programaticamente | Could | Implementado |
| RF18 | Alertar quando a pressão da rede mudar de faixa | Could | Não implementado |
| RF19 | Exibir a base fee projetada do próximo bloco | Could | Não implementado, embora o dado já esteja disponível |
| RF20 | Executar, assinar ou automatizar transações | Won't | Corretamente ausente |
| RF21 | Fazer deploy de contratos em Mainnet | Won't | Corretamente ausente |
| RF22 | Integrar em ambiente de produção da Alphractal | Won't | Corretamente ausente |

### Requisitos não funcionais

| Código | Requisito | Meta | Situação |
| --- | --- | --- | --- |
| RNF01 | Latência do dado no painel após novo bloco | abaixo de 2 segundos | Não atendido, até 12 segundos |
| RNF02 | Tempo de resposta da API com cache quente | abaixo de 100 ms | Atendido |
| RNF03 | Tempo de resposta da API com cache frio | abaixo de 3 segundos | Atendido, entre 500 e 800 ms medidos |
| RNF04 | Disponibilidade sob falha do provider | degradar sem quebrar | Atendido |
| RNF05 | Consumo de RPC independente do número de usuários | deduplicação de requisições | Atendido |
| RNF06 | Validação de toda entrada externa | 100 por cento dos parâmetros | Atendido |
| RNF07 | Interface responsiva | desktop e mobile | Atendido |
| RNF08 | Build de produção funcional | sem erros | Atendido |
| RNF09 | Cobertura de testes das regras de cálculo | todas as funções de mapeamento | Atendido |
| RNF10 | Código sob licença MIT em repositório público | exigência do TAP | Atendido |
| RNF11 | Build reproduzível | versões fixadas | Não atendido |
| RNF12 | Proteção contra abuso da API | limitação de taxa | Não atendido |
| RNF13 | Não vazar detalhes internos em mensagens de erro | erros sanitizados | Parcial |
| RNF14 | Portabilidade de provedor RPC | sem alteração de código | Atendido |
| RNF15 | Cabeçalhos de segurança HTTP | cabeçalhos básicos | Atendido |
| RNF16 | CORS restrito a origens conhecidas | lista configurável | Atendido |

### User stories

Formato: como determinada persona, quero determinada ação, para obter determinado benefício. Critérios de aceite em Gherkin.

#### US01. Consultar a taxa recomendada agora. Must. Entregue

> Como gestor de fundo, quero ver a taxa recomendada atual da Ethereum para decidir se executo minha operação agora.

```gherkin
Cenário: Taxa disponível
  Dado que a API está conectada à Ethereum Mainnet
  Quando eu abro a aba Fees
  Então vejo a taxa recomendada em Gwei com duas casas decimais
  E vejo o número do bloco de referência
  E vejo o horário da última atualização

Cenário: Provider indisponível após leitura bem-sucedida
  Dado que já carreguei a taxa uma vez
  E o provider RPC passou a falhar
  Quando o painel tenta atualizar
  Então o último valor válido permanece visível
  E vejo um aviso de que o provider está instável
```

Evidência: verificado em execução, com taxa recomendada de 0,204 Gwei para o bloco 25.884.724.

#### US02. Ver a variação em relação ao bloco anterior. Must. Entregue

> Como gestor de fundo, quero ver quanto a taxa variou desde o último bloco para perceber se a rede está esquentando ou esfriando.

```gherkin
Cenário: Taxa subindo
  Dado que a taxa do bloco anterior era 0,1157 Gwei
  E a taxa do bloco atual é 0,2040 Gwei
  Quando o painel calcula a variação
  Então exibe mais 76,32 por cento com indicação visual de alta

Cenário: Divisão por zero protegida
  Dado que a taxa do bloco anterior era zero
  Quando o painel calcula a variação
  Então exibe zero por cento sem erro
```

Evidência: a proteção contra divisão por zero é coberta por teste unitário.

#### US03. Estimar o custo da minha operação em dólar. Must. Não entregue

> Como gestor de fundo, quero ver o custo estimado da operação em dólar para decidir sem precisar converter mentalmente.

```gherkin
Cenário: Custo em dólar
  Dado que a taxa recomendada é 24,60 Gwei
  E o preço do ETH é 4.268,00 dólares
  Quando visualizo a estimativa de um swap em DEX
  Então vejo o valor em ETH e o valor equivalente em dólar

Cenário: Preço do ETH indisponível
  Dado que a fonte de preço está fora do ar
  Quando visualizo a estimativa
  Então vejo o valor em ETH normalmente
  E vejo a indicação de que a conversão está indisponível
  E o painel não quebra
```

Nota de implementação. O campo `usd` já existe no tipo de ponto de série do frontend e nunca é preenchido pela API. A plataforma da Alphractal já expõe métricas equivalentes em dólar, o que sugere adotar a mesma convenção de sufixos em vez de criar uma nova.

#### US04. Diagnosticar a saúde da rede. Must. Entregue

> Como gestor de fundo, quero um indicador único de pressão da rede para avaliar o cenário sem interpretar números brutos.

```gherkin
Esquema do Cenário: Faixas de pressão
  Dado ocupação <ocupacao> e taxa <taxa>
  Então a pressão é <resultado>
  Exemplos:
    | ocupacao | taxa | resultado |
    | 20       | 5    | Baixa     |
    | 65       | 25   | Moderada  |
    | 90       | 30   | Alta      |
    | 100      | 100  | Crítica   |
```

Evidência: as quatro faixas são cobertas por teste unitário.

#### US05. Ver o histórico de taxas em gráfico. Must. Entregue

> Como gestor de fundo, quero ver a evolução recente das taxas para saber se o valor atual está acima ou abaixo do normal.

```gherkin
Cenário: Histórico carregado
  Dado que seleciono o período de uma hora
  Quando o painel consulta o histórico
  Então vejo um gráfico com até 90 pontos
  E vejo mínima, média, máxima e volatilidade do período

Cenário: Inspeção de ponto
  Dado que o gráfico está renderizado
  Quando passo o cursor sobre um ponto
  Então vejo o horário, o valor em Gwei e o número do bloco
```

Nota de design: a redução de até 1.024 blocos para cerca de 90 pontos ocorre no backend, poupando banda e trabalho de renderização.

#### US06. Selecionar a janela temporal. Should. Entregue

```gherkin
Cenário: Troca de período
  Dado que estou vendo o período de uma hora
  Quando seleciono o período de três horas
  Então o histórico recarrega com 900 blocos
  E as estatísticas são recalculadas

Cenário: Limite de blocos respeitado
  Quando solicito mais de 1024 blocos via API
  Então recebo erro 400 com código de validação
```

Evidência: verificado em execução, a requisição com 9999 blocos retornou 400 com mensagem de limite excedido.

#### US07. Receber atualizações sem recarregar. Must. Não entregue

> Como gestor de fundo, quero que o painel se atualize sozinho a cada novo bloco para não decidir com base em dado defasado.

```gherkin
Cenário: Stream conectado
  Dado que abri a aba Fees
  Quando um novo bloco é produzido na Ethereum
  Então o painel recebe o evento em menos de 2 segundos
  E a taxa exibida é atualizada sem nova requisição do cliente

Cenário: Reconexão automática
  Dado que a conexão caiu
  Quando a rede se restabelece
  Então o cliente reconecta automaticamente
  E recebe o estado atual imediatamente
```

Bloqueio: exigência explícita do TAP não implementada. O frontend usa intervalos de 12 e 30 segundos.

#### US08. Ingestão contínua via WebSocket. Must. Não entregue

> Como engenheiro de plataforma da Alphractal, quero que a ingestão use conexão WebSocket persistente para validar a arquitetura antes de escalá-la a outras redes.

```gherkin
Cenário: Assinatura de novos blocos
  Dado que o serviço iniciou
  Então uma conexão WebSocket persistente é aberta com o provider
  E o serviço se inscreve no evento de novos blocos
  Quando um bloco é publicado
  Então o cache é atualizado sem requisição sob demanda

Cenário: Reconexão com espera progressiva
  Dado que a conexão caiu
  Então o serviço tenta reconectar com espera progressiva
  E enquanto isso serve o último dado válido sinalizado como obsoleto
```

Bloqueio: exigência explícita do TAP. É o item que sustenta o benefício de validação arquitetural prometido ao parceiro.

#### US09. Ser alertado quando a janela abrir. Could. Não entregue

> Como gestor de fundo que decidiu adiar uma operação, quero ser avisado quando a pressão da rede cair para não precisar reabrir o painel repetidamente.

```gherkin
Cenário: Mudança de faixa de pressão
  Dado que a pressão estava Alta
  E eu ativei o alerta para a faixa Baixa
  Quando a pressão passa a Baixa
  Então recebo uma notificação
  E o alerta não se repete enquanto a pressão permanecer na mesma faixa
```

Nota de implementação revisada. A Alphractal já opera um motor de alertas multicondicionais com entrega por e-mail, Telegram e in-app. O caminho mais barato não é construir notificação própria, e sim expor `networkPressure` e `recommendedFeeGwei` como métricas consumíveis por esse motor.

#### US10. Ver a base fee projetada do próximo bloco. Could. Não entregue

> Como gestor de fundo, quero ver a base fee projetada do próximo bloco para antecipar se o custo vai subir ou cair.

```gherkin
Cenário: Projeção exibida
  Dado que a base fee do bloco atual é conhecida
  E o RPC retorna a base fee projetada do bloco seguinte
  Então o painel exibe a projeção
  E indica a direção esperada do movimento
```

Evidência da viabilidade: verificado por execução em 01/09/2026 que a chamada de histórico de taxas retorna um array com uma entrada a mais que o número de blocos solicitados, sendo a última a projeção do próximo bloco. O código descarta essa entrada. Custo de implementação muito baixo, sem chamadas RPC adicionais.

#### US11. Continuar operando sob falha do provider. Should. Entregue

```gherkin
Cenário: Falha após leitura bem-sucedida
  Dado que existe um valor em cache
  E o provider RPC falha
  Então a API retorna o último valor sinalizado como obsoleto
  E o status HTTP permanece 200

Cenário: Falha na primeira leitura
  Dado que não existe valor em cache
  E o provider RPC falha
  Então a API retorna 502 com código de erro de RPC
  E o frontend exibe dados demonstrativos claramente identificados
```

#### US12. Não multiplicar chamadas RPC por usuário. Should. Entregue

```gherkin
Cenário: Requisições concorrentes
  Dado que 50 usuários abrem o painel no mesmo instante
  E não há valor em cache
  Quando as requisições chegam à API
  Então apenas uma consulta é feita ao provider
  E as 50 respostas compartilham o mesmo resultado
```

Esta é a decisão arquitetural que torna o custo de RPC independente do tamanho da base de usuários.

### Backlog priorizado

Ordenação por valor de negócio somado à criticidade contratual, dividido pelo esforço.

| Ordem | Item | Valor | Esforço | Razão | Justificativa |
| --- | --- | --- | --- | --- | --- |
| 1 | RNF11, fixar dependências | 6 | 1 | 6,0 | Pré-condição de handover, esforço trivial |
| 2 | US10, base fee do próximo bloco | 5 | 1 | 5,0 | Dado já disponível e descartado, sem custo de RPC |
| 3 | US03, conversão para dólar | 9 | 3 | 3,0 | Obrigatório no TAP, com fonte e convenção já existentes na plataforma |
| 4 | US07, SSE | 9 | 4 | 2,3 | Obrigatório no TAP |
| 5 | US08, WebSocket | 9 | 5 | 1,8 | Obrigatório no TAP, sustenta o benefício prometido e reduz custo de RPC |
| 6 | US09, alertas via motor existente | 7 | 2 | 3,5 | Reavaliado para cima, dado que a plataforma já possui o motor |
| 7 | RF12, mempool | 6 | 8 | 0,8 | Exige provider pago |

### Rastreabilidade do TAP

O projeto atende integralmente 13 das 26 cláusulas exigíveis do TAP, atende parcialmente outras 9 e deixa 4 sem atendimento. Somando entregas totais e parciais, 22 das 26 cláusulas exigíveis têm alguma entrega, o equivalente a 85 por cento.

As quatro cláusulas não atendidas são a ingestão contínua via WebSocket, o benefício de validação de nova arquitetura de dados, a entrega ao painel via SSE e a conversão das taxas para dólar.

As subseções a seguir mapeiam cada cláusula do TAP para a evidência correspondente.

#### Objetivo

| Código | Cláusula do TAP | Situação | Observação |
| --- | --- | --- | --- |
| T01 | Desenvolver e integrar um módulo de monitoramento em tempo real na aba Fees | Parcial | O módulo existe. A integração na aba da plataforma não ocorreu, mas é excluída por outra cláusula do próprio TAP |
| T02 | Arquitetura estruturada para ingestão contínua de dados ao vivo | Não atendido | A ingestão é sob demanda, não contínua |
| T03 | Capturar a volatilidade das taxas | Atendido | Coeficiente de variação em três níveis |
| T04 | Capturar o lançamento de novos blocos instantaneamente | Parcial | Detecção em até 12 segundos |
| T05 | Converter métricas brutas em estimativas financeiras reais | Parcial | Em ETH, sem dólar |
| T06 | Painel integrado ao visual da plataforma | Parcial | Painel completo, visual não integrado ao design system |
| T07 | Protótipo funcional de ponta a ponta | Atendido | Verificado em execução |

#### Benefícios esperados para o parceiro

| Código | Benefício | Situação | Observação |
| --- | --- | --- | --- |
| T08 | Módulo analítico e interface em React que eleva a aba Fees de histórica para operacional | Atendido | Pressão da rede e recomendação de janela entregues |
| T09 | Aproximação com talentos do clube | Atendido | Repositório público sob autoria do time |
| T10 | Validação de nova arquitetura de dados via WebSockets | Não atendido | Nenhuma conexão WebSocket no código |

T10 é o achado mais grave da matriz. O TAP lista três benefícios ao parceiro, e este é um deles, explicitamente arquitetural. É justamente o que serviria de prova de conceito para a empresa escalar o monitoramento a outras redes L1 e L2. Sem WebSocket, o benefício não foi entregue.

#### Stack tecnológica

| Código | Exigência | Situação | Observação |
| --- | --- | --- | --- |
| T11 | Frontend livre, recomendando React com Vite e TypeScript | Atendido | Recomendação seguida |
| T12 | Backend livre, recomendando Node.js com TypeScript | Atendido | Recomendação seguida |
| T13 | Conexão blockchain por WebSockets via provedores RPC, usando viem ou ethers | Parcial | Biblioteca atendida, transporte WebSocket ausente |
| T14 | Entrega ao painel via SSE | Não atendido | REST com polling no cliente |

Nota de leitura contratual. O TAP usa a expressão "livre, recomenda-se" para frontend e backend, onde há liberdade de escolha. Para conexão blockchain e entrega ao painel não existe essa ressalva: WebSockets e SSE são especificados diretamente. Os dois primeiros são recomendações, os dois últimos são requisitos.

#### Resultados esperados

| Código | Cláusula | Situação | Observação |
| --- | --- | --- | --- |
| T15 | Conversão instantânea das taxas de gás para dólar | Não atendido | Nenhuma fonte de preço no backend |
| T16 | Acompanhamento da volatilidade da mempool | Parcial | Volatilidade sim, mempool não |
| T17 | Painel interativo minimalista | Atendido | Gráfico com interação, tooltip e seletor de período |
| T18 | Visualizar e monitorar em tempo real os custos de execução | Parcial | Monitoramento presente, tempo real limitado pelo polling |

#### Restrições, o que o projeto não deveria contemplar

Aqui o cumprimento é positivo. Todas as exclusões foram respeitadas.

| Código | Restrição | Situação |
| --- | --- | --- |
| T19 | Execução, assinatura ou automação de transações | Corretamente ausente. Nenhuma chave privada, nenhum método de escrita |
| T20 | Deploy de contratos em Mainnet | Corretamente ausente. Nenhum contrato no repositório |
| T21 | Auditorias formais de segurança e testes de estresse | Corretamente ausente |
| T22 | Integração direta em produção da Alphractal | Corretamente ausente. Deploy isolado |

#### Cronograma

| Código | Marco | Situação |
| --- | --- | --- |
| T23 | Semana 1, kick off em 18/08/2026 | Fora do escopo desta análise |
| T24 | Semana 1, análise de mercado | Atendido por este documento |
| T25 | Semana 1, protótipo de alta fidelidade | Parcial. Não há artefato de design no repositório, embora a interface implementada cumpra a função |
| T26 | Semana 2, configuração de backend e frontend | Atendido |
| T27 | Semana 2, conexão com RPC via WebSockets e cálculo médio das taxas | Parcial. Cálculo atendido, WebSockets ausente |
| T28 | Semana 3, conexão entre frontend e backend | Atendido e verificado |
| T29 | Semana 3, resolução de bugs e polimento | Atendido. Lint limpo e 11 testes passando |
| T30 | Semana 4, demonstração final em 03/09/2026 | Pendente, data futura |

#### Propriedade intelectual

| Código | Cláusula | Situação |
| --- | --- | --- |
| T31 | Repositório público sob licença MIT | Atendido |
| T32 | Autorização de uso de marca do parceiro | Sem pendência. Nenhum logotipo do parceiro no repositório |
| T33 | Inteli Blockchain não oferece manutenção após o encerramento | Cláusula contratual, registrada como risco na seção 13 |

#### Placar consolidado

| Situação | Quantidade | Cláusulas |
| --- | --- | --- |
| Atendido | 13 | T03, T07, T08, T09, T11, T12, T17, T24, T26, T28, T29, T31, T32 |
| Parcial | 9 | T01, T04, T05, T06, T13, T16, T18, T25, T27 |
| Não atendido | 4 | T02, T10, T14, T15 |
| Corretamente fora de escopo | 4 | T19, T20, T21, T22 |
| Não avaliadas nesta análise | 3 | T23, T30, T33 |

Total de 33 cláusulas mapeadas. Considerando as 26 exigíveis, que restam após excluir as 4 restrições e as 3 não avaliadas: 13 plenamente atendidas, ou 50 por cento, 9 parciais, ou 35 por cento, e 4 ausentes, ou 15 por cento.

#### As quatro lacunas se reduzem a duas decisões

**Lacuna A, arquitetura de streaming, referente a T02, T10 e T14.** O TAP especifica WebSocket na ingestão e SSE na entrega. O projeto usa HTTP sob demanda e polling no cliente. Três cláusulas distintas dependem dessa única decisão, incluindo um dos três benefícios prometidos ao parceiro.

Consequências além do contrato: latência de até 12 segundos onde o TAP pede captura instantânea, consumo de RPC proporcional ao tempo em vez de a eventos, e impossibilidade de alimentar alertas.

**Lacuna B, conversão para dólar, referente a T15 e parte de T05.** O TAP define a conversão para dólar como resultado esperado, e o painel entrega apenas ETH. O gestor faz conversão mental em toda consulta. A expressão "estimativas financeiras reais" fica pela metade: real para quem raciocina em ETH, incompleto para quem opera em dólar.

#### Recomendação para a reunião de encerramento

Recomenda-se apresentar esta matriz na íntegra e sem suavização, por três razões.

Primeira: o TAP define o projeto como acadêmico e experimental. Reportar com precisão o que foi e o que não foi entregue é o comportamento esperado, e é o que dá credibilidade ao que efetivamente foi entregue.

Segunda: as lacunas são específicas, nomeadas e têm caminho de solução conhecido e estimado. Isso é substancialmente mais útil ao parceiro do que uma entrega apresentada como completa.

Terceira: a qualidade do que foi construído é real e sustenta a conversa. O MVP funciona contra a Mainnet e foi verificado. O que falta é escopo, não qualidade de execução.

---

## 11. KPIs e métricas de sucesso

### Métrica norteadora

> Decisões de execução informadas por semana: número de sessões em que o usuário consulta a aba Fees e, em seguida, executa ou adia deliberadamente uma operação.

Escolhida porque captura o objetivo declarado no TAP, a transição de dados informativos para indicadores operacionais acionáveis. Uma métrica de tráfego mediria atenção, esta mede ação.

Limitação declarada: o TAP exclui a execução de transações do escopo, portanto o sistema não observa o passo final. Aproximações mensuráveis dentro do escopo são sessões com interação no bloco de estimativas, sessões com troca de período no gráfico, que indicam investigação em vez de olhada casual, e tempo entre abrir a aba e a última interação.

### Framework HEART

| Dimensão | Meta | Métrica | Alvo |
| --- | --- | --- | --- |
| Satisfação | O usuário confia no número | Satisfação declarada na aba Fees | 4,0 de 5 ou mais |
| Satisfação | Confiança estabelecida | Cliques no link de validação cruzada | Decrescente ao longo do tempo |
| Engajamento | A aba entra na rotina | Sessões por usuário por semana | 3 ou mais |
| Engajamento | Uso investigativo | Duração mediana da sessão | entre 30 e 90 segundos |
| Adoção | Usuários passam a usar a aba | Percentual da base institucional que abre a aba em 30 dias | 40 por cento ou mais |
| Retenção | Continuam usando | Percentual que retorna na semana seguinte | 50 por cento ou mais |
| Sucesso da tarefa | Conseguem decidir | Tempo até a primeira interação significativa | abaixo de 15 segundos |
| Sucesso da tarefa | Confiabilidade | Sessões com erro visível | abaixo de 2 por cento |

**Nota sobre a métrica de validação cruzada.** O clique no link do Etherscan é um indicador invertido: alto no início, porque o usuário está conferindo se pode confiar, e decrescente conforme a confiança se estabelece. Se permanecer alto após 60 dias, é sinal de que a credibilidade do número não foi conquistada. É a métrica mais barata de instrumentar e uma das mais reveladoras, já que o link existe na tela.

### KPIs técnicos

| Indicador | Alvo | Situação medida em 01/09/2026 |
| --- | --- | --- |
| Latência do dado após novo bloco | abaixo de 2 segundos | Não atendido, até 12 segundos |
| Tempo de resposta com cache quente | abaixo de 100 ms | Atendido |
| Tempo de resposta com cache frio | abaixo de 3 segundos | Atendido, entre 500 e 800 ms |
| Disponibilidade mensal | 99 por cento ou mais | Não medido, sem monitoramento |
| Taxa de respostas com dado obsoleto | abaixo de 1 por cento | Não medido |
| Divergência da taxa em relação ao Etherscan | abaixo de 5 por cento | Consistente na ordem de grandeza em verificação pontual |
| Testes automatizados passando | 100 por cento | Atendido, 11 de 11 |

**Lacuna de observabilidade.** Nenhuma métrica de disponibilidade é coletada hoje, porque não há registro estruturado nem monitoramento. Para um módulo que se propõe operacional, essa é uma lacuna relevante, ainda que aceitável em um MVP acadêmico. O endpoint de verificação de saúde existe e é o ponto de partida natural.

### KPIs de negócio, após a integração

| Indicador | Alvo estimado | Racional |
| --- | --- | --- |
| Uso da aba Fees em relação à linha de base anterior | mais 50 por cento em 90 dias | A aba deixou de ser estática |
| Retenção do segmento institucional | mais 2 pontos percentuais | Menos motivo para sair da plataforma |
| Citação da feature em conversas de venda | Qualitativo | Sinal de diferenciação |
| Redução de suporte sobre variação de taxa | menos 20 por cento | O painel responde sozinho |

A linha de base desses indicadores já existe na Alphractal e é o insumo mais valioso que o parceiro pode fornecer na retomada.

---

## 12. Viabilidade financeira

### Consumo de RPC

Este é o principal condutor de custo do sistema. A análise vem da leitura direta do código.

| Endpoint | Chamadas por consulta ao provider | Composição | Validade do cache |
| --- | --- | --- | --- |
| Listagem de blocos, com limite 40 | 42 | 1 número do bloco mais 1 histórico de taxas mais 40 blocos individuais | 12 segundos |
| Bloco específico | 2 | 1 bloco mais 1 histórico de taxas | 60 segundos |
| Taxa atual | 2 | 1 bloco mais 1 histórico de taxas | 10 segundos |
| Histórico de taxas | 2 | 1 bloco mais 1 histórico de taxas | 10 segundos |

**Achado.** O endpoint de blocos custa 21 vezes mais que os demais, porque busca 40 blocos individualmente. Como a validade do cache é de 12 segundos e um bloco leva aproximadamente 12 segundos, na prática o cache expira a cada novo bloco e os 40 blocos são rebuscados, dos quais 39 não mudaram.

Uma janela deslizante, buscando apenas o bloco novo e descartando o mais antigo do cache, reduziria de 42 para 3 chamadas por atualização, o que representa 93 por cento de redução no endpoint mais caro do sistema. Isso não exige WebSocket, apenas uma mudança na estratégia de cache.

### Projeção mensal

Premissa: demanda contínua suficiente para expirar todos os caches. Esse é o pior caso realista, atingido com dezenas de usuários simultâneos. Graças à deduplicação, o consumo não cresce além desse ponto com o aumento da base.

| Cenário | Chamadas por minuto | Chamadas por mês |
| --- | --- | --- |
| Arquitetura atual | 234 | 10,1 milhões |
| Com janela deslizante nos blocos | cerca de 50 | cerca de 2,2 milhões |
| Com WebSocket e janela deslizante | cerca de 15 | cerca de 0,65 milhão |

O cenário com WebSocket parte de 216.000 blocos por mês, resultado de 30 dias divididos por 12 segundos por bloco, com aproximadamente 3 chamadas por bloco.

**A redução é de aproximadamente 94 por cento ao adotar a arquitetura que o TAP já exigia.** Este é o argumento econômico para as cláusulas T02 e T10: o WebSocket não é apenas conformidade contratual, é a diferença entre um sistema que cabe em um nível gratuito e um que não cabe.

### Implicação sobre o provider

O PublicNode é gratuito e sem SLA. Um volume de 10 milhões de chamadas por mês contra um endpoint público gratuito é operacionalmente frágil, porque limites de requisição ou bloqueio podem ocorrer sem aviso e não há contrato para recorrer.

Como referência de ordem de grandeza, a própria Alphractal descreve seu plano institucional como oferecendo até 10 milhões de chamadas por mês, com custo de 10 créditos por requisição. Isso situa o consumo estimado do módulo, sozinho, no mesmo patamar de um plano institucional inteiro de uma plataforma comercial madura. É um forte indício de que a arquitetura de polling não é sustentável em produção.

A conclusão prática: a arquitetura de polling torna o provider caro, e a arquitetura de WebSocket o mantém gratuito. As duas lacunas, conformidade com o TAP e sustentabilidade de custo, têm a mesma solução.

### Custo atual

| Item | Fornecedor | Custo mensal |
| --- | --- | --- |
| Hospedagem de web e API | Render, plano gratuito | zero |
| Provedor RPC | PublicNode | zero |
| Domínio | Subdomínio do provedor de hospedagem | zero |
| Monitoramento | Ausente | zero |
| **Total** | | **zero** |

Limitação do plano gratuito de hospedagem: o serviço hiberna após período sem acessos, e a primeira requisição seguinte é lenta. Para um protótipo de demonstração isso é aceitável. Para uso operacional não é, já que um gestor não espera dezenas de segundos por uma taxa que muda a cada 12.

### Custo projetado em produção

Faixas indicativas. Os valores exatos devem ser confirmados nas páginas de preço vigentes antes de qualquer decisão orçamentária.

| Item | Cenário mínimo | Cenário robusto | Observação |
| --- | --- | --- | --- |
| Hospedagem sem hibernação | 7 dólares | 25 dólares | Plano pago básico |
| Provedor RPC | zero | 200 dólares | Gratuito se o WebSocket reduzir o consumo, pago se mantido o polling |
| Fonte de preço em dólar | zero | 50 dólares | Possivelmente zero, já que a plataforma já possui cotação própria |
| Monitoramento e registros | zero | 20 dólares | Níveis gratuitos atendem este volume |
| Acesso a mempool | não aplicável | mais de 100 dólares | Necessário apenas para fechar o requisito de mempool |
| **Total mensal** | **7 dólares** | **395 dólares** | |

A diferença entre os dois cenários é, em boa parte, consequência direta das decisões arquiteturais pendentes.

### Custo de desenvolvimento

O projeto é acadêmico, executado pelo Inteli Blockchain sem custo direto ao parceiro. O TAP estabelece participação do parceiro em apenas dois encontros obrigatórios, mais suporte assíncrono com prazo sugerido de 48 horas úteis.

O custo de aquisição desta feature para a Alphractal é, portanto, essencialmente o tempo de duas reuniões. Isso torna o retorno favorável mesmo com as lacunas de escopo, desde que o código seja aproveitável. E é: a arquitetura em camadas, os testes e a portabilidade de provider foram construídos justamente para isso.

### Retorno para o parceiro

**Cenário conservador.** Premissas: mil usuários institucionais ativos na aba, cem operações discricionárias por usuário por mês, economia média de 5 dólares por operação deslocada, valor bem abaixo dos 22,41 dólares do cenário de dia agitado para refletir o regime de taxa baixo, e apenas 10 por cento dos usuários efetivamente mudando de comportamento.

Isso resulta em cem usuários realizando cem operações com economia de 5 dólares cada, ou 50 mil dólares por mês de economia agregada para a base, contra um custo de operação do módulo entre 7 e 395 dólares por mês.

**Ressalva metodológica necessária.** Essa economia é capturada pelos usuários, não pela Alphractal. O retorno para a plataforma é indireto, via retenção, diferenciação e argumento de venda. Apresentar essa cifra como receita do parceiro seria incorreto, e recomenda-se explicitar essa distinção na apresentação de encerramento.

**Ponto de equilíbrio.** Com custo operacional de até 395 dólares por mês, o módulo se paga retendo um número muito pequeno de assinantes institucionais por ano. O número exato depende do ticket médio da Alphractal, que não é público. A pergunta a fazer ao parceiro é qual o ticket médio e o churn atual do segmento institucional. Com esses dois números, o ponto de equilíbrio deixa de ser estimativa e passa a ser cálculo fechado.

### Veredito de viabilidade

| Dimensão | Avaliação | Justificativa |
| --- | --- | --- |
| Técnica | Comprovada | MVP funcional verificado contra a Mainnet |
| Econômica | Favorável | Custo de duas ordens de grandeza abaixo do valor gerado, mesmo no cenário conservador |
| Operacional | Condicionada | Exige que a Alphractal assuma a manutenção, já que o TAP encerra o suporte do Inteli |
| Contratual | Parcial | Quatro cláusulas do TAP não atendidas |
| Estratégica | Favorável | Alinhada ao roadmap multi-rede declarado pelo parceiro no próprio TAP |

---

## 13. Riscos

Escala de probabilidade e impacto de 1, muito baixo, a 5, muito alto. Severidade é o produto dos dois.

### Riscos de escopo e contrato

| Código | Risco | Prob. | Impacto | Sev. | Resposta |
| --- | --- | --- | --- | --- | --- |
| R01 | Parceiro considera o escopo não cumprido pela ausência de WebSocket, SSE e dólar | 4 | 5 | 20 | Mitigar. Apresentar a matriz de rastreabilidade com transparência total e plano de fechamento datado |
| R02 | Benefício de validação de arquitetura não comprovado ao parceiro | 5 | 4 | 20 | Mitigar. Implementar ao menos um protótipo funcional de WebSocket como prova arquitetural |
| R03 | Painel não integrado ao design system gera retrabalho de adoção | 3 | 3 | 9 | Aceitar. O TAP exclui integração em produção. Documentar os pontos de acoplamento |
| R04 | Protótipo de alta fidelidade da Semana 1 sem artefato registrado | 3 | 2 | 6 | Aceitar. A interface implementada cumpre a função |

### Riscos técnicos

| Código | Risco | Prob. | Impacto | Sev. | Resposta |
| --- | --- | --- | --- | --- | --- |
| R05 | Dependências fixadas em `"latest"`, com build quebrando sem alteração de código | 4 | 4 | 16 | Mitigar. Fixar versões exatas. Custo de minutos |
| R06 | Provider gratuito aplica limite de requisições ou fica indisponível sem aviso | 4 | 3 | 12 | Mitigar. Degradação graciosa já implementada. Documentar a troca de provider |
| R07 | Volume de mais de 10 milhões de chamadas por mês excede cotas gratuitas | 3 | 4 | 12 | Mitigar. Janela deslizante e WebSocket reduzem em cerca de 94 por cento |
| R08 | Hibernação da hospedagem gratuita torna a primeira consulta lenta demais | 4 | 3 | 12 | Transferir. Plano pago em produção, decisão do parceiro |
| R09 | API pública sem limitação de taxa fica exposta a abuso | 3 | 3 | 9 | Mitigar. Adicionar limitação antes de qualquer exposição pública |
| R10 | Contrato de API incompatível com o padrão da plataforma gera custo de integração | 3 | 3 | 9 | Mitigar. Documentar o mapeamento e oferecer uma camada de adaptação |
| R11 | Cache em memória perde o histórico a cada reinício | 3 | 2 | 6 | Aceitar no MVP. Persistência é decisão de fase posterior |
| R12 | Mensagem de erro expõe a versão de uma dependência ao cliente | 2 | 2 | 4 | Mitigar. Sanitizar o erro, preservando o detalhe apenas no registro do servidor |
| R13 | Marcações de tempo do histórico são aproximadas, com 12 segundos por bloco | 3 | 2 | 6 | Aceitar. Precisão suficiente para a leitura do gráfico. Documentar a aproximação |

### Riscos de negócio e mercado

| Código | Risco | Prob. | Impacto | Sev. | Resposta |
| --- | --- | --- | --- | --- | --- |
| R14 | Sem manutenção após o projeto, conforme cláusula do TAP, o módulo se degrada | 5 | 4 | 20 | Transferir. Handover documentado. A Alphractal decide se assume |
| R15 | Regime de taxa baixo esvazia a proposta de valor de economia | 4 | 4 | 16 | Mitigar. Reposicionar como seguro contra volatilidade e detecção de anomalia |
| R16 | Substitutos embutidos tornam o painel dispensável | 3 | 4 | 12 | Mitigar. Diferenciar por interpretação e integração, não por número bruto |
| R17 | Baixa adoção da aba pelos usuários | 3 | 4 | 12 | Mitigar. Instrumentar desde o primeiro dia. A linha de base já existe na plataforma |
| R18 | Migração para redes L2 reduz a relevância da camada 1 isolada | 3 | 3 | 9 | Explorar. O TAP já prevê a expansão multi-rede |

### Riscos prioritários

| Sev. | Código | Risco | Ação imediata |
| --- | --- | --- | --- |
| 20 | R01 | Escopo percebido como não cumprido | Transparência total na matriz mais plano datado |
| 20 | R02 | Benefício arquitetural não comprovado | Protótipo de WebSocket, ainda que parcial |
| 20 | R14 | Sem manutenção após o projeto | Handover documentado |
| 16 | R05 | Dependências em `"latest"` | Fixar versões, custo de minutos |
| 16 | R15 | Regime de taxa baixo | Reposicionar a narrativa de valor |

R05 tem severidade 16 e custo de correção de minutos. É o item de melhor relação entre custo e benefício de toda a matriz, e deveria ser resolvido antes da entrega.

---

## 14. Stakeholders

### Matriz de poder e interesse

```
  ALTO  |                                  |
  P     |  Manter satisfeito               |  Gerenciar de perto
  O     |                                  |
  D     |  . Nortech Labs                  |  . Alphractal, produto
  E     |    (controladora)                |  . Alphractal, engenharia
  R     |                                  |  . Orientação acadêmica Inteli
        |                                  |
        +----------------------------------+---------------------------
        |                                  |
        |  Monitorar                       |  Manter informado
        |                                  |
        |  . Provedores RPC                |  . Equipe Cagimadu
        |  . Hospedagem                    |  . Usuários institucionais
  BAIXO |  . Concorrentes                  |  . Diretoria Inteli Blockchain
        +----------------------------------+---------------------------
           BAIXO           INTERESSE            ALTO
```

### Registro de stakeholders

| Stakeholder | Papel | Interesse principal | Estratégia |
| --- | --- | --- | --- |
| Alphractal, produto | Cliente e patrocinador | Aba Fees acionável e diferenciada | Gerenciar de perto |
| Alphractal, engenharia | Avaliador da adoção | Arquitetura limpa e sem dívida técnica | Gerenciar de perto |
| Nortech Labs | Controladora | Retorno estratégico do portfólio | Manter satisfeito |
| Usuários institucionais | Beneficiários finais | Previsibilidade de custo | Manter informado |
| Equipe Cagimadu | Executor | Entrega e portfólio | Manter informado |
| Inteli Blockchain | Patrocinador acadêmico | Reputação e canal com o mercado | Manter informado |
| Provedor RPC | Fornecedor crítico | Uso dentro dos limites | Monitorar |

### Matriz RACI

R indica responsável pela execução, A indica aprovador, C indica consultado e I indica informado.

| Atividade | Equipe Cagimadu | Alphractal produto | Alphractal engenharia | Inteli Blockchain |
| --- | --- | --- | --- | --- |
| Análise de negócios e mercado | R e A | C | I | I |
| Definição de requisitos | R | A | C | I |
| Arquitetura e desenvolvimento | R e A | I | C | I |
| Validação técnica | R e A | I | C | I |
| Aceite do MVP | R | A | C | I |
| Decisão de adoção em produção | I | A | R | I |
| Manutenção após o projeto | não aplicável | A | R | I, excluído por cláusula |

**Ponto de atenção.** A linha de manutenção não tem responsável do lado do Inteli, o que é a cláusula do TAP tornada explícita. Se a Alphractal não designar um responsável, o risco R14 se materializa por omissão, não por decisão.

---

## 15. Próximos passos

Esta seção lista o que precisa ser feito para fechar o escopo contratado. Diferente da seção 16, que trata de oportunidades opcionais, tudo aqui corresponde a compromisso assumido no TAP ou a pré-condição de handover.


| Ordem | Ação | Esforço | Motivo |
| --- | --- | --- | --- |
| 1 | Fixar as versões exatas de todas as dependências, hoje em `"latest"` | cerca de 30 minutos | Risco R05, severidade 16. Sem isso, o build quebra sem alteração de código e o handover é frágil |
| 2 | Expor a base fee projetada do próximo bloco | cerca de 1 hora | O dado já chega do RPC e é descartado. Sem custo adicional de chamadas. Maior razão entre valor e esforço do backlog |
| 3 | Sanitizar a mensagem de erro do provider | cerca de 30 minutos | Risco R12. Evita expor a versão de dependências ao cliente |
| 4 | Preparar a apresentação com a matriz de rastreabilidade completa | cerca de 2 horas | Riscos R01 e R02. Transparência sobre as quatro lacunas, com plano de fechamento datado |

Os três primeiros somam cerca de duas horas de trabalho e alteram materialmente a qualidade percebida da entrega.

### Fechamento do escopo contratado, de uma a duas semanas

| Ordem | Ação | Cláusula do TAP | Esforço | Nota técnica |
| --- | --- | --- | --- | --- |
| 5 | Conversão para dólar | T15 e parte de T05 | cerca de 4 horas | Adotar a convenção de sufixos `Ntv` e `USD` já usada pela Alphractal. Precisa degradar sem quebrar se a fonte de preço falhar |
| 6 | SSE no endpoint de taxas | T14 | cerca de 1 dia | Novo endpoint de stream publicando o modelo de taxa atual. Substituir os intervalos do frontend por conexão de eventos com reconexão automática |
| 7 | WebSocket na ingestão | T02 e T10 | cerca de 2 dias | Trocar o transporte HTTP por WebSocket na criação do cliente e assinar o evento de novos blocos, alimentando o cache de forma reativa. Fecha o benefício arquitetural prometido e reduz o consumo de RPC em cerca de 94 por cento |
| 8 | Janela deslizante no endpoint de blocos | RNF05 | cerca de 4 horas | Reduz de 42 para 3 chamadas por atualização |

**Sobre a ordem entre 6 e 7.** O SSE pode ser implementado sobre a ingestão HTTP atual e já entrega valor observável ao usuário. O WebSocket é o que fecha o requisito arquitetural e o custo de RPC. Fazer o SSE primeiro entrega resultado visível mais cedo, sem bloquear o outro.

### Perguntas a fazer ao parceiro

Estas perguntas destravam decisões que hoje dependem de estimativa e que poderiam depender de dado real.

| Pergunta | O que ela destrava |
| --- | --- |
| Quantos usuários únicos por semana abrem a aba Fees hoje? | Substitui todo o dimensionamento estimado da seção 4 por número real |
| Qual o ticket médio e o churn do segmento institucional? | Transforma o ponto de equilíbrio da seção 12 em cálculo fechado |
| O gestor decide em Gwei ou em dólar? | Confirma ou rebaixa a prioridade da conversão para dólar |
| Quais métricas de taxa alimentam hoje a aba Fees? | Define o que o módulo deve substituir e o que deve complementar |
| O módulo deve emitir métricas para o motor de alertas existente? | Define o formato de saída e pode dispensar desenvolvimento de notificação própria |
| Qual o padrão de contrato de API para módulos internos? | Define se o envelope atual permanece ou se é preciso uma camada de adaptação |

### Handover

O TAP encerra o suporte do Inteli Blockchain ao fim do projeto, o que corresponde ao risco R14, de severidade 20. Situação dos entregáveis de transferência:

| Entregável | Situação |
| --- | --- |
| README com instalação, variáveis de ambiente e deploy | Pronto |
| Documentação de negócio | Pronto, este documento |
| Relatório de validação técnica | Pronto |
| Matriz de rastreabilidade do TAP com lacunas nomeadas | Pronto, seção 10 |
| Roadmap priorizado com esforço estimado | Pronto, seções 15 e 16 |
| Versões de dependências fixadas | Pendente, item 1 |
| Sessão de transferência com a engenharia da Alphractal | A agendar |

Os cinco primeiros itens estão prontos. O sexto custa minutos. O sétimo depende do parceiro e é o único que a equipe não controla, razão pela qual se recomenda propô-lo na reunião de 03/09/2026.

---

## 16. Oportunidades pós-projeto

Esta seção reúne o que não é exigido pelo TAP, mas que agregaria valor real. São propostas para a Alphractal avaliar caso decida evoluir o módulo. Estão ordenadas por relação entre valor e esforço, e não constituem compromisso da equipe.

### Alto valor e baixo esforço

**Emitir as métricas do módulo para o motor de alertas existente.** A Alphractal já opera alertas multicondicionais com entrega por e-mail, Telegram e in-app. Expor `networkPressure` e `recommendedFeeGwei` no formato de métrica da plataforma permitiria ao usuário criar regras como "avise-me quando a pressão da rede na Ethereum cair para Baixa". Isso resolve o atrito da espera cega, que é o ponto mais caro da jornada, reaproveitando infraestrutura existente em vez de construir notificação própria.

**Adotar a convenção de nomenclatura da plataforma.** A API da Alphractal usa sufixos `Ntv` para moeda nativa e `USD` para dólar. Alinhar os nomes dos campos do módulo a essa convenção reduz o atrito de integração e faz as novas métricas parecerem nativas da plataforma em vez de importadas.

**Tornar as métricas de taxa consultáveis em linguagem natural.** A plataforma possui um assistente que responde perguntas sobre as métricas disponíveis. Se a taxa recomendada e a pressão da rede forem expostas como métricas, perguntas como "qual a pressão da rede Ethereum agora" passam a ser respondíveis sem que o usuário abra a aba.

**Comparar a taxa atual com a distribuição histórica.** Em vez de mostrar apenas mínima, média e máxima do período selecionado, indicar em que percentil a taxa atual se encontra em relação aos últimos 30 dias. Isso responde diretamente à pergunta "isso está caro?", que é o que o gestor realmente quer saber, e usa dado que o sistema já coleta.

### Alto valor e esforço médio

**Estimativa de tempo de confirmação por faixa de taxa.** Informar quanto tempo uma transação provavelmente levará para diferentes níveis de taxa. É o padrão do mercado em gas trackers e complementa a estimativa de custo com a dimensão de tempo, que hoje está ausente.

**Cruzamento da taxa com as demais métricas da plataforma.** Correlacionar picos de taxa com liquidações, fluxos de exchange e movimentos de grandes detentores. Este é o diferencial que nenhum concorrente externo consegue replicar, porque depende de um conjunto de métricas proprietário. É provavelmente a oportunidade de maior valor estratégico da lista.

**Persistência do histórico.** Hoje o cache é em memória e o histórico se perde no reinício, com teto de aproximadamente 3,4 horas imposto pelo protocolo. Persistir a série permitiria janelas de dias ou semanas e viabilizaria a comparação percentílica descrita acima.

**Custo estimado por protocolo específico.** Em vez de três categorias genéricas, estimar o custo para operações em protocolos concretos, com base no consumo de gas típico de cada contrato. Aproxima o painel da análise formal de custo de transação praticada em mercados tradicionais.

**Observabilidade.** Registro estruturado, monitoramento de disponibilidade e alerta de degradação do provider. Sem isso, nenhum dos indicadores técnicos da seção 11 é mensurável, e a operação depende de o usuário reclamar para que se descubra um problema.

### Valor estratégico e esforço alto

**Leitura da mempool.** Único item que exige provider pago. Transformaria o sistema de reativo em preditivo e fecharia a última lacuna do TAP relacionada a mempool.

**Expansão para redes L2.** Concretiza o benefício declarado no TAP de escalar o monitoramento a outras redes. A viabilidade a baixo custo decorre de uma decisão já tomada na arquitetura: os controladores dependem de uma interface de serviço, não de uma implementação concreta. Adicionar uma rede significa adicionar uma implementação, não reescrever a aplicação.

**Comparação de custo entre redes e recomendação de rota.** Com múltiplas redes monitoradas, responder qual rede oferece o menor custo para a mesma operação naquele momento. É a evolução natural da expansão multi-rede e transforma o módulo de informativo em prescritivo.

**Blob gas da EIP-4844.** Monitorar o mercado de taxa de dados de rollup, que possui dinâmica própria e é pouco explorado pelos concorrentes. Relevante à medida que a atividade migra para redes L2.

### Ideias de menor prioridade, registradas para não se perderem

**Exportação de série em CSV.** Atende à persona analista, que hoje precisa consumir a API diretamente.

**Modo de comparação entre períodos.** Sobrepor a curva de hoje com a de ontem ou da semana passada, para leitura rápida de anomalia.

**Registro de decisões.** Permitir que o usuário anote que adiou uma operação e receba, depois, a informação de quanto economizou. Fecharia o ciclo de medição da métrica norteadora da seção 11, que hoje não é diretamente observável porque o TAP exclui a execução do escopo.

---

## 17. Validação das afirmações deste documento

Esta seção existe para que qualquer leitor possa verificar a base de cada afirmação relevante. Toda afirmação foi classificada em uma de três categorias.

**Fato verificado por execução.** Obtido rodando código ou consultando a rede, com registro no relatório de validação técnica.
**Fato de fonte pública.** Obtido de site oficial, documentação pública ou artigo citado.
**Estimativa.** Cálculo derivado de premissas declaradas, sempre com a fórmula visível para recálculo.

### Afirmações verificadas por execução

| Afirmação | Como foi verificada |
| --- | --- |
| Lint sem apontamentos, 11 de 11 testes passando, build de produção funcional | Execução das três tarefas de validação |
| A API responde com dados reais da Ethereum Mainnet | Consulta aos quatro endpoints, com retorno do bloco 25.884.72x |
| Taxa recomendada igual à soma de base fee e prioridade | Conferência aritmética independente, 0,0992 mais 0,1048 igual a 0,2040 |
| Custo de transferência de 0,00000428 ETH | Conferência independente, 0,204 vezes 21.000 vezes 1e-9 |
| Variação de 76,32 por cento em relação ao bloco anterior | Conferência independente sobre os valores retornados |
| Ocupação de aproximadamente 31,8 por cento | Conferência de 19,06 dividido por 60 |
| Validação de entrada retorna 400 estruturado para parâmetro fora do limite | Requisição com 9999 blocos |
| Rota inexistente retorna 404 estruturado | Requisição a rota inválida |
| Bloco inexistente retorna 502 e a mensagem inclui a versão de uma dependência | Requisição a número de bloco inválido |
| O histórico de taxas retorna uma entrada a mais que o número de blocos pedidos, sendo a última a projeção do próximo bloco | Script executado contra a Mainnet, com `blockCount` igual a 2 retornando 3 entradas |
| O código descarta essa projeção | Leitura do método de taxa atual, que consome os índices 0 e 1 |
| Não existe WebSocket, SSE ou conversão para dólar no repositório | Busca por termos relacionados em todo o código-fonte, sem ocorrências |
| O campo de valor em dólar existe apenas no tipo do frontend e nunca é preenchido | Busca no código |
| O frontend atualiza por intervalos de 12 e 30 segundos | Leitura das telas de blocos e de taxas |
| A listagem de blocos consome 42 chamadas RPC por atualização | Contagem direta no método de listagem |

### Afirmações de fonte pública

| Afirmação | Fonte |
| --- | --- |
| Mais de 1.500 métricas, com distribuição por família | Site da Alphractal |
| Cobertura de mais de 1.000 ativos digitais | Site da Alphractal |
| Recursos Alpha AI, Custom Dashboards, Smart Alerts, Screeners, Research Reports e API | Site da Alphractal e página institucional |
| API com mais de 1.000 endpoints e até 10 milhões de chamadas por mês no plano institucional | Página institucional |
| Frequência de atualização de 1 a 5 minutos na oferta institucional | Página institucional |
| Estrutura da API com rotas por ativo, recorte por datas e respostas sem envelope | Documentação pública da API |
| Existência das métricas de taxa e de gas, incluindo variantes em dólar | Índice de documentação pública da API |
| Custo de 10 créditos por requisição e limites por plano | Documentação pública da API |
| Nortech Labs como controladora, sediada em Brisbane | Perfil público da empresa |
| Gas cobrado mesmo em transação que falha | Central de informações do Etherscan |
| 658.362 transações privadas com falha em Ethereum sob Proof of Stake, correspondentes a 2,20 por cento | Artigo acadêmico citado na seção 3 |
| Mecânica da EIP-1559, com ajuste de até 12,5 por cento por bloco | Documentação técnica da Ethereum |
| Blocknative com previsão por modelos preditivos e cobertura de mais de 40 redes | Site e documentação da Blocknative |
| Etherscan reportando taxas na mesma ordem de grandeza no período | Página do Etherscan Gas Tracker |

### Estimativas, com premissas declaradas

| Estimativa | Premissas | Fórmula |
| --- | --- | --- |
| Custo por operação nos cinco cenários de taxa | 150.000 unidades de gas por swap, ETH a 4.268 dólares | fee vezes gas vezes 1e-9, convertido a dólar |
| Economia de 2.241 dólares por mês por fundo | 100 swaps deslocados de 40 para 5 Gwei | diferença de custo unitário vezes quantidade |
| Consumo de 10,1 milhões de chamadas RPC por mês | Demanda contínua expirando todos os caches, com um período de gráfico ativo | 234 chamadas por minuto vezes minutos do mês |
| Consumo de 0,65 milhão de chamadas com WebSocket | 216.000 blocos por mês, cerca de 3 chamadas por bloco | blocos vezes chamadas por bloco |
| Redução de cerca de 94 por cento no consumo | Comparação entre os dois cenários acima | um menos a razão entre eles |
| Custo em produção entre 7 e 395 dólares por mês | Faixas indicativas de planos de hospedagem, RPC, cotação e monitoramento | soma dos itens |
| Economia agregada de 50 mil dólares por mês para a base | Mil usuários, 10 por cento mudando de comportamento, 100 operações, 5 dólares de economia | produto dos quatro fatores |
| Esforços em horas e dias no roadmap | Julgamento técnico sobre a base de código existente | não aplicável |

### Correções feitas em relação à versão anterior deste documento

O rigor exigido implica registrar o que mudou e por quê.

| Item | Versão anterior | Versão atual | Motivo |
| --- | --- | --- | --- |
| Dimensionamento do SOM | Estimava entre 2.850 e 4.750 usuários aplicando percentuais sobre a base | Removido | A premissa de engajamento não tinha base empírica, e multiplicá-la por uma base já incerta produzia falsa precisão |
| Base de usuários da Alphractal | Afirmava 19.000 usuários em 40 mercados como dado verificado | Tratado como não confirmado | O número não foi localizado no site na pesquisa direta, que descreve a base como "milhares de analistas" |
| Gravidade da latência de 12 segundos | Classificada como média | Rebaixada para baixa no contexto | A plataforma que hospedará o módulo atualiza a cada 1 a 5 minutos, portanto o módulo já é mais rápido que a linha de base |
| Esforço para implementar alertas | Estimado em 4 unidades, tratado como desenvolvimento novo | Reduzido a 2 unidades | A plataforma já possui motor de alertas multicondicionais, e o trabalho passa a ser expor métricas |
| Esforço para conversão em dólar | Tratado como integração com fonte externa | Mantido em 4 horas, com nota | A plataforma já possui cotação e convenção de nomes, o que reduz o risco de implementação |
| Custo de fonte de preço em dólar | Estimado entre zero e 50 dólares por mês | Mantido, com ressalva | Possivelmente zero, dado que a plataforma já possui cotação própria |
| Contagem de cláusulas parciais | Indicava 8 | Corrigida para 9 | Erro aritmético, a lista continha 9 itens |
| Cobertura do TAP | Indicava 13 de 18, ou 72 por cento | Corrigida para 13 de 26, ou 50 por cento, com 85 por cento incluindo parciais | O denominador anterior estava incorreto |
| Custo mensal no cenário de dia calmo | Indicava 1.537 dólares | Corrigido para 1.536 dólares | Arredondamento |

## Fontes

**Sobre o parceiro**

* [Alphractal, página principal](https://alphractal.com/)
* [Alphractal Institucional](https://www.alphractal.com/institucional)
* [Documentação pública da API da Alphractal](https://docs.alphractal.com/)
* [Alphractal no Crunchbase](https://www.crunchbase.com/organization/alphractal)

**Sobre o domínio técnico**

* [Ethereum.org, gas e taxas](https://ethereum.org/developers/docs/gas/)
* [Etherscan, motivos de falha em transações](https://info.etherscan.com/reason-for-failed-transaction/)
* [Demystifying Private Transactions and Their Impact in PoW and PoS Ethereum](https://arxiv.org/pdf/2503.23510)

**Sobre concorrentes**

* [Blocknative Gas Platform](https://www.blocknative.com/gas-platform)
* [Documentação da API de gas da Blocknative](https://docs.blocknative.com/gas-prediction/gas-platform)
* [Etherscan Gas Tracker](https://etherscan.io/gastracker)
* [CryptoVantage, melhores rastreadores de gas em 2026](https://www.cryptovantage.com/guides/what-are-the-best-eth-gas-trackers/)

**Documentos internos do projeto**

* [Relatório de validação técnica](validacao/relatorio-de-validacao-tecnica.md)
* [README do projeto](../README.md)
