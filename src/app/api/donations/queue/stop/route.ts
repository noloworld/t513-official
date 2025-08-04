import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || user.role !== 'admin') {
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

    // Para a fila
    await prisma.donation.update({
      where: { id: activeDonation.id },
      data: { isQueuePaused: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao parar fila:', error);
    return NextResponse.json(
      { error: 'Erro ao parar fila' },
      { status: 500 }
    );
  }
}