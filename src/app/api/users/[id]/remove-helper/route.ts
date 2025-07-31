import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Iniciando processo de remoção de ajudante...');
    
    const user = await getCurrentUser(request);
    console.log('Usuário atual:', user ? { id: user.id, role: user.role } : 'não autenticado');
    
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      console.log('Acesso negado - usuário não é admin nem moderador');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    console.log('ID do usuário para remover como ajudante:', id);

    if (!id) {
      console.log('ID não fornecido');
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Verificar se o usuário existe
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, nickname: true, role: true }
    });

    if (!targetUser) {
      console.log('Usuário não encontrado:', id);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('Usuário encontrado:', targetUser);

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({ 
      where: { id }, 
      data: { role: 'user' },
      select: { id: true, nickname: true, role: true }
    });

    console.log('Usuário rebaixado com sucesso:', updatedUser);
    
    return NextResponse.json({ 
      message: 'Usuário rebaixado para user com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao rebaixar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 