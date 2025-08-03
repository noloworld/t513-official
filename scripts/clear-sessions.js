const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearSessions() {
  try {
    // Atualiza todos os usuários para garantir que os campos necessários existam
    await prisma.user.updateMany({
      data: {
        isActive: true,
        deviceInfo: null,
        lastIpAddress: null
      }
    });

    console.log('Sessões limpas com sucesso!');

  } catch (error) {
    console.error('Erro ao limpar sessões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();