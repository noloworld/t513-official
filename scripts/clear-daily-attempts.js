const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const nickname = process.argv[2];
  if (!nickname) {
    console.error('Uso: node scripts/clear-daily-attempts.js <nickname>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { nickname } });
  if (!user) {
    console.error('Usuário não encontrado:', nickname);
    process.exit(1);
  }

  const deleted = await prisma.taskAttempt.deleteMany({ where: { userId: user.id } });
  console.log(`Removidos ${deleted.count} registros de taskAttempt para o usuário ${nickname}`);

  await prisma.$disconnect();
}

main(); 