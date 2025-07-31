import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { nickname } = await request.json();

    if (!nickname) {
      return NextResponse.json(
        { error: 'Nickname é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o nickname já existe no T513
    const existingUser = await prisma.user.findUnique({
      where: { nickname: nickname }
    });

    return NextResponse.json({
      exists: !!existingUser,
      message: existingUser 
        ? 'Este nickname já está em uso no T513' 
        : 'Nickname disponível no T513'
    });

  } catch (error) {
    console.error('Erro na API de verificação de nickname T513:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 