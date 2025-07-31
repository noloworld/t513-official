import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface UserData {
  id: string;
  nickname: string;
  email: string;
  level: number;
  points: number;
  verificationCode?: string;
  isVerified: boolean;
  role: "user" | "helper" | "moderator" | "admin";
}

// Função para gerar código de verificação
export function generateVerificationCode(): string {
  return `AtivarConta-T513-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
}

// Função para criar token JWT
export async function createToken(user: UserData): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(JWT_SECRET));
  
  return token;
}

// Função para verificar token JWT
export async function verifyToken(token: string): Promise<UserData | null> {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return verified.payload as unknown as UserData;
  } catch (error) {
    return null;
  }
}

// Função para definir cookie de autenticação
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 horas
  });
}

// Função para remover cookie de autenticação
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// Função para obter usuário atual
export async function getCurrentUser(request?: NextRequest): Promise<UserData | null> {
  const token = request 
    ? request.cookies.get('auth_token')?.value
    : (await cookies()).get('auth_token')?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar senha
export function isValidPassword(password: string): boolean {
  return password.length >= 6; // Mínimo de 6 caracteres
}

// Função para validar nickname
export function isValidNickname(nickname: string): boolean {
  // Validação mais permissiva - aceita caracteres especiais comuns do Habbo
  // A validação real é feita pela API do Habbo Hotel
  return nickname.length >= 3 && nickname.length <= 20 && /^[a-zA-Z0-9._\-=@\[\]:!?+*#]+$/.test(nickname);
} 

// Função para verificar a missão do Habbo
export async function verifyHabboMotto(nickname: string, verificationCode: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${nickname}`);
    const data = await response.json();
    
    // Verifica se o usuário existe e se o código está na missão
    if (data?.motto) {
      return data.motto.includes(verificationCode);
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar missão do Habbo:', error);
    return false;
  }
} 