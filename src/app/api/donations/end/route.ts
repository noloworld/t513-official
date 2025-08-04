import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca a doação ativa e encerra ela em uma transação
    const activeDonation = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findFirst({
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

      if (!donation) {
        return null;
      }

      // Cria os registros de participação
      const participations = await Promise.all(
        donation.queueUsers.map((entry) =>
          tx.donationParticipation.create({
            data: {
              donationId: donation.id,
              userId: entry.userId,
              cambios: entry.cambiosEarned,
              joinedAt: entry.joinedAt,
              leftAt: new Date(),
            },
          })
        )
      );

      // Atualiza a doação
      const updatedDonation = await tx.donation.update({
        where: { id: donation.id },
        data: {
          status: 'ENDED',
          endTime: new Date(),
          currentCode: null,
        },
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
              cambiosEarned: 'desc',
            },
          },
        },
      });

      return {
        ...updatedDonation,
        participants: participations,
      };
    });

    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Nenhuma doação ativa' },
        { status: 404 }
      );
    }

    // Formata os resultados
    const results = {
      totalTime: formatElapsedTime(activeDonation.startTime, activeDonation.endTime!),
      participants: activeDonation.queueUsers.map((entry, index) => ({
        nickname: entry.user.nickname,
        cambiosEarned: entry.cambiosEarned,
        position: index + 1,
        avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.user.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
      })),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erro ao encerrar doação:', error);
    return NextResponse.json(
      { error: 'Erro ao encerrar doação' },
      { status: 500 }
    );
  }
}

function formatElapsedTime(startTime: Date, endTime: Date): string {
  const diff = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}