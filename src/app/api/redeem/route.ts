import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { points } = await request.json();
    const amountC = Math.floor(points / 10);

    if (!points || points < 10 || points > user.points) {
      return NextResponse.json({ error: "Quantidade de pontos inválida" }, { status: 400 });
    }
    if (amountC < 1) {
      return NextResponse.json({ error: "Mínimo de 10 pontos para resgatar 1 câmbio" }, { status: 400 });
    }

    // Registrar pedido de resgate
    await prisma.redemptionRequest.create({
      data: {
        userId,
        points,
        amountC,
        status: "pendente"
      }
    });

    return NextResponse.json({ message: "Pedido de resgate enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar resgate:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 