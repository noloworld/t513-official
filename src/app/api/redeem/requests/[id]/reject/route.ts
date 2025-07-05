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
    const redemption = await prisma.redemptionRequest.findUnique({ where: { id: reqId } });
    if (!redemption || redemption.status !== 'pendente') {
      return NextResponse.json({ error: "Pedido não encontrado ou já processado" }, { status: 404 });
    }
    await prisma.redemptionRequest.update({ where: { id: reqId }, data: { status: 'rejeitado' } });
    return NextResponse.json({ message: "Pedido rejeitado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao rejeitar pedido" }, { status: 500 });
  }
} 