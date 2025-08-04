import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyHabboMotto, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nickname, code } = await request.json();

    // Verifica se os campos foram fornecidos
    if (!nickname || !code) {
      return NextResponse.json(
        { error: 'Nickname e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { nickname },
    });

    // Verifica se o usuário existe
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o usuário já está verificado
    if (user.isVerified) {
      return NextResponse.json(
        { error: 'Usuário já está verificado' },
        { status: 400 }
      );
    }

    // Verifica se o código está correto
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Código de verificação inválido' },
        { status: 400 }
      );
    }

    // Verifica o motto do Habbo
    const isMottoValid = await verifyHabboMotto(nickname, code);
    if (!isMottoValid) {
      return NextResponse.json(
        { error: 'Código não encontrado no motto do Habbo' },
        { status: 400 }
      );
    }

    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
      },
    });

    // Gera o token JWT
    const token = createToken({
      id: updatedUser.id,
      nickname: updatedUser.nickname,
      role: updatedUser.role,
    });

    // Define o cookie de autenticação
    setAuthCookie(token);

    // Retorna os dados do usuário
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        level: updatedUser.level,
        points: updatedUser.points,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar usuário' },
      { status: 500 }
    );
  }
}