import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function generateCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Gera um código único
    let code: string;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existingDonation = await prisma.donation.findFirst({
        where: { currentCode: code },
      });
      if (!existingDonation) {
        isUnique = true;
      }
    }

    // Buscar doação ativa
    const activeDonation = await prisma.donation.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!activeDonation) {
      return NextResponse.json(
        { error: 'Nenhuma doação ativa' },
        { status: 404 }
      );
    }

    // Atualiza a doação com o novo código
    await prisma.donation.update({
      where: { id: activeDonation.id },
      data: { currentCode: code },
    });

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar código' },
      { status: 500 }
    );
  }
}