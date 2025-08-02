import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateVerificationCode, isValidEmail, isValidNickname, isValidPassword } from '@/lib/auth';
import { BADGES } from '@/lib/badges';
import { getDeviceInfo, getClientIP, detectMultipleAccounts } from '@/lib/security';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { nickname, email, password } = await request.json();

    // Validações
    if (!nickname || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (!isValidNickname(nickname)) {
      return NextResponse.json(
        { error: 'Nickname inválido' },
        { status: 400 }
      );
    }

    // Verifica se o email já está em uso
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      );
    }

    // Verifica se o nickname já está em uso
    const existingUserByNickname = await prisma.user.findUnique({
      where: { nickname }
    });

    if (existingUserByNickname) {
      return NextResponse.json(
        { error: 'Este nickname já está em uso no T513' },
        { status: 400 }
      );
    }

    // Verifica se o nickname existe no Habbo Hotel
    try {
      const habboUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(nickname)}&action=std&direction=2&head_direction=2&gesture=std&size=m`;
      const habboResponse = await fetch(habboUrl);
      
      if (!habboResponse.ok) {
        return NextResponse.json(
          { error: 'Este nickname não existe no Habbo Hotel. Verifique se está escrito corretamente.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Erro ao verificar nickname no Habbo:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar nickname no Habbo Hotel. Tente novamente.' },
        { status: 500 }
      );
    }

    // Gera o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gera o código de verificação
    const verificationCode = generateVerificationCode();

    // Coleta informações de segurança
    const ipAddress = getClientIP(request);
    const deviceInfo = getDeviceInfo(request);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPassword,
        verificationCode,
        level: 1,
        points: 0,
        isVerified: false,
        lastIpAddress: ipAddress,
        deviceInfo: deviceInfo.fingerprint,
        isActive: true
      }
    });

    // Verifica múltiplas contas
    const hasMultipleAccounts = await detectMultipleAccounts(
      user.id,
      ipAddress,
      deviceInfo
    );

    if (hasMultipleAccounts) {
      return NextResponse.json(
        { error: 'Múltiplas contas detectadas. Todas as contas foram banidas.' },
        { status: 403 }
      );
    }

    // Criar emblema de "Bem-vindo" automaticamente
    const welcomeBadge = BADGES.find(badge => badge.id === 'welcome');
    if (welcomeBadge) {
      // Verificar se o emblema já existe no banco
      let dbBadge = await prisma.badge.findUnique({
        where: { name: welcomeBadge.name }
      });

      if (!dbBadge) {
        // Criar emblema no banco se não existir
        dbBadge = await prisma.badge.create({
          data: {
            name: welcomeBadge.name,
            description: welcomeBadge.description,
            icon: welcomeBadge.icon,
            condition: welcomeBadge.condition,
            category: welcomeBadge.category
          }
        });
      }

      // Criar relação usuário-emblema
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: dbBadge.id
        }
      });
    }

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      verificationCode
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
} 