const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestEvents() {
  try {
    // Buscar um usuário admin para criar os eventos
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado. Execute primeiro o script create-admin.js');
      return;
    }

    console.log('🎮 Criando eventos de teste...');

    const testEvents = [
      {
        title: 'Mega Evento de Verão 2025',
        description: 'Grande evento de verão com muitos prêmios e diversão! Não perca esta oportunidade única.',
        date: '28/01/2025',
        time: '15:00',
        brazilTime: '11:00',
        emoji: '🏖️',
        type: 'Evento Especial',
        status: 'Em Breve',
        createdBy: adminUser.id
      },
      {
        title: 'Caça ao Tesouro Semanal',
        description: 'Encontre as pistas escondidas pelo hotel e ganhe câmbios exclusivos.',
        date: '25/01/2025',
        time: '18:30',
        brazilTime: '14:30',
        emoji: '🗺️',
        type: 'Resistência',
        status: 'Ativo',
        createdBy: adminUser.id
      },
      {
        title: 'Quiz da T513 - Especial',
        description: 'Teste seus conhecimentos sobre o Habbo Hotel em um quiz super divertido!',
        date: '30/01/2025',
        time: '20:00',
        brazilTime: '16:00',
        emoji: '🧠',
        type: 'Evento Especial',
        status: 'Programado',
        createdBy: adminUser.id
      },
      {
        title: 'Grande Doação de Inverno',
        description: 'Participe da maior doação do hotel. Vários prêmios e câmbios!',
        date: '02/02/2025',
        time: '16:00',
        brazilTime: '12:00',
        emoji: '💰',
        type: 'Doação',
        status: 'Em Breve',
        createdBy: adminUser.id
      },
      {
        title: 'Festa de Aniversário T513',
        description: 'Celebre conosco o aniversário da T513 com festa, música e prêmios especiais.',
        date: '05/02/2025',
        time: '21:00',
        brazilTime: '17:00',
        emoji: '🎉',
        type: 'Evento Especial',
        status: 'Em Breve',
        createdBy: adminUser.id
      },
      {
        title: 'Evento Encerrado (Exemplo)',
        description: 'Este é um exemplo de evento que já foi finalizado.',
        date: '20/01/2025',
        time: '19:00',
        brazilTime: '15:00',
        emoji: '✅',
        type: 'Evento Especial',
        status: 'Finalizado',
        createdBy: adminUser.id
      },
      {
        title: 'Quiz de Natal 2024',
        description: 'Quiz especial de Natal que aconteceu em dezembro com muitos prêmios natalinos.',
        date: '25/12/2024',
        time: '22:00',
        brazilTime: '18:00',
        emoji: '🎄',
        type: 'Evento Especial',
        status: 'Finalizado',
        createdBy: adminUser.id
      },
      {
        title: 'Doação de Ano Novo',
        description: 'Grande doação para celebrar a chegada de 2025 com muitos câmbios.',
        date: '01/01/2025',
        time: '00:00',
        brazilTime: '20:00',
        emoji: '🎊',
        type: 'Doação',
        status: 'Encerrado',
        createdBy: adminUser.id
      }
    ];

    for (const eventData of testEvents) {
      await prisma.event.create({
        data: eventData
      });
      console.log(`✅ Evento criado: ${eventData.title}`);
    }

    console.log('🎊 Todos os eventos de teste foram criados com sucesso!');
    console.log('📅 Eventos futuros/ativos que aparecerão no widget:');
    
    const upcomingEvents = await prisma.event.findMany({
      where: {
        OR: [
          { status: 'Em Breve' },
          { status: 'Ativo' },
          { status: 'Programado' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    upcomingEvents.forEach(event => {
      console.log(`  • ${event.emoji} ${event.title} - ${event.status} (${event.date})`);
    });

    console.log('\n📜 Eventos finalizados que aparecerão na seção "Últimos Eventos":');
    
    const pastEvents = await prisma.event.findMany({
      where: {
        OR: [
          { status: 'Finalizado' },
          { status: 'Encerrado' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    pastEvents.forEach(event => {
      console.log(`  • ${event.emoji} ${event.title} - ${event.status} (${event.date})`);
    });

  } catch (error) {
    console.error('❌ Erro ao criar eventos de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestEvents();