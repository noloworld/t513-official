import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@prisma/client/runtime/library';
import { prisma } from './prisma';

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
        });

        if (user) {
          session.user = {
            id: user.id,
            nickname: user.nickname,
            role: user.role,
            level: user.level,
            points: user.points,
          };
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