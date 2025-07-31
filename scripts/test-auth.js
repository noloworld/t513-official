const { PrismaClient } = require('@prisma/client');
const { createToken, verifyToken } = require('../src/lib/auth.ts');

const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar o usuário PrHabbo
    const user = await prisma.user.findUnique({
      where: { nickname: 'PrHabbo.' }
    });

    if (!user) {
      console.log('Usuário PrHabbo. não encontrado');
      return;
    }

    console.log('Usuário encontrado:', {
      nickname: user.nickname,
      role: user.role,
      email: user.email
    });

    // Criar um token para o usuário
    const token = await createToken({
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      level: user.level,
      points: user.points,
      isVerified: user.isVerified,
      role: user.role
    });

    console.log('Token criado:', token);

    // Verificar o token
    const verifiedUser = await verifyToken(token);
    console.log('Usuário verificado:', verifiedUser);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 