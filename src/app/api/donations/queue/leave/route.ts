import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

    // Remove o usuário da fila
    await prisma.queueUser.deleteMany({
      where: {
        donationId: activeDonation.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao sair da fila:', error);
    return NextResponse.json(
      { error: 'Erro ao sair da fila' },
      { status: 500 }
    );
  }
}