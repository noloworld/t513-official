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

    // Remover usuário da fila
    await prisma.queueUser.deleteMany({
      where: { nickname }
    });

    return NextResponse.json({
      message: 'Usuário removido da fila com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover usuário da fila:', error);
    return NextResponse.json(
      { error: 'Erro ao remover usuário da fila' },
      { status: 500 }
    );
  }
}