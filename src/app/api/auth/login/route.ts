import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Dados recebidos na rota de login:', body);

    const { nickname, password } = body;

    if (!nickname || !password) {
      console.log('Campos obrigatórios faltando:', { nickname: !!nickname, password: !!password });
      return NextResponse.json(
        { error: 'Nickname e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o usuário pelo nickname
    console.log('Buscando usuário com nickname:', nickname);
    const user = await prisma.user.findUnique({
      where: { nickname }
    });

    if (!user) {
      console.log('Usuário não encontrado');
      return NextResponse.json(
        { error: 'Nickname ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verifica se a senha está correta
    console.log('Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('Senha incorreta');
      return NextResponse.json(
        { error: 'Nickname ou senha incorretos' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      console.log('Conta não verificada');
      return NextResponse.json(
        { error: 'Conta não verificada. Por favor, verifique sua conta primeiro.' },
        { status: 403 }
      );
    }

    // Gera o token JWT
    console.log('Gerando token JWT...');
    const token = await createToken({
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      level: user.level,
      points: user.points,
      isVerified: user.isVerified,
      role: user.role || 'user'
    });

    // Cria a resposta
    console.log('Criando resposta...');
    const response = NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        level: user.level,
        points: user.points,
        role: user.role || 'user'
      }
    });

    // Define o cookie com o token JWT
    console.log('Definindo cookie...');
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    console.log('Login concluído com sucesso');
    return response;

  } catch (error) {
    console.error('Erro detalhado ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
} 