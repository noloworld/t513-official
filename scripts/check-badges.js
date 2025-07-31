const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando badges no banco de dados...\n');
  
  const badges = await prisma.badge.findMany({
    orderBy: { name: 'asc' }
  });
  
  console.log(`📊 Total de badges: ${badges.length}\n`);
  
  badges.forEach((badge, index) => {
    console.log(`${index + 1}. ${badge.name}`);
    console.log(`   Descrição: ${badge.description}`);
    console.log(`   Categoria: ${badge.category}`);
    console.log(`   Condição: ${badge.condition}`);
    console.log(`   Ícone: ${badge.icon}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 