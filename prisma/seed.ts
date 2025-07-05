import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
      questionText: 'O que significa "floodar" no Habbo?',
      optionA: 'Construir quartos',
      optionB: 'Repetir mensagens',
      optionC: 'Ganhar moedas',
      optionD: 'Trocar mobílias',
      correctAnswer: 'B',
      explanation: 'Floodar é repetir mensagens no chat.',
      order: 2,
      difficulty: 'EASY',
    },
  });

  // Pergunta média
  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'Qual destas atitudes é considerada educada no Habbo?',
      optionA: 'Ignorar todos',
      optionB: 'Ajudar novatos',
      optionC: 'Xingar no chat',
      optionD: 'Fazer spam',
      correctAnswer: 'B',
      explanation: 'Ajudar novatos é sempre bem-vindo na comunidade.',
      order: 3,
      difficulty: 'MEDIUM',
    },
  });

  // Pergunta difícil
  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'Qual comando permite silenciar outro usuário em eventos oficiais?',
      optionA: '/mute',
      optionB: '/ban',
      optionC: '/ignore',
      optionD: '/kick',
      correctAnswer: 'A',
      explanation: 'O comando /mute é usado por moderadores em eventos.',
      order: 4,
      difficulty: 'HARD',
    },
  });

  await prisma.question.create({
    data: {
      id: uuidv4(),
      taskId: task.id,
      questionText: 'O que NÃO é permitido segundo a Habbo Etiqueta?',
      optionA: 'Fazer amigos',
      optionB: 'Trocar mobílias',
      optionC: 'Ofender outros usuários',
      optionD: 'Participar de eventos',
      correctAnswer: 'C',
      explanation: 'Ofensas são proibidas e podem resultar em banimento.',
      order: 5,
      difficulty: 'MEDIUM',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 