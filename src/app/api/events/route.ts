import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// GET - Listar todos os eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'upcoming', 'all'
    const limit = searchParams.get('limit');

    let whereClause = {};
    
    // Filtrar apenas eventos futuros/ativos se solicitado
    if (filter === 'upcoming') {
      whereClause = {
        OR: [
          { status: 'Em Breve' },
          { status: 'Ativo' },
          { status: 'Programado' }
        ]
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: {
        user: {
          select: {
            nickname: true
          }
        },
        editor: {
          select: {
            id: true,
            nickname: true,
            role: true
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

    const { title, description, date, time, brazilTime, emoji, type, status } = await request.json();

    // Validações
    if (!title || !date || !emoji || !type) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    // Preparar dados com os novos campos de horário
    const eventData = {
      title,
      description: description || "",
      date,
      time: time || null,
      brazilTime: brazilTime || null,
      emoji,
      type,
      status: status || "Em Breve",
      createdBy: userId
    };

    // Log para debug
    console.log('Criando evento com dados completos:', eventData);

    const event = await prisma.event.create({
      data: eventData,
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