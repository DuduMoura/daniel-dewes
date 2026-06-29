# 🎤 Roteiro de Fala — Apresentação Sistema WMS

> Roteiro slide a slide, em linguagem falada. Cada bloco indica **quem fala**.
> Tempo total estimado: **12–15 minutos** (≈ 3 a 4 min por integrante).
> Dica: não leia palavra por palavra — use como guia. As frases em _itálico_ são passagens de bastão entre os integrantes.

---

## 🟠 BLOCO 01 — Samuel Maciel (Problema & Contexto)

### Slide 1 — Capa
> Boa tarde a todos. Nós somos o grupo responsável pelo Sistema de Gestão de Armazém, o **WMS**, desenvolvido como trabalho final da disciplina. Eu sou o Samuel, e comigo estão o Daniel, o Cesário e o Yuri. Cada um de nós vai conduzir uma parte da apresentação. Vamos começar.

### Slide 2 — Roteiro da Apresentação
> Antes de entrar no sistema em si, deixa eu mostrar como dividimos a conversa de hoje. São quatro blocos: eu começo apresentando **o problema e o contexto** — por que esse sistema precisa existir. Em seguida o Daniel mostra **o que o sistema faz e os fluxos de operação**. O Cesário entra na parte de **arquitetura e tecnologia**, e o Yuri fecha com **banco de dados, API e o nosso processo de desenvolvimento**.

### Slide 3 — O Problema
> Então, qual é a dor que a gente resolve? Muitos armazéns e depósitos ainda controlam estoque no papel ou na memória. Isso gera quatro problemas que se conectam: primeiro, **erros de contagem**, que levam a perda de mercadoria e saldo que nunca bate. Segundo, **tempo perdido** — o operador fica andando pelo armazém procurando produto, porque não tem nenhum guia de onde cada coisa está. Terceiro, **reposição errada**: compra-se demais e sobra estoque parado, ou compra-se de menos e falta item essencial. E o resultado de tudo isso é o quarto ponto: **prejuízo direto** — atraso nas entregas, dinheiro parado e uma equipe desgastada. Em resumo: sem informação confiável e em tempo real, a gestão do armazém vira um ponto crítico de ineficiência.

### Slide 4 — Para quem é o sistema
> E para quem a gente construiu isso? São três perfis bem claros. O **Gestor de Armazém**, que precisa enxergar o estoque a qualquer momento, receber alertas e decidir com base em dados. O **Operador de Estoque**, que é quem coloca a mão na massa — recebe, guarda, separa e conta produto — e precisa de orientação clara de onde guardar e onde buscar cada item. E o responsável por **Compras e Suprimentos**, que decide quando e quanto comprar, e por isso precisa de histórico de consumo e de alertas automáticos quando o estoque chega no mínimo.

### Slide 5 — A solução em uma frase
> Resumindo tudo numa frase: o nosso sistema é uma aplicação web que controla **entrada, saída, localização e saldo** dos produtos do armazém, em **tempo real** e com **auditoria completa**. Na prática, isso se traduz em quatro grandes capacidades: cadastro e organização, movimentação de estoque, localização e busca, e controle com alertas. E é exatamente sobre essas capacidades que o Daniel vai falar agora.
>
> _Daniel, pode seguir._

---

## 🟢 BLOCO 02 — Daniel Dewes (Funcionalidades & Fluxos)

### Slide 6 — O que o sistema faz
> Obrigado, Samuel. Então, pegando esses quatro grandes grupos, deixa eu detalhar o que cada um entrega. Em **cadastro e organização**, a gente cadastra produtos com categoria e estoque mínimo, cadastra fornecedores, e organiza o armazém numa hierarquia de áreas, corredores e posições. Em **movimentação**, registramos entrada ao receber mercadoria, saída na expedição, além de devoluções e transferências entre posições. Em **localização e busca**, o sistema sabe a posição exata de cada produto e permite buscar por nome ou categoria. E em **controle e acompanhamento**, temos o saldo em tempo real, o alerta de estoque abaixo do mínimo e o inventário com conferência física.

