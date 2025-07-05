import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface QueueUser {
  id: string;
  userId: string;
  nickname: string;
  joinedAt: Date;
  cambiosEarned: number;
  user: {
    nickname: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Buscar doação ativa com a fila
    const activeDonation = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findFirst({
        where: { isActive: true },
        include: {
          queue: {
            include: {
              user: true
            },
            orderBy: {
              joinedAt: 'asc'
            }
          }
        }
      });

      if (!donation) return null;

      // Calcular resultados da fila
      const queueResults = donation.queue.map((entry, index) => {
        const joinedAt = new Date(entry.joinedAt);
        const now = new Date();
        const timeInQueue = now.getTime() - joinedAt.getTime();
        const cambiosEarned = Math.floor(timeInQueue / (3 * 60 * 1000)); // 3 minutos por câmbio

        return {
          userId: entry.userId,
          nickname: entry.user.nickname,
          cambiosEarned,
          position: index + 1
        };
      });

      // Atualizar participações dos usuários
      for (const result of queueResults) {
        await tx.user.update({
          where: { id: result.userId },
          data: {
            donationParticipations: {
              increment: 1
            }
          }
        });
      }

      // Encerrar doação
      await tx.donation.update({
        where: { id: donation.id },
        data: {
          isActive: false,
          endTime: new Date(),
          queueStopped: false
        }
      });

      return {
        donation,
        results: queueResults
      };
    });

    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Não há doação em andamento' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Doação encerrada com sucesso',
      results: activeDonation.results
    });
  } catch (error) {
    console.error('Erro ao encerrar doação:', error);
    return NextResponse.json(
      { error: 'Erro ao encerrar doação' },
      { status: 500 }
    );
  }
} 