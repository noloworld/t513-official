import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Buscar doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { isActive: true }
    });

    // Buscar usuários na fila
    const queueUsers = await prisma.queueUser.findMany({
      orderBy: { joinedAt: 'asc' }
    });

    // Mapear usuários da fila para incluir avatarUrl
    const queue = queueUsers.map(user => ({
      id: user.id,
      nickname: user.nickname,
      avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
      joinedAt: user.joinedAt.toISOString(),
      cambiosEarned: user.cambiosEarned
    }));

    return NextResponse.json({
      isLive: !!activeDonation,
      startTime: activeDonation?.startTime,
      currentCode: activeDonation?.currentCode,
      queue
    });
  } catch (error) {
    console.error('Erro ao obter status da doação:', error);
    return NextResponse.json(
      { error: 'Erro ao obter status da doação' },
      { status: 500 }
    );
  }
}