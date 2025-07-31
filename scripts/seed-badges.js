const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const badges = [
  // Emblema de Registro
  {
    name: 'Bem-vindo',
    description: 'Registrou-se na plataforma',
    icon: '🎉',
    condition: 'register',
    category: 'registration'
  },
  
  // Emblemas de Tarefas
  {
    name: 'Primeiro Passo',
    description: 'Completou sua primeira tarefa diária',
    icon: '🌟',
    condition: 'complete_tasks',
    category: 'tasks'
  },
  {
    name: 'Estudioso',
    description: 'Completou 10 tarefas diárias',
    icon: '📚',
    condition: 'complete_tasks',
    category: 'tasks'
  },
  {
    name: 'Dedicado',
    description: 'Completou 20 tarefas diárias',
    icon: '🎯',
    condition: 'complete_tasks',
    category: 'tasks'
  },
  {
    name: 'Persistente',
    description: 'Completou 30 tarefas diárias',
    icon: '🏆',
    condition: 'complete_tasks',
    category: 'tasks'
  },
  {
    name: 'Lenda',
    description: 'Completou 50 tarefas diárias',
    icon: '⭐',
    condition: 'complete_tasks',
    category: 'tasks'
  },
  
  // Emblemas de Doações
  {
    name: '1 Doação',
    description: 'Participou de sua primeira doação',
    icon: '💝',
    condition: 'participate_donations',
    category: 'donations'
  },
  {
    name: '5 Doações',
    description: 'Participou de 5 doações',
    icon: '🎁',
    condition: 'participate_donations',
    category: 'donations'
  },
  {
    name: '10 Doações',
    description: 'Participou de 10 doações',
    icon: '💎',
    condition: 'participate_donations',
    category: 'donations'
  },
  {
    name: '20 Doações',
    description: 'Participou de 20 doações',
    icon: '🏅',
    condition: 'participate_donations',
    category: 'donations'
  },
  {
    name: '40 Doações',
    description: 'Participou de 40 doações',
    icon: '🥇',
    condition: 'participate_donations',
    category: 'donations'
  }
];

async function main() {
  console.log('🌱 Iniciando seed dos badges...');

  for (const badge of badges) {
    try {
      const existingBadge = await prisma.badge.findUnique({
        where: { name: badge.name }
      });

      if (existingBadge) {
        console.log(`✅ Badge "${badge.name}" já existe`);
      } else {
        const createdBadge = await prisma.badge.create({
          data: badge
        });
        console.log(`✅ Badge "${badge.name}" criado com sucesso`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar badge "${badge.name}":`, error);
    }
  }

  console.log('🎉 Seed dos badges concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 