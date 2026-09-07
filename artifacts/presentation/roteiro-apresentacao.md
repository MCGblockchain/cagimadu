# Roteiro de apresentação e guia de defesa — Cagimadu

Este roteiro foi pensado para uma apresentação de **18 a 22 minutos**, mais demonstração e perguntas. Não precisa ser decorado: use a “fala sugerida” para conduzir e consulte “se perguntarem” para aprofundar.

## Mensagem central para memorizar

> O Cagimadu transforma dados públicos e brutos da Ethereum em uma leitura operacional de custo, pressão e momento de execução. O MVP funciona de ponta a ponta e foi validado com dados reais; para produção, ainda precisamos fechar streaming, conversão para dólar e requisitos operacionais.

## Vocabulário essencial

- **Gas:** unidade que mede o trabalho computacional de uma operação na Ethereum.
- **Gwei:** unidade usada para o preço de cada unidade de gas. `1 Gwei = 10⁻⁹ ETH`.
- **Base fee:** parcela mínima definida pelo protocolo e queimada pela rede.
- **Priority fee:** gorjeta ao validador. O projeto usa a mediana, percentil 50, das recompensas recentes.
- **Fee recomendada:** no MVP, `base fee + priority fee mediana`.
- **Pressão:** classificação própria que combina ocupação do bloco e nível da fee.
- **JSON-RPC:** protocolo usado pelo backend para consultar um nó Ethereum.
- **Polling:** consultas periódicas. É o modelo atual.
- **WebSocket:** conexão persistente proposta para receber novos blocos do provider.
- **SSE:** canal unidirecional proposto para o backend publicar atualizações no navegador.
- **Stale:** último dado válido reaproveitado após falha do provider, sempre sinalizado.

---

## Slide 1 — Do dado on-chain à decisão operacional

### Fala sugerida

“A Ethereum disponibiliza muitos dados, mas dados brutos não respondem sozinhos se este é um bom momento para executar uma operação. O Cagimadu cria uma camada de tradução entre o estado da rede e a decisão humana.

O MVP acompanha blocos e fees da Ethereum Mainnet, calcula custos por tipo de operação e comunica a pressão da rede visualmente. Ele foi desenvolvido pela equipe Cagimadu no Inteli Blockchain, em parceria com a Alphractal.”

### Se perguntarem

**O sistema executa transações?** Não. Ele não recebe chave privada, não assina e não transmite transações. É uma ferramenta informativa, conforme o escopo do TAP.

**Por que Ethereum?** Era a rede do escopo e possui um mercado de taxas dinâmico, dados públicos e providers maduros. A arquitetura pode evoluir para outras L1 e L2, mas ainda não está parametrizada por rede.

### Transição

“Antes de mostrar telas ou código, vou resumir a transformação que o produto propõe.”

---

## Slide 2 — A tese: observar, traduzir e decidir

### Fala sugerida

“Organizamos o valor em três passos. Observar: coletamos blocos, base fee, priority fee e ocupação. Traduzir: normalizamos unidades, calculamos fee recomendada, custos e pressão. Decidir: apresentamos tudo de modo que o usuário possa executar, esperar ou continuar monitorando.

A métrica ideal não é quantidade de acessos, mas decisões de execução informadas por semana. O objetivo não é aumentar tempo de tela; é reduzir incerteza operacional.”

### Se perguntarem

**Como medir uma decisão se o sistema não executa?** Por aproximações: interação com o simulador, troca de período e tempo até a última interação. Numa integração, o produto pode registrar a intenção de executar ou adiar sem custodiar ativos.

**O indicador recomenda comprar ou vender?** Não. Ele descreve custo e pressão da infraestrutura Ethereum, não direção de mercado.

### Transição

“Essa tese existe porque o formato anterior respondia bem ao passado, mas não ao próximo bloco.”

---

## Slide 3 — O problema das médias históricas

### Fala sugerida

“Uma média de 24 horas responde quanto custou operar. Um gestor prestes a enviar uma transação precisa saber quanto custa agora e se a rede está mudando.

Desde a EIP-1559, a base fee se ajusta a cada bloco conforme a ocupação anterior. Um bloco leva aproximadamente 12 segundos e o ajuste pode chegar a 12,5% por bloco. Após seis ajustes máximos consecutivos, a base fee pode aproximadamente dobrar. Uma média longa suaviza justamente o sinal de curto prazo.

O erro é assimétrico: superestimar significa pagar mais; subestimar pode atrasar ou comprometer a operação. Mesmo uma transação revertida consome gas.”

### Se perguntarem

**A taxa sempre muda 12,5%?** Não. Esse é o limite. A variação efetiva depende da ocupação do bloco em relação ao alvo do protocolo.

**Por que “aproximadamente 12 segundos”?** Esse é o tempo de slot pós-Merge, mas nem todo slot precisa produzir um bloco.

**O projeto lê a mempool?** Não. Ele lê blocos confirmados e `eth_feeHistory`; portanto, é reativo, não uma previsão de transações pendentes.

### Transição

“O projeto complementa uma plataforma de dados que já é madura.”

---

## Slide 4 — Encaixe estratégico com a Alphractal

### Fala sugerida

“Segundo a documentação pública analisada, a Alphractal já reúne mais de 1.500 métricas, mais de mil endpoints, métricas históricas de taxa, cotação em dólar, dashboards e alertas.

Por isso, não precisamos duplicar `FeeMean`, `FeeMed` ou `FeeTot`. O espaço do Cagimadu é adicionar taxa recomendada agora, pressão e custo por operação. Em vez de competir como gas tracker isolado, o módulo pode virar uma camada operacional dentro da inteligência de mercado da Alphractal.

A plataforma comunica atualização institucional de 1 a 5 minutos; o MVP consulta fee e blocos a cada 12 segundos. A frequência já é superior, embora o streaming do TAP ainda não esteja implementado.”

### Se perguntarem

**De onde vêm 1.500 métricas e mil endpoints?** Da pesquisa registrada na análise de negócios, baseada em documentação pública da empresa. São números declarados, não auditoria independente.

**Qual a vantagem sobre Etherscan ou Blocknative?** Não é apenas mostrar Gwei. É cruzar custo com métricas proprietárias da Alphractal e usar seu motor de alertas.

**Por que WebSocket se 12 segundos já é rápido?** Por conformidade, eficiência de RPC e arquitetura orientada a eventos; não apenas velocidade percebida.

### Transição

“Com esse posicionamento, o produto se resume a quatro capacidades.”

---

## Slide 5 — As quatro capacidades

### Fala sugerida

“O explorador mostra fee, ocupação, transações, validador e pressão por bloco. O monitor destaca custo atual e histórico. O simulador converte Gwei e gas em custo de transferência, swap ou mint. A camada de contexto traduz esses números em uma leitura simples da rede.

As telas compartilham a API do backend. O simulador é calculado localmente com os dados recebidos, então não cria chamadas extras.”

### Se perguntarem

**Os valores de gas são exatos?** Não. São presets: 21 mil para transferência, 150 mil para swap, 100 mil para mint, 260 mil para contrato e opção customizada. Contratos reais variam.

**O que é “boa janela”?** Fee atual até 12% acima da mínima recente. Até 8% acima da média é “aceitável”; até 28% é “melhor esperar”; acima disso, “rede cara”. É uma heurística, não recomendação financeira.

### Transição

“Agora podemos abrir a caixa-preta e acompanhar o dado pelo sistema.”

---

## Slide 6 — Fluxo ponta a ponta

### Fala sugerida

“O fluxo começa na Mainnet. O backend consulta o provider via JSON-RPC usando Viem. O `EthereumService` converte respostas da blockchain em modelos do produto. O cache controla frequência, concorrência e degradação. Controllers validam parâmetros e formatam o HTTP. O React consome a API, e o D3 desenha a série.

A decisão principal foi impedir que regras de RPC vazassem para controllers ou interface. Assim, trocar provider ou mudar a ingestão para WebSocket fica concentrado no serviço.”

### Se perguntarem

**Isso é MVC?** Sim, com camada de serviço. Routes/controllers tratam HTTP; models definem contratos; views estão no frontend; services concentram Ethereum e regras associadas.

