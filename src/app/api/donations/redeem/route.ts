import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { error: 'Código não fornecido' },
        { status: 400 }
      );
    }

    // Buscar doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { isActive: true }
    });

    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Não há doação em andamento' },
        { status: 400 }
      );
    }

    // Verificar se existe um código ativo
    if (!activeDonation.currentCode) {
      return NextResponse.json(
        { error: 'Não há código ativo no momento' },
        { status: 400 }
      );
    }

    // Verificar se o código está correto (case insensitive)
    if (activeDonation.currentCode.toUpperCase() !== code.toUpperCase()) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      );
    }

    // Atualizar câmbios ganhos e participações em uma transação
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          donationParticipations: {
            increment: 1
          }
        }
      }),
      prisma.donation.update({
        where: { id: activeDonation.id },
        data: { currentCode: null }
      })
    ]);

    return NextResponse.json({
      message: 'Código resgatado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao resgatar código:', error);
    return NextResponse.json(
      { error: 'Erro ao resgatar código' },
      { status: 500 }
    );
  }
} 