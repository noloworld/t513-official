import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nickname: true,
        email: true,
        level: true,
        points: true,
        role: true,
        isActive: true,
        bannedAt: true,
        donationParticipations: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!dbUser.isActive || dbUser.bannedAt) {
      return NextResponse.json({ error: 'Conta banida' }, { status: 403 });
    }

    const role = dbUser.role as "user" | "helper" | "moderator" | "admin";

    return NextResponse.json({
      user: {
        id: dbUser.id,
        nickname: dbUser.nickname,
        email: dbUser.email,
        level: dbUser.level,
        points: dbUser.points,
        role: role,
        donationParticipations: dbUser.donationParticipations.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}