### Slide 7 — Fluxos principais
> Agora, como isso funciona no dia a dia? Vou mostrar os dois fluxos mais importantes. No **Recebimento**, o operador informa o fornecedor e os itens que chegaram; o sistema confirma a entrada e já atualiza o saldo; em seguida indica em qual posição guardar cada item; o operador aloca e confirma; e o estoque fica atualizado com posição e quantidade. Já na **Expedição** é o caminho inverso: o operador informa os itens do pedido, o sistema mostra **onde** cada um está, o operador coleta e confirma item por item, confirma a expedição no final, e o sistema registra a saída atualizando o saldo. Repare que em todos os passos o operador é **guiado** — ele não depende mais da memória.

### Slide 8 — Mais três fluxos de apoio
> Além desses dois, temos mais três fluxos de apoio. O **Alerta de Reposição**: o sistema monitora o saldo continuamente e, quando um produto cai abaixo do mínimo, gera automaticamente um alerta para o time de Compras, já com o produto, a quantidade atual e a mínima. O **Inventário**: o gestor inicia uma contagem, o operador informa o que encontrou fisicamente, o sistema compara com o que está registrado e **destaca as divergências** para ajuste. E a **Consulta de Estoque**: qualquer usuário busca um produto e vê o saldo, a posição, o mínimo e o histórico recente, para decidir se repõe, transfere ou só registra. Esses são os cinco fluxos que cobrem a operação completa.
>
> _Com a parte de uso coberta, passo para o Cesário falar de como isso foi construído por dentro._

---

## 🔵 BLOCO 03 — Cesario Junior (Arquitetura & Stack)

### Slide 9 — Stack Tecnológica
> Valeu, Daniel. Então vamos abrir o capô. A base de tudo é o **Next.js 15** com **TypeScript**, que nos dá o front-end e o back-end no mesmo projeto. Os dados ficam num **PostgreSQL**, e a gente conversa com ele através do **Prisma**, que é o nosso ORM — ele cuida das consultas e das migrações do banco. A autenticação é feita com **NextAuth**, usando token JWT. Para garantir que os dados estão corretos, usamos o **Zod** para validação. Nos formulários usamos **React Hook Form**, para o estado das requisições usamos o **TanStack Query**, que cuida de cache, e o visual é feito com **Tailwind CSS**. É uma stack moderna e bem integrada, toda em TypeScript de ponta a ponta.

### Slide 10 — Arquitetura em camadas
> Essas tecnologias se organizam em camadas, seguindo um padrão **MVC adaptado** ao Next.js. No topo está a **View**, que são as páginas em React — é o que o usuário vê e onde acontece a validação no cliente. Abaixo está o **Controller**, que são as API Routes: é aqui que verificamos a sessão, a permissão do usuário, validamos os dados e geramos os logs. Em seguida vem a camada de **Serviço**, que isola o acesso ao Prisma e a parte de auditoria. E na base está o **Model**, que é o Prisma com o PostgreSQL, responsável pelas transações atômicas e pelas migrações. Cada camada tem uma responsabilidade clara, o que deixa o sistema mais fácil de manter.

### Slide 11 — Ciclo de uma requisição & Segurança
> Para amarrar isso, deixa eu mostrar o caminho de uma operação real: uma baixa de estoque. Primeiro, a interface valida os dados com Zod ainda no navegador. O TanStack Query envia a requisição para a API. A API então verifica a sessão — se não houver, retorna 401. Depois verifica o **papel** do usuário; se ele não tiver permissão, retorna 403. Valida o conteúdo de novo no servidor com Zod. E aí entra o ponto mais importante: tudo roda dentro de uma **transação Prisma** — atualizar o saldo, registrar a movimentação e gravar o log acontecem juntos, ou nada acontece. No final retorna 200 e a tela se atualiza sozinha. Do lado da **segurança**, as senhas são guardadas só como hash, a autorização é sempre verificada no servidor, toda entrada passa por validação, a sessão é um token assinado, o Prisma protege contra SQL Injection, e cada ação relevante gera um registro de auditoria.
>
> _Falando em registro e dados, passo a palavra pro Yuri, que vai detalhar o banco._

