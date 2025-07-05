import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// GET - Listar todos os eventos
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Criar novo evento
export async function POST(request: NextRequest) {
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

    const { title, description, date, emoji, type, status } = await request.json();

    // Validações
    if (!title || !date || !emoji || !type) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date,
        emoji,
        type,
        status: status || "Em Breve",
        createdBy: userId
      },
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    });

    return NextResponse.json({ event, message: "Evento criado com sucesso" });

  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 