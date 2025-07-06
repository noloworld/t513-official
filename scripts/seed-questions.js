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
    difficulty: 'fácil'
  },
  {
    questionText: 'O que representa o nível do avatar no Habbo Hotel?',
    optionA: 'A quantidade de moedas que o jogador possui',
    optionB: 'A quantidade de amigos adicionados',
    optionC: 'A pontuação obtida ao realizar atividades no jogo',
    optionD: 'O tempo total de jogo acumulado',
    correctAnswer: 'C',
    explanation: 'O nível do avatar reflete a pontuação que o jogador conquista ao realizar atividades no jogo.',
    difficulty: 'médio'
  },
  {
    questionText: 'Qual das opções abaixo NÃO influencia diretamente na pontuação de nível?',
    optionA: 'Subir o nível das conquistas',
    optionB: 'Ganhar emblemas que não sejam de conquistas',
    optionC: 'Jogar mini-jogos em quartos públicos',
    optionD: 'Colecionar Mobis exclusivos',
    correctAnswer: 'C',
    explanation: 'Jogar mini-jogos não influencia a pontuação de nível, apenas as atividades listadas no sistema de progressão.',
    difficulty: 'médio'
  },
  {
    questionText: 'Quanto você ganha ao subir um nível de conquista?',
    optionA: 'Nenhum ponto',
    optionB: '1 ponto por nível de conquista',
    optionC: '2 pontos por nível de conquista',
    optionD: '5 pontos por nível de conquista',
    correctAnswer: 'B',
    explanation: 'Cada nível de conquista alcançado rende 1 ponto para o nível do avatar.',
    difficulty: 'médio'
  },
  {
    questionText: 'Quais itens NÃO contam pontos na categoria de mobis?',
    optionA: 'Mobis exclusivos',
    optionB: 'Mobis do Depósito do Arquiteto',
    optionC: 'Mobis de campanhas antigas',
    optionD: 'Mobis trocados recentemente',
    correctAnswer: 'B',
    explanation: 'Mobis do Depósito do Arquiteto não contam para a pontuação de mobis.',
    difficulty: 'médio'
  },
  {
    questionText: 'Por que a pontuação de mobis de um jogador pode diminuir?',
    optionA: 'Por sair do Habbo Hotel por muito tempo',
    optionB: 'Por vender ou se desfazer de mobis',
    optionC: 'Por perder conquistas antigas',
    optionD: 'Por alterar o visual do avatar',
    correctAnswer: 'B',
    explanation: 'Ao vender ou se desfazer de mobis, a quantidade de itens exclusivos diminui, afetando a pontuação.',
    difficulty: 'médio'
  },
  {
    questionText: 'Qual tipo de emblema NÃO conta pontos para o nível?',
    optionA: 'Emblemas de campanhas',
    optionB: 'Emblemas de raridades', 
    optionC: 'Emblemas de conquistas',
    optionD: 'Emblemas de eventos sazonais',
    correctAnswer: 'C',
    explanation: 'Os emblemas de conquista já são contabilizados na pontuação de conquistas, por isso não contam na pontuação de emblemas.',
    difficulty: 'médio'
  },
  {
    questionText: 'Como funciona a pontuação relacionada aos quartos populares?',
    optionA: 'É baseada no número total de visitas diárias', 
    optionB: 'Depende do tempo que outros Habbos de nível superior passam no quarto', 
    optionC: 'Conta somente visitas de amigos',
    optionD: 'Conta apenas durante eventos oficiais do Habbo',
    correctAnswer: 'B',
    explanation: 'A pontuação depende do tempo que Habbos de nível superior passam no seu quarto.',
    difficulty: 'difícil'
  },
  {
    questionText: 'Se um jogador perder pontos de mobis, o que acontece com seu nível?',
    optionA: 'Seu nível sempre diminui', 
    optionB: 'Seu nível aumenta para compensar', 
    optionC: 'O nível não diminui, mesmo que os pontos de mobis caiam',
    optionD: 'Ele perde acesso a itens raros',
    correctAnswer: 'C',
    explanation: 'Mesmo que a pontuação de mobis caia, o nível não diminui; ele permanece no nível alcançado.',
    difficulty: 'difícil'
  },
  {
    questionText: 'Como é calculada a pontuação total do nível?',
    optionA: 'Soma-se todas as categorias de forma ilimitada', 
    optionB: 'Cada categoria conta o dobro da anterior', 
    optionC: 'Cada categoria só conta até o valor combinado das anteriores',
    optionD: 'Apenas a categoria com mais pontos é considerada',
    correctAnswer: 'C',
    explanation: 'Cada categoria de pontos só contribui até o limite da soma das anteriores, promovendo a diversidade de atividades.',
    difficulty: 'difícil'
  },
  {
    questionText: 'No exemplo do texto, qual foi a pontuação total final? (20 pontos de conquistas, 5 pontos de emblemas e 40 pontos de mobis)',
    optionA: '65', 
    optionB: '50', 
    optionC: '45',
    optionD: '40',
    correctAnswer: 'B',
    explanation: 'Soma-se 20 (conquistas) + 5 (emblemas) + 25 (mobis, limitado ao total anterior: 20+5), totalizando 50 pontos.',
    difficulty: 'difícil'
  },
  { 
    questionText: 'O que acontece com mobis duplicados na contagem de pontos?',
    optionA: 'Contam pontos dobrados', 
    optionB: 'Contam normalmente como qualquer outro item', 
    optionC: 'Não contam para a pontuação',
    optionD: 'Contam apenas se forem mobis raros',
    correctAnswer: 'C',
    explanation: 'Apenas itens exclusivos (sem repetição) contam pontos. Mobis duplicados não pontuam.',
    difficulty: 'difícil'
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