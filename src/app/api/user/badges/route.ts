import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET - Buscar emblemas do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Buscar emblemas do usuário
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });

    return NextResponse.json({
      badges: userBadges
    });

  } catch (error) {
    console.error("Erro ao buscar emblemas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 