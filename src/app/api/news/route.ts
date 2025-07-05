import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// GET - Listar todas as notícias
export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    });

    return NextResponse.json({ news });
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Criar nova notícia
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

    const { title, description, date, type } = await request.json();

    // Validações
    if (!title || !description || !date || !type) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    const news = await prisma.news.create({
      data: {
        title,
        description,
        date,
        type,
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

    return NextResponse.json({ news, message: "Notícia criada com sucesso" });

  } catch (error) {
    console.error("Erro ao criar notícia:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 