**Por que o frontend não consulta a blockchain?** Para não expor credenciais, centralizar cache, controlar erros e manter contrato estável.

**Como adicionar outra rede?** Parametrizar chain/RPC, incluir rede em rotas e cache, expor o identificador nos tipos e adicionar seletor no frontend. A separação ajuda, mas isso ainda não existe.

### Transição

“Essa arquitetura usa uma stack pequena e conhecida.”

---

## Slide 7 — Stack do MVP

### Fala sugerida

“No frontend usamos React, Vite, TypeScript e módulos específicos do D3. No backend, Node, Express, TypeScript e Viem. Zod valida entradas, Vitest executa os testes e Supertest verifica contratos HTTP. O deploy foi preparado para Render e o provider padrão é PublicNode.

TypeScript nas duas pontas reduz mudança de contexto. Viem trata tipos e unidades Ethereum. D3 aparece somente onde agrega: o gráfico.”

### Se perguntarem

**Por que Viem e não ethers?** Ambos atenderiam. Viem oferece boa tipagem e métodos diretos para `getBlock` e `getFeeHistory`. A escolha está isolada no serviço.

**Os tipos são compartilhados?** Não. Existem tipos equivalentes no frontend e backend. É simples para o MVP, mas exige alteração manual nos dois lados. Um pacote comum seria uma evolução.

**Qual o risco de usar `latest`?** Instalações futuras podem trazer versões incompatíveis. Fixar versões exatas é o primeiro item do roadmap.

### Transição

“A fronteira entre frontend e backend é uma API pequena e previsível.”

---

## Slide 8 — Contrato da API

### Fala sugerida

“Temos lista de blocos, bloco específico, fee atual e histórico, além do health check. As respostas de dados usam `{ data, meta }`. `meta` informa origem, cache, stale e atualização. Assim, a interface comunica qualidade e idade do dado.

Zod valida parâmetros. `limit` aceita de 1 a 40 e o histórico, de 2 a 1024 blocos. Validação retorna 400, rota inexistente 404 e falha do provider 502.”

### Se perguntarem

**Por que envelope se a Alphractal usa arrays simples?** Para o MVP autônomo, o envelope expõe contexto operacional. A integração exigirá adaptador ou alinhamento ao contrato interno.

**Há autenticação ou rate limit?** Não. Rate limit é obrigatório antes de exposição pública; autenticação depende da infraestrutura do parceiro.

**Existe OpenAPI?** Não. Os contratos estão no README e documentação técnica. OpenAPI seria uma melhoria de handover.

### Transição

“Dentro desse contrato, três regras transformam dado bruto em produto.”

---

## Slide 9 — Regras de negócio

### Fala sugerida

“Fee recomendada é base fee mais priority fee mediana do `eth_feeHistory`. A mediana resiste melhor a valores extremos.

O custo é `fee em Gwei × gas × 10⁻⁹`, em ETH. No exemplo validado, 0,204 Gwei por 150 mil gas resulta em 0,0000306 ETH para um swap.

A pressão usa `ocupação × 0,7 + fee limitada a 100 Gwei × 0,3`. Abaixo de 45 é baixa; a partir de 45, moderada; 66, alta; e 83, crítica. O teto evita que um pico extremo de fee esconda completamente a ocupação.”

### Se perguntarem

**Por que 70% e 30%?** É uma heurística de MVP, não padrão Ethereum. Prioriza saturação sem ignorar custo. Precisa ser calibrada com histórico e usuários.

**Por que mediana?** Poucas prioridades muito altas podem distorcer a média. O percentil 50 representa melhor uma recompensa típica.

**Por que não difficulty?** Após Proof of Stake, difficulty deixou de ser útil para este diagnóstico. Ocupação e fee são operacionais.

**Há projeção do próximo bloco?** O RPC já retorna uma base fee projetada extra, mas o código atual a descarta. Expor esse dado é um próximo passo de alto valor e baixo esforço.

### Transição

“Como dependemos de provider externo, a forma de falhar também faz parte do produto.”

---

## Slide 10 — Cache e resiliência

### Fala sugerida

