import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    console.log('Token recebido:', request.cookies.get('auth_token')?.value);
    console.log('Usuário autenticado:', user);
    
    if (!user) {
      console.log('Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar usuário atualizado do banco
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    console.log('Usuário do banco:', dbUser);
    console.log('Role do usuário:', dbUser?.role);

    if (!dbUser || dbUser.role !== 'admin') {
      console.log('Usuário não é admin:', dbUser?.role);
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