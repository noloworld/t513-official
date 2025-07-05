import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const reqId = params.id;
    const redemption = await prisma.redemptionRequest.findUnique({ where: { id: reqId }, include: { user: true } });
    if (!redemption || redemption.status !== 'pendente') {
      return NextResponse.json({ error: "Pedido não encontrado ou já processado" }, { status: 404 });
    }
    if (redemption.points > redemption.user.points) {
      return NextResponse.json({ error: "Usuário não possui pontos suficientes" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.redemptionRequest.update({ where: { id: reqId }, data: { status: 'aprovado' } }),
      prisma.user.update({ where: { id: redemption.userId }, data: { points: { decrement: redemption.points } } })
    ]);
    return NextResponse.json({ message: "Pedido aprovado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao aprovar pedido" }, { status: 500 });
  }
} 