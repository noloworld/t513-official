const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando badges dos usuários...\n');
  
  const userBadges = await prisma.userBadge.findMany({
    include: {
      user: {
        select: {
          nickname: true,
          email: true
        }
      },
      badge: {
        select: {
          name: true,
          description: true
        }
      }
    },
    orderBy: {
      user: {
        nickname: 'asc'
      }
    }
  });
  
  console.log(`📊 Total de badges atribuídos: ${userBadges.length}\n`);
  
  if (userBadges.length === 0) {
    console.log('❌ Nenhum usuário tem badges ainda.');
    return;
  }
  
  const usersWithBadges = {};
  
  userBadges.forEach(userBadge => {
    const userNickname = userBadge.user.nickname;
    if (!usersWithBadges[userNickname]) {
      usersWithBadges[userNickname] = [];
    }
    usersWithBadges[userNickname].push(userBadge.badge.name);
  });
  
  Object.keys(usersWithBadges).forEach(nickname => {
    console.log(`👤 ${nickname}:`);
    usersWithBadges[nickname].forEach(badgeName => {
      const isWelcome = badgeName === 'Bem-vindo' ? ' 🎉' : '';
      console.log(`   - ${badgeName}${isWelcome}`);
    });
    console.log('');
  });
  
  // Verificar especificamente o badge "Bem-vindo"
  const welcomeBadges = userBadges.filter(ub => ub.badge.name === 'Bem-vindo');
  console.log(`🎉 Usuários com badge "Bem-vindo": ${welcomeBadges.length}`);
  welcomeBadges.forEach(wb => {
    console.log(`   - ${wb.user.nickname} (${wb.user.email})`);
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