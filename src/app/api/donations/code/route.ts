import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Função para gerar um código aleatório de 6 caracteres
function generateCode() {
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

    // Verificar se já existe um código ativo
    if (activeDonation.currentCode) {
      return NextResponse.json(
        { error: 'Já existe um código ativo' },
        { status: 400 }
      );
    }

    // Gerar e salvar novo código
    const code = generateCode();
    const updatedDonation = await prisma.donation.update({
      where: { id: activeDonation.id },
      data: { currentCode: code }
    });

    if (!updatedDonation.currentCode) {
      throw new Error('Falha ao salvar o código');
    }

    return NextResponse.json({
      message: 'Código gerado com sucesso',
      code
    });
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar código' },
      { status: 500 }
    );
  }
} 