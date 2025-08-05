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
    const userToAdd = await prisma.user.findUnique({
      where: { nickname }
    });
    if (!userToAdd) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já está na fila
    const existingUser = await prisma.queueUser.findFirst({
      where: { userId: userToAdd.id }
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já está na fila' },
        { status: 400 }
      );
    }

    // Adicionar usuário à fila
    const queueUser = await prisma.queueUser.create({
      data: {
        userId: userToAdd.id,
        joinedAt: new Date(),
        cambiosEarned: 0,
        avatarUrl: userToAdd.avatarUrl // se quiser salvar o avatar
      }
    });

    return NextResponse.json({
      message: 'Usuário adicionado à fila com sucesso',
      id: queueUser.id,
      nickname: userToAdd.nickname
    });
  } catch (error) {
    console.error('Erro ao adicionar usuário à fila:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar usuário à fila' },
      { status: 500 }
    );
  }
}