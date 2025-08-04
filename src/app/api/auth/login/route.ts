import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nickname, password } = await request.json();

    // Verifica se os campos foram fornecidos
    if (!nickname || !password) {
      return NextResponse.json(
        { error: 'Nickname e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o usuário pelo nickname
    const user = await prisma.user.findUnique({
      where: { nickname },
    });

    // Verifica se o usuário existe
    if (!user) {
      return NextResponse.json(
        { error: 'Nickname ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verifica se o usuário está banido
    if (!user.isActive || user.bannedAt) {
      return NextResponse.json(
        { error: 'Sua conta está banida' },
        { status: 403 }
      );
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Nickname ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verifica se o usuário está verificado
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Conta não verificada', verificationCode: user.verificationCode },
        { status: 403 }
      );
    }

    // Gera o token JWT
    const token = createToken({
      id: user.id,
      nickname: user.nickname,
      role: user.role,
    });

    // Define o cookie de autenticação
    setAuthCookie(token);

    // Retorna os dados do usuário
    return NextResponse.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        role: user.role,
        level: user.level,
        points: user.points,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}