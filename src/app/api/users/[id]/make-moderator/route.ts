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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const targetId = params.id;
    await prisma.user.update({ where: { id: targetId }, data: { role: 'moderator' } });
    return NextResponse.json({ message: "Usuário promovido a moderador" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao promover moderador" }, { status: 500 });
  }
} 