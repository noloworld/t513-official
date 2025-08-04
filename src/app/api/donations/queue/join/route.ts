import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verifica se o usuário já está em alguma fila
    const existingEntry = await prisma.queueUser.findFirst({
      where: {
        userId: user.id,
        donation: {
          status: 'ACTIVE',
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Você já está na fila' },
        { status: 400 }
      );
    }

    // Busca a doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Nenhuma doação ativa' },
        { status: 404 }
      );
    }

    // Adiciona o usuário à fila
    const queueEntry = await prisma.queueUser.create({
      data: {
        donationId: activeDonation.id,
        userId: user.id,
        avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
      },
    });

    return NextResponse.json(queueEntry);
  } catch (error) {
    console.error('Erro ao entrar na fila:', error);
    return NextResponse.json(
      { error: 'Erro ao entrar na fila' },
      { status: 500 }
    );
  }
}