import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Criar nova sugestão
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  const { subject, description } = await request.json();
  if (!subject || !description) {
    return NextResponse.json({ error: 'Assunto e descrição obrigatórios' }, { status: 400 });
  }
  const suggestion = await prisma.suggestion.create({
    data: {
      userId: user.id,
      subject,
      description,
    },
  });
  return NextResponse.json({ suggestion });
}

// Listar todas as sugestões (apenas admin/mod/ajudante)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || !['admin', 'moderator', 'helper'].includes(user.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const suggestions = await prisma.suggestion.findMany({
    where: { status: 'pendente' },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { nickname: true, email: true } } },
  });
  return NextResponse.json({ suggestions });
}

// Marcar como concluída (PATCH)
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || !['admin', 'moderator', 'helper'].includes(user.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
  }
  await prisma.suggestion.update({
    where: { id },
    data: { status: 'concluido' },
  });
  return NextResponse.json({ success: true });
} 