“O cache possui TTL, deduplicação e stale. Fees ficam válidas por 10 segundos e blocos por 12. Requisições simultâneas para a mesma chave compartilham a mesma Promise. Se o provider falhar após um sucesso, devolvemos o último valor com `stale: true`.

Se a primeira carga falhar, o frontend apresenta dados demonstrativos identificados. A aplicação continua utilizável sem fingir que o dado é real.”

### Se perguntarem

**Stale com 200 não esconde erro?** Preserva disponibilidade, mas o cliente recebe `stale: true` e mostra aviso. Em produção, a taxa de stale deve ser monitorada.

**O cache é distribuído?** Não. É memória do processo; reinício perde estado e múltiplas instâncias não compartilham cache.

**Qual endpoint é mais caro?** A lista de 40 blocos usa 42 chamadas RPC. Os outros usam duas. Janela deslizante reduziria para cerca de três por atualização.

**Qual o consumo mensal?** Pior caso atual: 10,1 milhões de chamadas. Com janela deslizante: 2,2 milhões. Com WebSocket: 0,65 milhão, redução aproximada de 94%.

### Transição

“Essas decisões estão registradas para permitir continuidade do projeto.”

---

## Slide 11 — Documentação e rastreabilidade

### Fala sugerida

“A análise de negócios cobre mercado, personas, valor, riscos, KPIs e viabilidade. A documentação técnica explica camadas, contratos, cálculos, cache e extensões. O relatório de validação separa o que foi executado do que foi apenas inspecionado.

A rastreabilidade mapeia 33 cláusulas. Entre 26 exigíveis, 13 foram atendidas, nove parcialmente e quatro não atendidas. Há entrega total ou parcial em 22, mas não apresentamos o projeto como 100% concluído.”

### Se perguntarem

**Quais são as quatro ausentes?** T02, ingestão contínua; T10, validação da arquitetura WebSocket; T14, SSE; e T15, dólar.

**Por que revelar lacunas?** Para dar credibilidade ao que foi comprovado, evitar surpresa no aceite e oferecer plano de fechamento.

**O que ficou corretamente fora de escopo?** Execução/assinatura, contratos em Mainnet, auditoria formal e integração direta em produção.

### Transição

“Com rastreabilidade, conseguimos separar opinião de evidência.”

---

## Slide 12 — Evidências de validação

### Fala sugerida

“Executamos lint, testes e build. Foram 11 testes passando. Os quatro endpoints foram exercitados com dados reais. Os cálculos foram refeitos independentemente e conferiram. O bundle JavaScript ficou em cerca de 79 kB gzip.

Também validamos erros de entrada e rotas. O veredito é: funciona, calcula corretamente e degrada com transparência. Ainda não é produção por faltar versões fixas, rate limit, observabilidade, streaming e dólar.”

### Se perguntarem

**Por que não automatizar teste contra Mainnet?** RPC externo torna teste instável. A API é testada com serviço injetado; a integração real foi validada separadamente.

**Qual a latência?** Cache quente abaixo de 100 ms; cache frio medido entre 500 e 800 ms. O dado pode atrasar até 12 segundos pelo polling.

**Qual a cobertura percentual?** Não foi definida por linhas. Os testes priorizam cálculos e contratos críticos; não invente percentual.

**Infra realmente custa zero?** No MVP: Render gratuito, PublicNode e subdomínio do provedor. Há hibernação e nenhum SLA, então isso não representa produção.

### Transição

“Agora, as três experiências construídas.”

---

## Slide 13 — Explorador de blocos

### Fala sugerida

“Esta captura usa dados reais. Cada cartão compara blocos por fee, ocupação e pressão. O resumo mostra fee média dos 12 primeiros blocos, tempo esperado e pressão atual.

A lista de 40 blocos atualiza a cada 12 segundos. Há busca por número ou validador e um drawer com detalhes.”

### Se perguntarem

**Por que ocupação alta não significa sempre pressão crítica?** Porque a pressão combina ocupação e fee.

**Os endereços estão completos?** A API devolve o endereço; a interface apenas abrevia para leitura.

**A idade é exata?** Em blocos, deriva do timestamp. No histórico de fees, pontos anteriores são aproximados em intervalos de 12 segundos.

### Transição

