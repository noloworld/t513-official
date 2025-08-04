import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Criar tarefa diária
  await prisma.task.create({
    data: {
      id: uuidv4(),
      question: 'Qual é a regra mais importante do Habbo Hotel?',
      options: JSON.stringify([
        'Não fazer flood',
        'Respeitar todos os usuários',
        'Não pedir moedas',
        'Não compartilhar dados pessoais'
      ]),
      answer: 1,
      points: 50,
      type: 'daily',
    },
  });

  // Criar emblemas iniciais
  await prisma.badge.create({
    data: {
      id: uuidv4(),
      name: 'Primeiro Passo',
      description: 'Completou sua primeira tarefa diária',
      imageUrl: '/imagens/primeiro-passo.png',
      requirement: 'Completar 1 tarefa diária',
    },
  });

  await prisma.badge.create({
    data: {
      id: uuidv4(),
      name: 'Estudioso',
      description: 'Completou 5 tarefas diárias',
      imageUrl: '/imagens/estudioso.png',
      requirement: 'Completar 5 tarefas diárias',
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