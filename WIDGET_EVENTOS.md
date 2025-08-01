# 📅 Widget de Próximos Eventos

## Descrição
Widget exclusivo para usuários logados que mostra os próximos eventos programados na plataforma T513. O widget aparece logo após a seção de doações e permite aos usuários ficarem sempre informados sobre os eventos futuros.

## Funcionalidades

### ✨ Características Principais
- **Visível apenas para usuários logados** - Não aparece para visitantes
- **Design expansível** - Clique para expandir/recolher o conteúdo
- **Filtro automático** - Mostra apenas eventos com status "Em Breve", "Ativo" ou "Programado"
- **Limite de 5 eventos** - Exibe os 5 próximos eventos mais relevantes
- **Cálculo de tempo** - Mostra quando cada evento acontecerá (hoje, amanhã, em X dias)
- **Scroll automático** - Botão para ir direto à seção completa de eventos
- **Botão de criação** - Admins/moderadores podem criar eventos diretamente do widget
- **Design responsivo** - Funciona perfeitamente em desktop e mobile

### 🎨 Interface
- **Header compacto** com ícone de calendário e contador de eventos
- **Cards individuais** para cada evento com:
  - Emoji do evento
  - Título e descrição (truncada)
  - Status colorido (Em Breve = azul, Ativo = verde, Programado = roxo)
  - Tipo do evento
  - Tempo até o evento
- **Estados visuais**:
  - Loading skeleton durante carregamento
  - Mensagem quando não há eventos
  - Animações suaves de transição

### 🔧 Funcionalidades Técnicas
- **API otimizada** - Nova rota `/api/events?filter=upcoming&limit=5`
- **Cache inteligente** - Carrega apenas quando necessário
- **Performance** - Componente leve e otimizado
- **Acessibilidade** - Suporte a navegação por teclado

## Como Usar

### Para Usuários
1. **Faça login** na plataforma
2. **Visualize o widget** logo após a seção de doações
3. **Clique no header** para expandir/recolher
4. **Clique em "Ver todos os eventos"** para ir à seção completa

### Para Administradores
1. **Crie eventos** através do botão "➕ Adicionar" no widget "Próximos Eventos"
2. **Use os status corretos**:
   - `Em Breve` - Para eventos futuros não iniciados (aparecem no widget)
   - `Ativo` - Para eventos acontecendo agora (aparecem no widget)
   - `Programado` - Para eventos com data específica (aparecem no widget)
   - `Finalizado` ou `Encerrado` - Para eventos concluídos (aparecem na seção "Últimos Eventos")

## Scripts de Teste

### Criar Eventos de Exemplo
```bash
npm run seed-events
```

Este script cria 8 eventos de teste:
- 5 eventos futuros/ativos (aparecerão no widget "Próximos Eventos")
- 3 eventos finalizados (aparecerão na seção "Últimos Eventos")

## Estrutura de Arquivos

```
src/
├── components/
│   ├── UpcomingEventsWidget.tsx    # Componente principal do widget
│   └── LandingPage.tsx             # Integração do widget na página
├── app/
│   ├── api/events/route.ts         # API atualizada com filtros
│   └── globals.css                 # Estilos adicionais (line-clamp)
└── scripts/
    └── seed-test-events.js         # Script para criar eventos de teste
```

## Posicionamento na Página

O widget aparece em diferentes posições dependendo do role do usuário:

### 🔴 Admin
```
Header → Doações → Widget Eventos → Pedidos Resgate → Roleta → Lista Usuários → Sugestões → Eventos → Notícias → Footer
```

### 🟣 Moderador
```
Header → Doações → Widget Eventos → Progresso → Roleta → Lista Usuários → Sugestões → Eventos → Notícias → Footer
```

### 🟡 Helper
```
Header → Doações → Widget Eventos → Progresso → Roleta → Pedidos Ajuda → Sugestões → Eventos → Notícias → Footer
```

### 🔵 Usuário Padrão
```
Header → Doações → Widget Eventos → Progresso → Roleta → Eventos → Notícias → Footer
```

## Customização

### Alterar Limite de Eventos
No arquivo `UpcomingEventsWidget.tsx`, linha 33:
```typescript
const response = await fetch('/api/events?filter=upcoming&limit=5');
//                                                           ↑
//                                                    Altere aqui
```

### Adicionar Novos Status
No arquivo `src/app/api/events/route.ts`, linhas 17-21:
```typescript
whereClause = {
  OR: [
    { status: 'Em Breve' },
    { status: 'Ativo' },
    { status: 'Programado' },
    // { status: 'Novo Status' }  ← Adicione aqui
  ]
};
```

### Personalizar Cores dos Status
No arquivo `UpcomingEventsWidget.tsx`, função `getStatusColor`:
```typescript
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'em breve':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    // Adicione novos casos aqui
  }
};
```

## Melhorias Futuras

### 🚀 Possíveis Implementações
- **Notificações push** quando novos eventos são criados
- **Favoritar eventos** para receber lembretes
- **Filtros por tipo** (Quiz, Competição, etc.)
- **Calendário visual** com datas dos eventos
- **Integração com Google Calendar**
- **Contagem regressiva em tempo real**
- **Participação/interesse** nos eventos

### 📊 Analytics
- Rastrear cliques no widget
- Eventos mais visualizados
- Taxa de participação por evento

## Suporte

Para dúvidas ou sugestões sobre o widget:
1. Verifique se há eventos criados com status corretos
2. Confirme que o usuário está logado
3. Teste com eventos de exemplo usando `npm run seed-events`
4. Verifique o console do navegador para erros

---

**Criado para T513 - Uma nova Era! 🎮**