import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidPassword, isValidNickname, generateVerificationCode } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nickname, email, password } = await request.json();

    // Verifica se os campos foram fornecidos
    if (!nickname || !password) {
      return NextResponse.json(
        { error: 'Nickname e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se o email é válido (se fornecido)
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verifica se o nickname é válido
    if (!isValidNickname(nickname)) {
      return NextResponse.json(
        { error: 'Nickname inválido' },
        { status: 400 }
      );
    }

    // Verifica se a senha é válida
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verifica se o nickname já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Nickname já está em uso' },
        { status: 400 }
      );
    }

    // Verifica se o email já está em uso (se fornecido)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        );
      }
    }

    // Gera o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gera o código de verificação
    const verificationCode = generateVerificationCode();

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPassword,
        verificationCode,
      },
    });

    // Emblema de boas-vindas
    const welcomeBadge = {
      name: 'Bem-vindo',
      description: 'Criou uma conta no T513',
      imageUrl: '/imagens/bem-vindo.png',
      requirement: 'Criar uma conta no T513',
    };

    // Cria o emblema se não existir
    const badge = await prisma.badge.upsert({
      where: { name: welcomeBadge.name },
      update: {},
      create: {
        name: welcomeBadge.name,
        description: welcomeBadge.description,
        imageUrl: welcomeBadge.imageUrl,
        requirement: welcomeBadge.requirement,
      },
    });

    // Atribui o emblema ao usuário
    await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: badge.id,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        verificationCode: user.verificationCode,
      },
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}