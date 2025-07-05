const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Cria uma tarefa diária ativa
  const task = await prisma.task.create({
    data: {
      title: 'Tarefa Diária de Teste',
      description: 'Responda as perguntas para ganhar pontos!',
      isActive: true,
      questions: {
        create: [
          {
            questionText: 'Qual o nome do mascote do Habbo Hotel?',
            optionA: 'Bobba',
            optionB: 'Frank',
            optionC: 'Habbo',
            optionD: 'Max',
            correctAnswer: 'B',
            explanation: 'Frank é o mascote clássico do Habbo.',
            order: 1,
            difficulty: 'fácil'
          },
          {
            questionText: 'Qual comando fecha o chat no Habbo?',
            optionA: '/fechar',
            optionB: '/sair',
            optionC: '/x',
            optionD: '/close',
            correctAnswer: 'C',
            explanation: 'O comando /x fecha o chat.',
            order: 2,
            difficulty: 'fácil'
          }
        ]
      }
    },
    include: { questions: true }
  });

  console.log('Tarefa diária criada com sucesso:', task);
  await prisma.$disconnect();
}

main(); 