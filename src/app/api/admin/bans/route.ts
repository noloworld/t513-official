import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado e é admin
    const currentUser = await getCurrentUser(request);
    if (!currentUser || !['admin', 'moderator'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Busca todos os banimentos com informações relacionadas
    const bans = await prisma.userBan.findMany({
      include: {
        user: {
          select: {
            nickname: true,
            email: true,
            createdAt: true,
            bannedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ bans });

  } catch (error) {
    console.error('Erro ao buscar banimentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar banimentos' },
      { status: 500 }
    );
  }
}

// Rota para desbanir usuário (apenas admin)
export async function POST(request: NextRequest) {
  try {
    // Verifica se é admin
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem desbanir usuários' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    // Reativa a conta
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        bannedAt: null
      }
    });

    // Remove os registros de banimento
    await prisma.userBan.deleteMany({
      where: {
        OR: [
          { userId },
          { relatedBans: { has: userId } }
        ]
      }
    });

    return NextResponse.json({
      message: 'Usuário desbanido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desbanir usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao desbanir usuário' },
      { status: 500 }
    );
  }
}