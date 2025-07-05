const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const questions = [
  {
    questionText: 'Qual destes é um mob clássico do Habbo Hotel?',
    optionA: 'Sofá HC',
    optionB: 'Cadeira Gamer',
    optionC: 'Mesa Gamer',
    optionD: 'Poltrona VIP',
    correctAnswer: 'A',
    explanation: 'O Sofá HC é um mob clássico.',
    order: 1,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual comando permite sussurrar no Habbo?',
    optionA: '/s',
    optionB: '/w',
    optionC: '/whisper',
    optionD: '/sus',
    correctAnswer: 'B',
    explanation: 'O comando /w permite sussurrar.',
    order: 2,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual destes NÃO é um tipo de moeda do Habbo?',
    optionA: 'Duckets',
    optionB: 'Câmbios',
    optionC: 'Moedas',
    optionD: 'Diamantes',
    correctAnswer: 'C',
    explanation: 'Moedas não é uma moeda oficial.',
    order: 3,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual o nome do hotel manager original?',
    optionA: 'Sef',
    optionB: 'Callie',
    optionC: 'Fozzie',
    optionD: 'Norman',
    correctAnswer: 'B',
    explanation: 'Callie foi a primeira hotel manager.',
    order: 4,
    difficulty: 'fácil'
  },
  {
    questionText: 'O que significa a sigla HC?',
    optionA: 'Habbo Club',
    optionB: 'Hotel Club',
    optionC: 'Habbo Coins',
    optionD: 'Hotel Coins',
    correctAnswer: 'A',
    explanation: 'HC significa Habbo Club.',
    order: 5,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual destes é um evento famoso do Habbo?',
    optionA: 'Baile Funk',
    optionB: 'Batalha Naval',
    optionC: 'Pega-Pega',
    optionD: 'Festa do Pijama',
    correctAnswer: 'C',
    explanation: 'Pega-Pega é um evento clássico.',
    order: 6,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual mob é usado para teletransportar?',
    optionA: 'Porta',
    optionB: 'Teleporte',
    optionC: 'Janela',
    optionD: 'Cadeira',
    correctAnswer: 'B',
    explanation: 'O Teleporte transporta usuários.',
    order: 7,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual destes é um mascote do Habbo?',
    optionA: 'Cachorro',
    optionB: 'Gato',
    optionC: 'Pato',
    optionD: 'Todos',
    correctAnswer: 'D',
    explanation: 'Todos são mascotes possíveis.',
    order: 8,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual destes comandos fecha o chat?',
    optionA: '/x',
    optionB: '/close',
    optionC: '/fechar',
    optionD: '/end',
    correctAnswer: 'A',
    explanation: 'O comando /x fecha o chat.',
    order: 9,
    difficulty: 'fácil'
  },
  {
    questionText: 'Qual destes é um tipo de raros?',
    optionA: 'Super Raro',
    optionB: 'Ultra Raro',
    optionC: 'Mega Raro',
    optionD: 'Raro',
    correctAnswer: 'D',
    explanation: 'Raro é a categoria oficial.',
    order: 10,
    difficulty: 'fácil'
  }
];

async function main() {
  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log('Perguntas inseridas com sucesso!');
  await prisma.$disconnect();
}

main(); 