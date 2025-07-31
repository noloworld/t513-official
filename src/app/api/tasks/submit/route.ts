import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { calculateTaskPoints, calculateLevel, getPointsToNextLevel } from "@/lib/points";
import { checkEarnedBadges, BADGES } from "@/lib/badges";

const prisma = new PrismaClient();

interface SubmitAnswer {
  questionId: string;
  answer: string; // 'A', 'B', 'C', ou 'D'
}

// POST - Submeter respostas da tarefa diária
export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Iniciando submissão de tarefa");
    
    // Verificar autenticação
    const token = request.cookies.get("auth_token")?.value;
    console.log("[DEBUG] Token recebido:", !!token);
    if (!token) {
      console.log("[DEBUG] Erro: Token não fornecido");
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;
    console.log("[DEBUG] userId:", userId);

    const body = await request.json();
    console.log("[DEBUG] Body recebido:", body);
    const { answers }: { answers: SubmitAnswer[] } = body;

    if (!answers || !Array.isArray(answers)) {
      console.log("[DEBUG] Erro: answers inválido");
      return NextResponse.json({ error: "Respostas inválidas" }, { status: 400 });
    }

    console.log("[DEBUG] Número de respostas:", answers.length);

    // Verificar se já fez a tarefa hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttempt = await prisma.taskAttempt.findFirst({
      where: {
        userId,
        completedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    console.log("[DEBUG] Tentativa de hoje encontrada:", !!todayAttempt);

    if (todayAttempt) {
      console.log("[DEBUG] Erro: já fez tarefa hoje");
      return NextResponse.json({ 
        error: "Você já completou a tarefa de hoje. Volte amanhã!" 
      }, { status: 400 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log("[DEBUG] Usuário encontrado:", !!user);
    if (!user) {
      console.log("[DEBUG] Erro: usuário não encontrado");
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar perguntas respondidas
    const questionIds = answers.map(a => a.questionId);
    console.log("[DEBUG] Question IDs:", questionIds);
    
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });
    console.log("[DEBUG] Perguntas encontradas:", questions.length);

    if (questions.length !== answers.length) {
      console.log("[DEBUG] Erro: número de perguntas não confere");
      return NextResponse.json({ error: "Perguntas não encontradas" }, { status: 400 });
    }

    // Calcular pontuação
    let correctAnswers = 0;
    const results = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        console.log("[DEBUG] Erro: pergunta não encontrada para ID:", answer.questionId);
        return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 400 });
      }

      const isCorrect = question.correctAnswer === answer.answer;
      if (isCorrect) correctAnswers++;

      results.push({
        questionId: answer.questionId,
        questionText: question.questionText,
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        options: {
          A: question.optionA,
          B: question.optionB,
          C: question.optionC,
          D: question.optionD
        }
      });
    }

    console.log("[DEBUG] Respostas corretas:", correctAnswers);
    console.log("[DEBUG] Total de perguntas:", questions.length);

    const totalPoints = calculateTaskPoints(user.level, correctAnswers);
    console.log("[DEBUG] Pontos calculados:", totalPoints);

    // Criar uma Task temporária para registrar a tentativa
    const tempTask = await prisma.task.create({
      data: {
        title: 'Tarefa Diária',
        description: 'Tarefa diária gerada automaticamente',
        isActive: false
      }
    });
    console.log("[DEBUG] Task temporária criada:", tempTask.id);

    // Criar tentativa da tarefa
    const attempt = await prisma.taskAttempt.create({
      data: {
        userId,
        taskId: tempTask.id,
        score: correctAnswers,
        totalPoints
      }
    });
    console.log("[DEBUG] Tentativa criada:", attempt.id);

    // Criar respostas individuais
    for (const result of results) {
      await prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId: result.questionId,
          userAnswer: result.userAnswer,
          isCorrect: result.isCorrect,
          pointsEarned: result.isCorrect ? totalPoints / questions.length : 0
        }
      });
    }
    console.log("[DEBUG] Respostas individuais criadas");

    // Atualizar pontos do usuário
    const newTotalPoints = user.points + totalPoints;
    const newLevel = calculateLevel(newTotalPoints);
    const leveledUp = newLevel > user.level;

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: newTotalPoints,
        level: newLevel
      }
    });
    console.log("[DEBUG] Usuário atualizado - novos pontos:", newTotalPoints, "novo nível:", newLevel);

    // Verificar emblemas conquistados
    const tasksCompleted = await prisma.taskAttempt.count({
      where: { userId }
    });

    const userStats = {
      tasksCompleted,
      donationsParticipated: 0, // TODO: implementar quando tiver sistema de doações
      level: newLevel,
      isRegistered: true
    };

    const earnedBadges = checkEarnedBadges(userStats);
    const newBadges = [];

    // Verificar quais emblemas são novos
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true }
    });

    const existingBadgeIds = existingBadges.map(ub => ub.badge.name);

    for (const badge of earnedBadges) {
      if (!existingBadgeIds.includes(badge.name)) {
        // Criar emblema no banco se não existir
        let dbBadge = await prisma.badge.findUnique({
          where: { name: badge.name }
        });

        if (!dbBadge) {
          dbBadge = await prisma.badge.create({
            data: {
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              condition: badge.condition,
              category: badge.category
            }
          });
        }

        // Criar relação usuário-emblema
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: dbBadge.id
          }
        });

        newBadges.push(badge);
      }
    }

    const pointsToNextLevel = getPointsToNextLevel(newTotalPoints, newLevel);

    console.log("[DEBUG] Retornando resposta de sucesso");
    return NextResponse.json({
      success: true,
      results,
      score: correctAnswers,
      totalQuestions: questions.length,
      pointsEarned: totalPoints,
      newTotalPoints,
      leveledUp,
      newLevel,
      pointsToNextLevel,
      newBadges
    });

  } catch (error) {
    console.error("Erro ao submeter tarefa:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 