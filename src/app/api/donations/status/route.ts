import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const activeDonation = await prisma.$transaction(async (tx: any) => {
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

      // Calcular câmbios ganhos para cada usuário na fila
      const queueWithCambios = donation.queue.map((entry: any) => {
        const joinedAt = new Date(entry.joinedAt);
        const now = new Date();
        const timeInQueue = now.getTime() - joinedAt.getTime();
        const cambiosEarned = Math.floor(timeInQueue / (3 * 60 * 1000)); // 3 minutos por câmbio
        const nextCambioIn = 180 - (Math.floor(timeInQueue / 1000) % 180); // 180 segundos = 3 minutos

        return {
          id: entry.userId,
          nickname: entry.user.nickname,
          avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.user.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
          joinedAt: entry.joinedAt,
          cambiosEarned,
          nextCambioIn
        };
      });

      // Verificar se a fila está parada
      const isQueueStopped = donation.queueStopped === true;

      // Se a fila estiver parada, calcular os resultados
      let queueResults = null;
      if (isQueueStopped) {
        const startTime = new Date(donation.startTime);
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const totalTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        queueResults = {
          totalTime,
          participants: queueWithCambios.map((user: any, index: number) => ({
            nickname: user.nickname,
            avatarUrl: user.avatarUrl,
            cambiosEarned: user.cambiosEarned,
            position: index + 1
          }))
        };
      }

      return {
        donation,
        queueWithCambios,
        isQueueStopped,
        queueResults
      };
    });

    if (!activeDonation) {
      return NextResponse.json({
        isLive: false,
        startTime: null,
        queue: [],
        currentCode: null,
        isQueueStopped: false,
        queueResults: null
      });
    }

    return NextResponse.json({
      isLive: activeDonation.donation.isActive,
      startTime: activeDonation.donation.startTime,
      queue: activeDonation.queueWithCambios,
      currentCode: activeDonation.donation.currentCode,
      isQueueStopped: activeDonation.isQueueStopped,
      queueResults: activeDonation.queueResults
    });
  } catch (error) {
    console.error('Erro ao buscar status da doação:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status da doação' },
      { status: 500 }
    );
  }
} 