const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const WELCOME_BADGE = {
  name: 'Bem-vindo',
  description: 'Registrou-se na plataforma',
  icon: '🎉',
  condition: 'register',
  category: 'registration'
};

async function main() {
  try {
    console.log('Iniciando adição de emblemas de Bem-vindo...');
    console.log('Conectando ao banco de dados...');

    // Verificar se o emblema já existe no banco
    let dbBadge = await prisma.badge.findUnique({
      where: { name: WELCOME_BADGE.name }
    });

    if (!dbBadge) {
      // Criar emblema no banco se não existir
      dbBadge = await prisma.badge.create({
        data: WELCOME_BADGE
      });
      console.log('Emblema "Bem-vindo" criado no banco');
    } else {
      console.log('Emblema "Bem-vindo" já existe no banco');
    }

    // Buscar todos os usuários
    const users = await prisma.user.findMany();
    console.log(`Encontrados ${users.length} usuários`);

    let addedCount = 0;

    for (const user of users) {
      // Verificar se o usuário já tem o emblema
      const existingBadge = await prisma.userBadge.findFirst({
        where: {
          userId: user.id,
          badgeId: dbBadge.id
        }
      });

      if (!existingBadge) {
        // Adicionar emblema ao usuário
        await prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: dbBadge.id
          }
        });
        addedCount++;
        console.log(`Emblema adicionado ao usuário: ${user.nickname}`);
      }
    }

    console.log(`\n✅ Processo concluído!`);
    console.log(`📊 Total de usuários: ${users.length}`);
    console.log(`🎉 Emblemas adicionados: ${addedCount}`);

  } catch (error) {
    console.error('Erro ao adicionar emblemas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 