---

## 🟣 BLOCO 04 — Yuri Carvalho (Dados, API & Processo)

### Slide 12 — Modelagem do Banco
> Obrigado, Cesário. Então, o coração do sistema é o modelo de dados. Temos quatro entidades principais. O **Usuario**, que é quem opera o sistema, cada um com seu papel de acesso. O **Produto**, que é o item de estoque — e aqui um detalhe importante: a quantidade do produto é a nossa **fonte de verdade** do saldo atual. A **MovimentacaoEstoque**, que funciona como um livro-razão imutável: cada entrada, saída ou ajuste vira um registro que nunca é apagado. E o **Log**, que guarda a auditoria de todas as ações. Tudo isso é apoiado por dois enums: o **UsuarioRole**, com os perfis Admin, Gerente, Operador e Usuário; e o **TipoMovimento**, que classifica cada movimentação — estoque inicial, compra, venda, ajuste ou perda.

### Slide 13 — Regras de negócio no banco
> Em cima desse modelo, a gente garante cinco regras de negócio no próprio banco. A mais importante é a **atomicidade**: produto, movimentação e log são sempre gravados juntos, numa única transação — assim o saldo nunca "racha". A segunda é que o **saldo é a fonte de verdade**, e as movimentações são o histórico auditável por trás dele. Terceira, **integridade referencial**: se um produto é excluído, suas movimentações vão junto. Quarta, **rastreabilidade**: toda movimentação registra obrigatoriamente quem foi o responsável. E quinta, a **senha sempre protegida**, guardada apenas como hash, nunca em texto puro.

### Slide 14 — API REST & Permissões
> Essas regras são expostas através de uma **API REST**, construída com as API Routes do Next.js e protegida por autenticação. Temos endpoints para listar, criar, consultar, editar e excluir produtos, e o endpoint específico para dar baixa no estoque. E o ponto-chave aqui é a **matriz de permissões**: nem todo mundo pode fazer tudo. Consultar produtos, qualquer perfil pode. Dar baixa no estoque, o Operador para cima. Criar e editar produto exige Gerente ou Admin. E excluir produto é exclusivo do Admin. Ou seja, o controle de acesso é granular e verificado a cada chamada.

### Slide 15 — Como construímos
> E por fim, queria mostrar **como** a gente chegou nesse resultado, porque o processo foi tão importante quanto o código. Seguimos cinco etapas: começamos pelo **PRD**, definindo o problema, o público e os fluxos. Depois a **Spec**, detalhando os requisitos. Em seguida o **Plano** técnico, registrando as decisões de stack e arquitetura. Então a **Implementação**, organizada em módulos por funcionalidade. E por último a **Validação** da qualidade. Cada funcionalidade nasceu de uma proposta de mudança versionada, e o Zod foi a nossa fonte única de verdade — o mesmo esquema de validação roda no formulário e no servidor, sem duplicação.

### Slide 16 — Encerramento
> E é isso! Construímos um sistema que tira o armazém do controle manual e dá visão de estoque em tempo real, com segurança e auditoria do início ao fim. Agradecemos a atenção de todos — eu, o Samuel, o Daniel e o Cesário ficamos à disposição para as perguntas. Obrigado!

---

## ⏱️ Resumo de tempos sugeridos

| Integrante | Slides | Tempo |
|---|---|---|
| Samuel Maciel | 1–5 | ~3 min |
| Daniel Dewes | 6–8 | ~3 min |
| Cesario Junior | 9–11 | ~3,5 min |
| Yuri Carvalho | 12–16 | ~4 min |

**Dicas gerais de apresentação**
- Faça contato visual; o roteiro é guia, não leitura.
- Nas passagens de bastão, diga o nome do próximo colega (já marcado em _itálico_).
- Se o tempo apertar, os slides 8 e 14 podem ser resumidos.
- Tenha o sistema aberto numa aba: se sobrar tempo, uma demonstração rápida vale mais que mil slides.
