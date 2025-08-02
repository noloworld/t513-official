import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

// Armazena as conexões ativas
const listeners = new Map();
const broadcasters = new Map();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Configura SSE (Server-Sent Events) para streaming de áudio
    const stream = new ReadableStream({
      start(controller) {
        // Adiciona o ouvinte à lista
        listeners.set(user.id, controller);

        // Remove o ouvinte quando a conexão for fechada
        request.signal.addEventListener('abort', () => {
          listeners.delete(user.id);
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Erro no stream:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { audioChunk } = await request.json();

    // Envia o chunk de áudio para todos os ouvintes
    listeners.forEach((controller) => {
      controller.enqueue(
        new TextEncoder().encode(`data: ${audioChunk}\n\n`)
      );
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao transmitir:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}