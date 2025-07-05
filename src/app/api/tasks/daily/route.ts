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
        message: "Você já completou a tarefa de hoje. Volte amanhã!" 
      });
    }

    // Buscar perguntas aleatórias
    const allQuestions = await prisma.question.findMany({
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

    if (!allQuestions || allQuestions.length < 5) {
      return NextResponse.json({ error: "Perguntas insuficientes para tarefa diária" }, { status: 404 });
    }

    // Embaralhar e pegar 5 perguntas aleatórias
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);

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