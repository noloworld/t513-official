import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Busca a doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        queueUsers: {
          include: {
            user: {
              select: {
                nickname: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!activeDonation) {
      // Se não houver doação ativa, busca a última doação finalizada para mostrar resultados
      const lastDonation = await prisma.donation.findFirst({
        where: { status: 'ENDED' },
        orderBy: { endTime: 'desc' },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  nickname: true,
                },
              },
            },
            orderBy: {
              cambios: 'desc',
            },
          },
        },
      });

      if (lastDonation) {
        const results = {
          totalTime: formatElapsedTime(lastDonation.startTime, lastDonation.endTime!),
          participants: lastDonation.participants.map((p, index) => ({
            nickname: p.user.nickname,
            cambiosEarned: p.cambios,
            position: index + 1,
            avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${p.user.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
          })),
        };

        return NextResponse.json({
          isLive: false,
          queue: [],
          currentCode: null,
          results,
        });
      }

      return NextResponse.json({
        isLive: false,
        queue: [],
        currentCode: null,
        results: null,
      });
    }

    // Formata a fila de usuários
    const queue = activeDonation.queueUsers.map(entry => ({
      id: entry.id,
      nickname: entry.user.nickname,
      cambiosEarned: entry.cambiosEarned,
      nextCambioIn: 180, // 3 minutos por padrão
      avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.user.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
    }));

    return NextResponse.json({
      isLive: true,
      isQueuePaused: activeDonation.isQueuePaused,
      startTime: activeDonation.startTime,
      queue,
      currentCode: activeDonation.currentCode,
      results: null,
    });
  } catch (error) {
    console.error('Erro ao buscar status da doação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function formatElapsedTime(startTime: Date, endTime: Date): string {
  const diff = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}