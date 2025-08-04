import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const bans = await prisma.userBan.findMany({
      include: {
        user: {
          select: {
            nickname: true,
          },
        },
        relatedUsers: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bans);
  } catch (error) {
    console.error('Erro ao buscar banimentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { userId, reason, ipAddress, deviceInfo, relatedUserIds } = data;

    // Verifica se o usuário já está banido
    const existingBan = await prisma.userBan.findFirst({
      where: { userId },
    });

    if (existingBan) {
      return NextResponse.json({ error: 'Usuário já está banido' }, { status: 400 });
    }

    // Cria o banimento
    const ban = await prisma.userBan.create({
      data: {
        userId,
        reason,
        ipAddress,
        deviceInfo,
        relatedUsers: {
          connect: relatedUserIds.map((id: string) => ({ id })),
        },
      },
    });

    // Atualiza o status dos usuários banidos
    await prisma.user.updateMany({
      where: {
        id: {
          in: [userId, ...relatedUserIds],
        },
      },
      data: {
        isActive: false,
        bannedAt: new Date(),
      },
    });

    return NextResponse.json(ban);
  } catch (error) {
    console.error('Erro ao criar banimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}