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

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Verificar se já existe uma doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { isActive: true }
    });

    if (activeDonation) {
      return NextResponse.json(
        { error: 'Já existe uma doação em andamento' },
        { status: 400 }
      );
    }

    // Criar nova doação
    const donation = await prisma.donation.create({
      data: {
        startTime: new Date(),
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Doação iniciada com sucesso',
      startTime: donation.startTime
    });
  } catch (error) {
    console.error('Erro ao iniciar doação:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar doação' },
      { status: 500 }
    );
  }
} 