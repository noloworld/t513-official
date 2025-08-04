import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Código é obrigatório' },
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

    // Verifica se o código está correto
    if (activeDonation.currentCode !== code) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      );
    }

    // Verifica se o usuário está na fila
    const queueEntry = await prisma.queueUser.findFirst({
      where: {
        donationId: activeDonation.id,
        userId: user.id,
      },
    });

    if (!queueEntry) {
      return NextResponse.json(
        { error: 'Você não está na fila' },
        { status: 400 }
      );
    }

    // Atualiza os câmbios do usuário
    const updatedEntry = await prisma.queueUser.update({
      where: { id: queueEntry.id },
      data: {
        cambiosEarned: queueEntry.cambiosEarned + 1,
      },
    });

    // Limpa o código
    await prisma.donation.update({
      where: { id: activeDonation.id },
      data: { currentCode: null },
    });

    return NextResponse.json({
      cambiosEarned: updatedEntry.cambiosEarned,
    });
  } catch (error) {
    console.error('Erro ao resgatar código:', error);
    return NextResponse.json(
      { error: 'Erro ao resgatar código' },
      { status: 500 }
    );
  }
}