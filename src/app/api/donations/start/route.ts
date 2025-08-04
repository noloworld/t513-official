import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verifica se já existe uma doação ativa
    const existingDonation = await prisma.donation.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (existingDonation) {
      return NextResponse.json(
        { error: 'Já existe uma doação ativa' },
        { status: 400 }
      );
    }

    // Cria uma nova doação
    const donation = await prisma.donation.create({
      data: {
        status: 'ACTIVE',
        startTime: new Date(),
      },
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Erro ao iniciar doação:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar doação' },
      { status: 500 }
    );
  }
}