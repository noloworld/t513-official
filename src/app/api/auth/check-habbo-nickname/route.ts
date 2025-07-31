import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { nickname } = await request.json();

    if (!nickname) {
      return NextResponse.json(
        { error: 'Nickname é obrigatório' },
        { status: 400 }
      );
    }

    // Verifica se o nickname existe no Habbo Hotel
    // Usando a API pública do Habbo para verificar se o usuário existe
    const habboUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(nickname)}&action=std&direction=2&head_direction=2&gesture=std&size=m`;

    try {
      const response = await fetch(habboUrl);
      
      // Se a resposta for 200, o usuário existe
      // Se for 404 ou outro erro, o usuário não existe
      if (response.ok) {
        return NextResponse.json({ 
          exists: true, 
          message: 'Nickname válido no Habbo Hotel' 
        });
      } else {
        return NextResponse.json({ 
          exists: false, 
          message: 'Nickname não encontrado no Habbo Hotel' 
        });
      }
    } catch (error) {
      console.error('Erro ao verificar nickname no Habbo:', error);
      return NextResponse.json({ 
        exists: false, 
        message: 'Erro ao verificar nickname no Habbo Hotel' 
      });
    }
  } catch (error) {
    console.error('Erro na API de verificação de nickname:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 