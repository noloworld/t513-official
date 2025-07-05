import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  // Extrair o id da URL
  const url = new URL(request.url);
  const id = url.pathname.split('/').reverse()[1];
  await prisma.redemptionRequest.update({ where: { id }, data: { status: 'aprovado' } });
  return NextResponse.json({ message: 'Pedido de resgate aprovado' });
} 