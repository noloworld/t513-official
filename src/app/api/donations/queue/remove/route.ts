import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    const { nickname } = await request.json();

    if (!nickname) {
      return NextResponse.json(
        { error: 'Nickname é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo nickname
    const userToRemove = await prisma.user.findUnique({
      where: { nickname }
    });
    if (!userToRemove) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { status: 'ACTIVE' }
    });
    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Nenhuma doação ativa encontrada' },
        { status: 400 }
      );
    }

    // Remover usuário da fila
    await prisma.queueUser.deleteMany({
      where: { userId: userToRemove.id, donationId: activeDonation.id }
    });

    return NextResponse.json({
      message: 'Usuário removido da fila com sucesso',
      nickname: userToRemove.nickname
    });
  } catch (error) {
    console.error('Erro ao remover usuário da fila:', error);
    return NextResponse.json(
      { error: 'Erro ao remover usuário da fila' },
      { status: 500 }
    );
  }
}