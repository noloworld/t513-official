const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(nickname) {
  try {
    // Atualiza o usuário para admin e nível 100
    const user = await prisma.user.update({
      where: { nickname },
      data: {
        role: 'admin',
        level: 100,
        isVerified: true
      }
    });

    console.log('Usuário atualizado com sucesso:', {
      nickname: user.nickname,
      role: user.role,
      level: user.level
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Pega o nickname da linha de comando
const nickname = process.argv[2];

if (!nickname) {
  console.error('Por favor, forneça o nickname do usuário.');
  console.log('Uso: node scripts/make-admin.js SEU_NICKNAME');
  process.exit(1);
}

makeAdmin(nickname);