“Blocos explica o que aconteceu; Fees concentra a decisão.”

---

## Slide 14 — Monitor de fees

### Fala sugerida

“Esta tela materializa a proposta de valor. No topo, fee recomendada e custo por operação. Abaixo, histórico com mínima, média, máxima e volatilidade.

Os períodos são 5 minutos, 20 minutos, uma hora e três horas, correspondendo a 25, 100, 300 e 900 blocos. A API aceita até 1024, mas reduz a série para cerca de 90 pontos antes de enviar ao gráfico.”

### Se perguntarem

**Por que a fee da captura está tão baixa?** É o estado real no momento. Em regime barato, o valor é confirmar a janela e detectar anomalias, não prometer grande economia.

**A volatilidade é da mempool?** Não. É o coeficiente de variação de blocos confirmados. Mempool não foi implementada.

**Por que não há dólar?** A fonte não foi conectada. A recomendação é reutilizar a cotação e convenção `Ntv`/`USD` da Alphractal.

### Transição

“A terceira tela mostra como a telemetria pode ganhar contexto editorial.”

---

## Slide 15 — Contexto de mercado

### Fala sugerida

“Esta é uma direção visual, não uma integração funcional. Os dados são estáticos e identificados como demonstrativos. A tela mostra como fee pulse, snapshot e leitura editorial poderiam formar uma experiência única.

No futuro, o diferencial seria cruzar picos de fee com liquidações, fluxos de exchange, grandes carteiras ou atividade de L2 — dados do universo analítico da Alphractal.”

### Se perguntarem

**A tela consome API?** Não. É estática e não conversa com o backend.

**Por que incluí-la?** Para demonstrar consistência visual e discutir integração futura sem confundir com escopo entregue.

**Há IA?** Não no MVP. O conteúdo editorial é demonstrativo.

### Transição

“Com o núcleo validado e as lacunas nomeadas, o próximo passo fica objetivo.”

---

## Slide 16 — Roadmap do MVP à integração

### Fala sugerida

“Priorizamos por valor, risco e esforço. Primeiro, fixar versões. Segundo, expor a base fee projetada que já chega do RPC. Terceiro, adicionar dólar seguindo a Alphractal.

Depois vêm SSE para publicar atualizações no navegador e WebSocket para receber novos blocos do provider. Em paralelo, janela deslizante evita buscar novamente 39 blocos que não mudaram.

Já provamos que o núcleo funciona. A próxima etapa é adaptar contratos, fechar streaming e preparar operação.”

### Se perguntarem

**Quanto tempo?** A documentação estima uma a duas semanas: quatro horas para USD, um dia para SSE, dois dias para WebSocket e quatro horas para janela deslizante, além de ajustes. São estimativas, não compromisso.

**SSE e WebSocket são iguais?** Não. Fluxo proposto: `Ethereum → WebSocket → backend/cache → SSE → frontend`.

**Por que SSE antes?** Entrega valor visível e pode operar temporariamente sobre ingestão HTTP. WebSocket fecha eficiência e prova arquitetural.

**O que depende do parceiro?** Fonte de USD, padrão de API, design system, dados de uso, manutenção e decisão de adoção.

### Fechamento sugerido

“O Cagimadu não tenta prever o mercado. Ele torna o custo da infraestrutura visível, comparável e acionável. O MVP comprova a experiência; agora temos clareza sobre como transformá-lo em módulo nativo da Alphractal.”

---

# Perguntas gerais

## Negócio

**Quem é a persona principal?** Gestor de fundo cripto ou operador institucional. Personas secundárias: analista on-chain e engenheiro da Alphractal que avalia integração e sustentabilidade.

**Qual é o ROI?** A análise simula 200 swaps mensais, 150 mil gas e ETH a US$ 4.268. Deslocar metade das operações discricionárias de 40 para 5 Gwei daria economia estimada de US$ 2.241/mês por fundo. Não é resultado observado: nem toda operação espera, o regime varia e a economia exige mudança de comportamento.

**Se o gas está barato, perde valor?** Perde economia absoluta, mas mantém confirmação de janela, detecção de anomalia e base multi-rede.

