Descrição Geral
Plataforma web para comunidade Habbo, focada em eventos, doações e apoio a polícias virtuais.
O objetivo é criar um sistema de níveis, tarefas diárias e pontos que incentivem a participação dos jogadores.

✅ Funcionalidades Principais
1. Sistema de Registo e Login
Registro com nick Habbo (sem e-mail).

Geração automática de código único no registro.

Usuário deve colar esse código na Missão do Habbo.

Integração com API pública do Habbo para validar a missão.

Apenas após validação, o registro é concluído.

Login apenas com nickname.

2. Sistema de Níveis (Leveling)
Níveis vão de 1 a 100.

Cada nível exige pontos para ser atingido.

Pontos ganhos através de tarefas diárias e atividades.

Nível do Jogador	Multiplicador de Pontos
1 a 19	1x (5 pontos por tarefa)
20 a 29	2x (10 pontos por tarefa)
30 a 39	3x (15 pontos por tarefa)
...	...
100	10x

3. Tarefas Diárias
5 perguntas sobre a Habbo Etiqueta por dia.

Cada tarefa vale pontos, seguindo o multiplicador de nível.

Limite de uma tentativa por dia.

Sistema de emblemas conforme conclusão de tarefas:

10 tarefas concluídas → Emblema.

20, 30, 40, 50 tarefas → Emblemas progressivos.

4. Sistema de Doações e Câmbios (Moeda Virtual)
Cada 10 pontos = 1C (câmbio virtual).

Opção "Resgatar" no painel do usuário para trocar pontos por câmbios.

Histórico completo de pontos recebidos:

Tarefas.

Eventos.

Doações.

Outros.

Emblemas Especiais:
Registro → Emblema automático.

Participação em Doações:

1 doação → Emblema.

5, 10, 20, 40, 50 doações → Emblemas progressivos.

5. Painel de Usuário (Ao Estar Logado)
Nível atual e barra de progresso.

Seus emblemas conquistados.

Pontuação atual e botão de resgate de pontos.

Histórico de pontos.

Data da próxima tarefa disponível.

Área para envio de sugestões e pedidos de ajuda.

Área que informa quando começa a próxima doação/evento.

6. Página Inicial (Não Logado)
Banner chamativo explicando vantagens da plataforma:

Ganhar prêmios.

Participar de eventos.

Subir de nível.

Trocar pontos por câmbios.

Destaque para:

Últimos eventos.

Últimos vencedores.

Últimas notícias.

7. Sistema de Papeis (Roles)
User — Padrão.

Ajudante — Moderação básica.

Moderador — Moderação completa.

Admin — Controle total.

Cada role terá acesso apenas às funções permitidas:

Admins podem editar conteúdos, gerenciar eventos e atribuir pontos manualmente.

8. Design e Interface
Inspirado nos fã-sites do Habbo:

Cores vibrantes.

Elementos pixelados e retro.

Layout moderno e responsivo (compatível com desktop e mobile).

Destaque para o visual de comunidade:

Avatares Habbo.

Quadros de conquistas (emblemas).

9. Outras Funcionalidades
Sistema de notificações para eventos e tarefas diárias.

Área de notícias com suporte a imagens e links.

Ranking de jogadores por nível e pontos.

Sistema seguro de autenticação (captcha no registro, bloqueio de múltiplas tentativas de login).

✅ Tecnologias Recomendadas
Frontend: React / Next.js + Tailwind CSS (para visual moderno).

Backend: Node.js / Express.

Banco de Dados: PostgreSQL ou MongoDB.

API Habbo: Integração via requests HTTP.

Segurança: JWT para login, senhas criptografadas.

✅ Observação Final
Esse sistema deve ser:

Fácil de usar.

Leve, rápido e seguro.

Totalmente personalizável no futuro (para adicionar mais níveis, emblemas e eventos).

