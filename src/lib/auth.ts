import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@prisma/client/runtime/library';
import { prisma } from './prisma';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verify, sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Função para verificar se um email é válido
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para verificar se uma senha é válida
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// Função para verificar se um nickname é válido
export function isValidNickname(nickname: string): boolean {
  const nicknameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return nicknameRegex.test(nickname);
}

// Função para gerar código de verificação
export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Função para verificar o motto do Habbo
export async function verifyHabboMotto(nickname: string, code: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${nickname}`);
    const data = await response.json();
    return data.motto === code;
  } catch (error) {
    console.error('Erro ao verificar motto do Habbo:', error);
    return false;
  }
}

// Função para criar token JWT
export function createToken(userId: string): string {
  return sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Função para verificar token JWT
export function verifyToken(token: string): { sub: string } | null {
  try {
    return verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

// Função para definir cookie de autenticação
export function setAuthCookie(token: string): void {
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
    path: '/',
  });
}

// Função para remover cookie de autenticação
export function removeAuthCookie(): void {
  cookies().delete('auth_token');
}

// Função para obter usuário atual
export async function getCurrentUser(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        nickname: true,
        role: true,
        level: true,
        points: true,
        isActive: true,
        bannedAt: true,
      },
    });

    if (!user || !user.isActive || user.bannedAt) return null;

    return user;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
}

// Configurações do NextAuth
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            nickname: true,
            role: true,
            level: true,
            points: true,
            isActive: true,
            bannedAt: true,
          },
        });

        if (user && user.isActive && !user.bannedAt) {
          session.user = user;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};