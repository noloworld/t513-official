import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Interface para informações do dispositivo
interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  fingerprint: string;
}

// Função para extrair informações do dispositivo
export function getDeviceInfo(request: NextRequest): DeviceInfo {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const screenResolution = request.headers.get('sec-ch-viewport-width') || '';
  
  // Cria um fingerprint único baseado em várias características
  const fingerprint = Buffer.from(
    userAgent + acceptLanguage + screenResolution + request.ip
  ).toString('base64');

  return {
    browser: getBrowserInfo(userAgent),
    os: getOSInfo(userAgent),
    device: getDeviceType(userAgent),
    fingerprint
  };
}

// Função para obter IP real do usuário
export function getClientIP(request: NextRequest): string {
  return request.ip || 
         request.headers.get('x-real-ip') || 
         request.headers.get('x-forwarded-for')?.split(',')[0] || 
         'unknown';
}

// Função principal para detectar múltiplas contas
export async function detectMultipleAccounts(
  userId: string,
  ipAddress: string,
  deviceInfo: DeviceInfo
): Promise<boolean> {
  // Busca outras contas com o mesmo IP ou fingerprint
  const relatedAccounts = await prisma.user.findMany({
    where: {
      OR: [
        { lastIpAddress: ipAddress },
        { deviceInfo: deviceInfo.fingerprint }
      ],
      AND: [
        { id: { not: userId } },
        { isActive: true }
      ]
    },
    select: {
      id: true,
      nickname: true,
      createdAt: true
    }
  });

  // Se encontrar contas relacionadas, bane todas
  if (relatedAccounts.length > 0) {
    const allUserIds = [userId, ...relatedAccounts.map(a => a.id)];
    await banRelatedAccounts(allUserIds, ipAddress, deviceInfo, 'Múltiplas contas detectadas');
    return true;
  }

  return false;
}

// Função para banir contas relacionadas
export async function banRelatedAccounts(
  userIds: string[],
  ipAddress: string,
  deviceInfo: DeviceInfo,
  reason: string
): Promise<void> {
  // Cria registros de banimento para todas as contas
  await Promise.all(userIds.map(userId => 
    prisma.userBan.create({
      data: {
        userId,
        reason,
        ipAddress,
        deviceInfo: JSON.stringify(deviceInfo),
        relatedBans: userIds.filter(id => id !== userId)
      }
    })
  ));

  // Desativa todas as contas
  await prisma.user.updateMany({
    where: {
      id: { in: userIds }
    },
    data: {
      isActive: false,
      bannedAt: new Date()
    }
  });

  // Log para auditoria
  console.log(`[SECURITY] Banned accounts: ${userIds.join(', ')} | Reason: ${reason}`);
}

// Função para verificar se uma conta está banida
export async function isUserBanned(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, bannedAt: true }
  });

  return !user?.isActive || !!user?.bannedAt;
}

// Funções auxiliares para extrair informações do User-Agent
function getBrowserInfo(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOSInfo(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function getDeviceType(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}