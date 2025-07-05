import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { isActive: true },
      include: {
        queue: {
          where: {
            userId: user.id
          }
        }
      }
    });

    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Não há doação em andamento' },
        { status: 400 }
      );
    }

    // Verificar se o usuário está na fila
    if (activeDonation.queue.length === 0) {
      return NextResponse.json(
        { error: 'Você não está na fila' },
        { status: 400 }
      );
    }

    // Remover usuário da fila
    const removedEntry = await prisma.queueEntry.delete({
      where: {
        id: activeDonation.queue[0].id
      }
    });

    return NextResponse.json({
      message: 'Saiu da fila com sucesso',
      removedEntry
    });
  } catch (error) {
    console.error('Erro ao sair da fila:', error);
    return NextResponse.json(
      { error: 'Erro ao sair da fila' },
      { status: 500 }
    );
  }
} 