import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const targetId = params.id;
  await prisma.user.update({ where: { id: targetId }, data: { role: 'user' } });
  return NextResponse.json({ message: 'Usuário rebaixado para user' });
} 