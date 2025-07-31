const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        email: true,
        role: true,
        level: true,
        points: true,
        isVerified: true
      }
    });

    console.log('=== USUÁRIOS NO BANCO ===');
    users.forEach(user => {
      console.log(`Nickname: ${user.nickname} | Role: ${user.role} | Email: ${user.email} | Verificado: ${user.isVerified}`);
    });
    
    const adminUsers = users.filter(user => user.role === 'admin');
    console.log(`\n=== ADMINS ENCONTRADOS: ${adminUsers.length} ===`);
    adminUsers.forEach(user => {
      console.log(`Admin: ${user.nickname} | Email: ${user.email}`);
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 