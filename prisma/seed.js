const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  // Cria uma nova tarefa ativa
  const task = await prisma.task.create({
    data: {
      id: uuidv4(),
      title: 'Tarefa Diária Habbo Etiqueta',
      description: 'Responda perguntas sobre etiqueta e regras do Habbo Hotel',
      isActive: true,
    },
  });

  // Perguntas fáceis
  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'Qual é a cor do botão para sair de um quarto no Habbo?',
      optionA: 'Vermelho',
      optionB: 'Azul',
      optionC: 'Verde',
      optionD: 'Amarelo',
      correctAnswer: 'A',
      explanation: 'O botão de sair é tradicionalmente vermelho.',
      order: 1,
      difficulty: 'EASY',
    },
  });
  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'O que NÃO é permitido no Habbo?',
      optionA: 'Ajudar novatos',
      optionB: 'Fazer spam',
      optionC: 'Participar de eventos',
      optionD: 'Conversar com amigos',
      correctAnswer: 'B',
      explanation: 'Spam é proibido nas regras do Habbo.',
      order: 2,
      difficulty: 'EASY',
    },
  });

  // Perguntas médias
  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'Qual comando permite denunciar um usuário?',
      optionA: '/ajuda',
      optionB: '/denunciar',
      optionC: '/reportar',
      optionD: '/mod',
      correctAnswer: 'D',
      explanation: 'O comando correto é /mod.',
      order: 3,
      difficulty: 'MEDIUM',
    },
  });
  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'O que acontece se você for banido temporariamente?',
      optionA: 'Perde todos os móveis',
      optionB: 'Não pode acessar o Habbo por um tempo',
      optionC: 'Ganha um emblema',
      optionD: 'Vira moderador',
      correctAnswer: 'B',
      explanation: 'Banimento temporário impede acesso por um período.',
      order: 4,
      difficulty: 'MEDIUM',
    },
  });

  // Pergunta difícil
  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'Qual destas NÃO é uma regra oficial do Habbo?',
      optionA: 'Não divulgar dados pessoais',
      optionB: 'Não usar scripts/hacks',
      optionC: 'É permitido vender contas',
      optionD: 'Respeitar todos os usuários',
      correctAnswer: 'C',
      explanation: 'Vender contas é proibido, não permitido.',
      order: 5,
      difficulty: 'HARD',
    },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 