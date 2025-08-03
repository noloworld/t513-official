import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    console.log('Token do usuário:', request.cookies.get('auth_token')?.value);
    console.log('Usuário retornado:', user);

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar usuário atualizado do banco
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Garantir que o role seja um dos valores permitidos
    const validRoles = ['user', 'helper', 'moderator', 'admin'];
    const role = validRoles.includes(dbUser.role) ? dbUser.role : 'user';

    console.log('Dados do usuário do banco:', {
      id: dbUser.id,
      nickname: dbUser.nickname,
      role: role
    });

    return NextResponse.json({
      user: {
        id: dbUser.id,
        nickname: dbUser.nickname,
        email: dbUser.email,
        level: dbUser.level,
        points: dbUser.points,
        role: role as "user" | "helper" | "moderator" | "admin",
        donationParticipations: dbUser.donationParticipations || 0
      }
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao obter usuário' },
      { status: 500 }
    );
  }
}