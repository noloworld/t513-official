import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const user = await getCurrentUser(request);
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

    return NextResponse.json({
      user: {
        id: dbUser.id,
        nickname: dbUser.nickname,
        email: dbUser.email,
        level: dbUser.level,
        points: dbUser.points,
        role: dbUser.role as "user" | "helper" | "moderator" | "admin",
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