**Como validar adoção?** Metas propostas: três sessões por usuário/semana, 40% da base institucional em 30 dias, 50% de retorno semanal e primeira interação significativa em menos de 15 segundos. Ainda não foram medidas.

## Técnica

**Por que REST se o TAP pede tempo real?** REST validou histórico e contratos. No desenho final, REST continua para consultas; SSE assume atualizações ao navegador e WebSocket, ingestão.

**Quais proteções já existem?** CORS configurável, JSON limitado a 32 kB, remoção de `X-Powered-By`, headers básicos, validação e ausência de chaves privadas. Faltam rate limit, autenticação conforme o ambiente e sanitização completa de um erro do provider.

**PublicNode é suficiente?** Para demonstração. Não tem SLA. `ETH_RPC_URL` permite trocar por provider pago ou interno sem alterar frontend/controllers.

**Se o provider cair?** Último valor com `stale: true`; sem valor anterior, demo identificada. Produção precisa monitorar frequência e duração.

**Os timestamps são reais?** O último é real; anteriores no histórico são aproximados por 12 segundos. Precisão total exige consultas individuais ou persistência reativa.

**O que significa 79 kB?** Bundle JS do frontend comprimido no build. É indicador saudável, não métrica completa de performance.

## Escopo

**O TAP foi cumprido?** Parcialmente: 13 cláusulas exigíveis atendidas, nove parciais e quatro ausentes. Não diga 100%.

**Quais duas decisões fecham as quatro lacunas?** Streaming, cobrindo T02/T10/T14; e dólar, cobrindo T15 e completando T05.

**Está pronto para produção?** Não. É um MVP validado e base de integração. Produção exige versões fixas, rate limit, observabilidade, hosting sem hibernação, provider adequado, streaming, USD e dono de manutenção.

---

# Roteiro de demonstração

1. Em **Blocos**, mostre o selo ao vivo, a atualização e cartões com ocupações diferentes.
2. Abra um bloco e destaque base fee, prioridade, transações e validador.
3. Em **Fees**, explique o número principal antes do gráfico.
4. Troque o período e mostre mínima, média, máxima e volatilidade.
5. Compare transferência e swap: mesma fee, custos diferentes pelo gas.
6. Mostre **Mercado** como direção visual e declare que os dados são demonstrativos.

Se a API falhar, não esconda o banner. Use-o para explicar fallback, stale e transparência.

# Frases seguras para perguntas difíceis

- “Esse número é estimativa documentada; ainda não é métrica observada em produção.”
- “No MVP, adotamos essa heurística para tornar a regra explícita e testável; calibração com usuários é o próximo passo.”
- “Essa parte não foi implementada e está registrada na rastreabilidade.”
- “A arquitetura facilita essa evolução, mas ainda exige implementação e validação.”
- “Vou separar o que foi medido, o que foi verificado em código e o que é hipótese.”

# O que não afirmar

- Não diga que o sistema prevê mempool ou o próximo pico.
- Não diga que a fee garante inclusão ou tempo de confirmação.
- Não trate presets de gas como custos exatos.
- Não diga que os US$ 2.241 foram economizados; é cenário.
- Não diga que Mercado usa dados reais.
- Não diga que está pronto para produção ou cumpriu 100% do TAP.
- Não trate PublicNode como provider com SLA.
- Não confunda WebSocket de ingestão com SSE de entrega.

# Números para memorizar

| Número | Significado |
| --- | --- |
| ~12 s | tempo de bloco e polling de blocos/fee atual |
| 10 s / 12 s | TTL de fees / blocos |
| 4 | endpoints de dados |
| 11 de 11 | testes passando |
| 1 a 40 | limite da lista de blocos |
| 2 a 1024 | intervalo do histórico |
| ~90 | pontos enviados ao gráfico após amostragem |
| 42 chamadas | custo RPC da lista de 40 blocos |
| 10,1 milhões/mês | pior caso estimado atual |
| 0,65 milhão/mês | estimativa com WebSocket e janela deslizante |
| 94% | redução aproximada no cenário evoluído |
| 13 / 9 / 4 | atendidas / parciais / ausentes |
| 79 kB gzip | bundle JavaScript validado |
