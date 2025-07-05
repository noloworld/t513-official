const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminData = {
    nickname: 'Admin.T513',
    email: 'admin@t513.com.br',
    password: await bcrypt.hash('T513@admin2024', 10),
    isVerified: true,
    role: 'admin',
    level: 100,
    points: 1000
  };

  try {
    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: adminData,
      create: adminData
    });

    console.log('Administrador criado/atualizado com sucesso:', {
      nickname: admin.nickname,
      email: admin.email,
      role: admin.role,
      level: admin.level
    });
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 