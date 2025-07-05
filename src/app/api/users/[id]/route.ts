import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    const targetId = params.id;
    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ message: "Usuário eliminado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao eliminar usuário" }, { status: 500 });
  }
} 