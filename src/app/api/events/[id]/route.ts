import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// PATCH - Editar evento (apenas descrição e data)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Verificar se o usuário existe e tem permissão (admin ou moderator)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json({ error: "Sem permissão para editar eventos" }, { status: 403 });
    }

    // Buscar o evento atual
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const { description, date } = await request.json();

    // Validações
    if (!date) {
      return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
    }

    // Verificar se houve mudanças
    const hasChanges = description !== existingEvent.description || date !== existingEvent.date;
    
    if (!hasChanges) {
      return NextResponse.json({ error: "Nenhuma alteração detectada" }, { status: 400 });
    }

    // Atualizar o evento
    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        description: description || null,
        date,
        editedBy: userId,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            role: true
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

    console.log('Evento editado:', {
      id: updatedEvent.id,
      title: updatedEvent.title,
      editedBy: updatedEvent.editor?.nickname,
      isRescheduled: updatedEvent.isRescheduled
    });

    return NextResponse.json({ 
      message: "Evento editado com sucesso",
      event: updatedEvent 
    });

  } catch (error) {
    console.error('Erro ao editar evento:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Buscar evento específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            role: true
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

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ event });

  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}