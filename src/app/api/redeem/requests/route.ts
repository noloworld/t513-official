import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Verificar se é admin ou moderador
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar pedidos pendentes
    const requests = await prisma.redemptionRequest.findMany({
      where: { status: "pendente" },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            nickname: true,
            email: true,
            level: true
          }
        }
      }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Erro ao buscar pedidos de resgate:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 