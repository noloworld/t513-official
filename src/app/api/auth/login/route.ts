import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';
import { getDeviceInfo, getClientIP, isUserBanned, detectMultipleAccounts } from '@/lib/security';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { nickname, password } = await request.json();

    // Validações básicas
    if (!nickname || !password) {
      return NextResponse.json(
        { error: 'Nickname e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { nickname }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se a conta está banida
    const isBanned = await isUserBanned(user.id);
    if (isBanned) {
      return NextResponse.json(
        { error: 'Esta conta está banida por violação dos termos de uso.' },
        { status: 403 }
      );
    }

    // Verifica a senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Coleta informações de segurança
    const ipAddress = getClientIP(request);
    const deviceInfo = getDeviceInfo(request);

    // Atualiza informações do dispositivo
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastIpAddress: ipAddress,
        deviceInfo: deviceInfo.fingerprint
      }
    });

    // Verifica múltiplas contas
    const hasMultipleAccounts = await detectMultipleAccounts(
      user.id,
      ipAddress,
      deviceInfo
    );

    if (hasMultipleAccounts) {
      return NextResponse.json(
        { error: 'Múltiplas contas detectadas. Todas as contas foram banidas.' },
        { status: 403 }
      );
    }

    // Garantir que o role seja um dos valores permitidos
    const validRoles = ['user', 'helper', 'moderator', 'admin'];
    const role = validRoles.includes(user.role) ? user.role : 'user';

    console.log('Role do usuário:', role);

    // Gera o token JWT
    const token = await createToken({
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      level: user.level,
      points: user.points,
      isVerified: user.isVerified,
      role: role as "user" | "helper" | "moderator" | "admin"
    });

    // Configura o cookie
    const response = NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        level: user.level,
        points: user.points,
        isVerified: user.isVerified,
        role: role
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}