const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleTasks = [
  {
    title: "Habbo Etiqueta - Básico",
    description: "Teste seus conhecimentos sobre comportamento adequado no Habbo Hotel",
    questions: [
      {
        questionText: "Qual é a forma correta de cumprimentar alguém no Habbo?",
        optionA: "Entrar no quarto e ficar em silêncio",
        optionB: "Dizer 'oi' ou 'olá' educadamente",
        optionC: "Gritar em letras maiúsculas",
        optionD: "Ignorar todos os presentes",
        correctAnswer: "B",
        explanation: "A educação é fundamental no Habbo. Sempre cumprimente as pessoas educadamente ao entrar em um quarto.",
        order: 1
      },
      {
        questionText: "O que você deve fazer se alguém estiver sendo desrespeitoso?",
        optionA: "Responder com desrespeito também",
        optionB: "Ignorar e reportar se necessário",
        optionC: "Sair do jogo imediatamente",
        optionD: "Chamar mais pessoas para brigar",
        correctAnswer: "B",
        explanation: "A melhor atitude é ignorar comportamentos negativos e usar a função de reportar quando necessário.",
        order: 2
      },
      {
        questionText: "Como você deve se comportar em eventos oficiais do Habbo?",
        optionA: "Fazer muito barulho para chamar atenção",
        optionB: "Seguir as regras e instruções dos moderadores",
        optionC: "Tentar atrapalhar o evento",
        optionD: "Ficar AFK durante todo o evento",
        correctAnswer: "B",
        explanation: "Em eventos oficiais, é importante seguir as regras e respeitar as instruções dos moderadores para que todos possam se divertir.",
        order: 3
      },
      {
        questionText: "Qual é a atitude correta ao pedir ajuda no Habbo?",
        optionA: "Gritar 'HELP' repetidamente",
        optionB: "Perguntar educadamente e agradecer",
        optionC: "Exigir que alguém te ajude",
        optionD: "Ameaçar se ninguém ajudar",
        correctAnswer: "B",
        explanation: "Sempre peça ajuda de forma educada e lembre-se de agradecer quando alguém te ajudar.",
        order: 4
      },
      {
        questionText: "Como você deve tratar novos usuários (newbies) no Habbo?",
        optionA: "Ignorar completamente",
        optionB: "Zombar por serem novos",
        optionC: "Ser acolhedor e ajudar quando possível",
        optionD: "Expulsá-los dos quartos",
        correctAnswer: "C",
        explanation: "Todos foram novos um dia! Seja acolhedor com novos usuários e ajude-os a se adaptar ao jogo.",
        order: 5
      }
    ]
  }
];

async function seedTasks() {
  console.log('Iniciando população das tarefas...');
  
  try {
    for (const taskData of sampleTasks) {
      // Verificar se a tarefa já existe
      const existingTask = await prisma.task.findFirst({
        where: { title: taskData.title }
      });
      
      if (existingTask) {
        console.log(`Tarefa "${taskData.title}" já existe, pulando...`);
        continue;
      }
      
      // Criar a tarefa
      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          isActive: true
        }
      });
      
      console.log(`Tarefa criada: ${task.title}`);
      
      // Criar as perguntas
      for (const questionData of taskData.questions) {
        await prisma.question.create({
          data: {
            taskId: task.id,
            questionText: questionData.questionText,
            optionA: questionData.optionA,
            optionB: questionData.optionB,
            optionC: questionData.optionC,
            optionD: questionData.optionD,
            correctAnswer: questionData.correctAnswer,
            explanation: questionData.explanation,
            order: questionData.order
          }
        });
      }
      
      console.log(`${taskData.questions.length} perguntas criadas para "${task.title}"`);
    }
    
    console.log('População das tarefas concluída!');
    
  } catch (error) {
    console.error('Erro ao popular tarefas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTasks(); 