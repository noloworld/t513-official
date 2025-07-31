import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar token do usuário via cookies
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Obter dados do corpo da requisição
    const { points } = await request.json();
    
    if (!points || typeof points !== 'number' || points <= 0) {
      return NextResponse.json({ error: 'Quantidade de pontos inválida' }, { status: 400 });
    }

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se tem pontos suficientes
    if (currentUser.points < points) {
      return NextResponse.json({ error: 'Pontos insuficientes' }, { status: 400 });
    }

    // Deduzir pontos
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        points: {
          decrement: points
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${points} pontos deduzidos com sucesso`,
      user: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        points: updatedUser.points,
        level: updatedUser.level
      }
    });

  } catch (error) {
    console.error('Erro ao deduzir pontos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 