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

    console.log('Usuário tentando entrar na fila:', user);

    // Verificar se o usuário existe no banco
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      console.log('Usuário não encontrado no banco:', user.id);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
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

    console.log('Doação ativa encontrada:', activeDonation);

    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Não há doação em andamento' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já está na fila
    if (activeDonation.queue.length > 0) {
      return NextResponse.json(
        { error: 'Você já está na fila' },
        { status: 400 }
      );
    }

    // Adicionar usuário à fila
    const queueEntry = await prisma.queueEntry.create({
      data: {
        donationId: activeDonation.id,
        userId: dbUser.id,
        joinedAt: new Date(),
        cambiosEarned: 0
      }
    });

    console.log('Entrada na fila criada:', queueEntry);

    return NextResponse.json({
      message: 'Entrou na fila com sucesso',
      queueEntry
    });
  } catch (error) {
    console.error('Erro ao entrar na fila:', error);
    return NextResponse.json(
      { error: 'Erro ao entrar na fila' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 