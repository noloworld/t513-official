import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createToken, setAuthCookie, verifyHabboMotto } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { nickname, verificationCode } = await request.json();

    if (!nickname || !verificationCode) {
      return NextResponse.json(
        { error: 'Nickname e código de verificação são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o usuário pelo nickname
    const user = await prisma.user.findUnique({
      where: { nickname }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: 'Usuário já está verificado' },
        { status: 400 }
      );
    }

    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Código de verificação inválido' },
        { status: 400 }
      );
    }

    // Verifica se o código está na missão do Habbo
    const isCodeInMotto = await verifyHabboMotto(nickname, verificationCode);
    
    if (!isCodeInMotto) {
      return NextResponse.json(
        { error: 'Por favor, coloque o código na sua missão do Habbo antes de verificar' },
        { status: 400 }
      );
    }

    // Atualiza o usuário como verificado
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null // Remove o código após verificação
      }
    });

    // Gera o token JWT
    const token = await createToken({
      id: updatedUser.id,
      nickname: updatedUser.nickname,
      email: updatedUser.email,
      level: updatedUser.level,
      points: updatedUser.points,
      isVerified: updatedUser.isVerified,
      role: (updatedUser.role || 'user') as 'admin' | 'user' | 'helper' | 'moderator'
    });

    // Define o cookie de autenticação
    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Conta verificada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao verificar conta:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar conta' },
      { status: 500 }
    );
  }
} 