import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getPointsPerQuestion } from "@/lib/points";

const prisma = new PrismaClient();

// GET - Buscar tarefa diária
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get("auth_token")?.value;
    console.log("[DEBUG] Token recebido:", token);
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;
    console.log("[DEBUG] userId decodificado:", userId);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    console.log("[DEBUG] Usuário encontrado:", user);

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se já fez a tarefa hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('[DEBUG] Filtro de data:', {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
      userId
    });

    const todayAttempt = await prisma.taskAttempt.findFirst({
      where: {
        userId,
        completedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    console.log('[DEBUG] todayAttempt encontrado:', todayAttempt);

    if (todayAttempt) {
      return NextResponse.json({ 
        canDoTask: false, 
        message: "Você já completou a tarefa de hoje. Volte amanhã!",
        nextAvailableAt: tomorrow.toISOString()
      });
    }

    // Buscar perguntas já respondidas pelo usuário
    const answered = await prisma.answer.findMany({
      where: { attempt: { userId } },
      select: { questionId: true }
    });
    const answeredIds = answered.map(a => a.questionId);

    // Buscar perguntas não respondidas
    const unansweredQuestions = await prisma.question.findMany({
      where: { id: { notIn: answeredIds } },
      select: {
        id: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        order: true,
        difficulty: true
      }
    });

    // Buscar todas as perguntas (para completar caso precise)
    const allQuestions = unansweredQuestions.length < 5
      ? await prisma.question.findMany({
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            order: true,
            difficulty: true
          }
        })
      : [];

    // Função para embaralhar
    function shuffle(array: any[]) {
      return array.sort(() => 0.5 - Math.random());
    }

    let selectedQuestions = [];
    if (unansweredQuestions.length >= 5) {
      selectedQuestions = shuffle(unansweredQuestions).slice(0, 5);
    } else {
      // Pega todas as não respondidas e completa com respondidas (sem repetir na mesma tarefa)
      const alreadyAnswered = allQuestions.filter(q => !unansweredQuestions.find(uq => uq.id === q.id));
      selectedQuestions = [
        ...unansweredQuestions,
        ...shuffle(alreadyAnswered).slice(0, 5 - unansweredQuestions.length)
      ];
    }

    const pointsPerQuestion = getPointsPerQuestion(user.level);

    return NextResponse.json({
      canDoTask: true,
      task: {
        title: 'Tarefa Diária',
        description: 'Responda as perguntas para ganhar pontos!',
        questions: selectedQuestions
      },
      pointsPerQuestion,
      totalQuestions: selectedQuestions.length
    });

  } catch (error) {
    console.error("Erro ao buscar tarefa diária:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 