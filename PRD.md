# PRD — Sistema de Gestão de Armazém (WMS)

---

## 1. Problema

Empresas que operam armazéns, depósitos e centros de distribuição ainda dependem de processos manuais para controlar a entrada, saída e localização de produtos. Isso provoca erros frequentes de contagem, perda de mercadorias, atrasos na separação de pedidos e impossibilidade de saber, em tempo real, o que existe em estoque e onde cada item está guardado.

Gestores não conseguem visualizar o estoque sem realizar contagens físicas, o que demanda tempo, interrompe a operação e ainda assim resulta em informações desatualizadas. Operadores perdem horas procurando produtos dentro do armazém sem nenhum guia de localização. Reposições são feitas tarde demais ou em excesso, gerando acúmulo de itens desnecessários ou falta de produtos essenciais.

O impacto direto dessa desorganização é a perda de dinheiro, atrasos nas entregas para clientes e desgaste da equipe operacional — tornando a gestão do armazém um ponto crítico de ineficiência para o negócio.

---

## 2. Público-Alvo

O sistema é destinado a três perfis de pessoas que trabalham diretamente com a operação do armazém:

**Gestor de Armazém**
Profissional responsável por supervisionar toda a operação. Precisa ter visão geral do estoque a qualquer momento, acompanhar o desempenho da equipe, receber alertas quando produtos estão acabando e tomar decisões de reposição com base em informações confiáveis.

**Operador de Estoque**
Profissional que executa as atividades do dia a dia: receber mercadorias, organizar produtos nas posições do armazém, separar itens para expedição e realizar contagens. Precisa de orientação clara sobre onde guardar e onde buscar cada produto, sem depender de memória ou anotações em papel.

**Responsável por Compras e Suprimentos**
Profissional que decide quando e quanto comprar. Precisa de relatórios de consumo, histórico de movimentações e alertas automáticos quando o estoque de um produto atinge o nível mínimo definido.

---

## 3. Funcionalidades

O sistema deve oferecer as seguintes capacidades:

**Cadastro e organização**
- Cadastrar produtos com nome, descrição, categoria e quantidade mínima em estoque
- Cadastrar fornecedores com informações de contato e produtos fornecidos
- Organizar o armazém em áreas, corredores e posições para facilitar a localização

**Movimentação de estoque**
- Registrar a entrada de mercadorias quando um pedido de compra chega ao armazém
- Registrar a saída de produtos quando um pedido é expedido ou consumido internamente
- Registrar devoluções de mercadorias, tanto de clientes quanto para fornecedores
- Transferir produtos de uma posição para outra dentro do armazém

**Localização e busca**
- Indicar em qual posição do armazém cada produto está guardado
- Permitir a busca de um produto pelo nome ou categoria para localização rápida

**Controle e acompanhamento**
- Exibir o saldo atual de cada produto em tempo real
- Alertar o responsável por compras quando o estoque de um item cair abaixo do mínimo definido
- Realizar inventário com conferência entre o que o sistema registra e o que o operador conta fisicamente

---

## 4. Fluxos

### Fluxo 1 — Recebimento de Mercadoria

> O operador recebe fisicamente os produtos de um fornecedor e registra a entrada no sistema.

1. O operador acessa a área de entrada de mercadorias
2. Informa o fornecedor e os produtos recebidos com as respectivas quantidades
3. O sistema confirma o registro da entrada e atualiza o saldo de cada produto
4. O operador recebe a indicação de qual posição do armazém deve guardar cada item
5. O operador leva os produtos até as posições indicadas e confirma a alocação
6. O estoque é atualizado com as novas posições e quantidades

---

### Fluxo 2 — Expedição de Pedido

> Um pedido precisa ser separado e enviado. O operador localiza os produtos e registra a saída.

1. O operador acessa a área de saída de mercadorias e informa os itens do pedido
2. O sistema indica onde cada produto está localizado no armazém
3. O operador percorre o armazém, coleta os itens nas posições indicadas e confirma cada coleta
4. Após reunir todos os itens, o operador confirma a expedição
5. O sistema registra a saída e atualiza o saldo de cada produto

---

### Fluxo 3 — Alerta de Reposição

> O sistema identifica que um produto está abaixo do nível mínimo e notifica o responsável.

1. O sistema verifica continuamente o saldo de cada produto cadastrado
2. Ao identificar que o saldo de um produto ficou abaixo do mínimo definido, o sistema gera um alerta
3. O responsável por compras recebe a notificação com o produto, a quantidade atual e a quantidade mínima
4. O responsável decide iniciar um novo pedido de compra com o fornecedor correspondente

---

### Fluxo 4 — Inventário

> O gestor solicita uma contagem física para conferir se o que está no sistema corresponde à realidade.

1. O gestor inicia um inventário e seleciona os produtos ou áreas a serem conferidos
2. O sistema lista os produtos com o saldo registrado atualmente
3. O operador percorre o armazém e informa a quantidade que encontrou fisicamente de cada item
4. O sistema compara o saldo registrado com o valor informado pelo operador
5. Os produtos com diferença são destacados para revisão
6. O gestor analisa as divergências, realiza os ajustes necessários e encerra o inventário

---

### Fluxo 5 — Consulta de Estoque

> O gestor ou operador precisa saber a situação atual de um produto específico.

1. O usuário acessa a área de consulta e busca o produto pelo nome ou categoria
2. O sistema exibe o saldo atual, a posição onde está guardado, o nível mínimo definido e o histórico recente de movimentações
3. O usuário visualiza as informações e decide a próxima ação (repor, transferir ou apenas registrar)
