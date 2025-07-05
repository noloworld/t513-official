"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nickname: string;
  email: string;
  level: number;
  points: number;
  role: "user" | "helper" | "moderator" | "admin";
  donationParticipations: number;
}

interface AuthError {
  message: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      console.log('[useAuth] Verificando autenticação...');
      const response = await fetch('/api/auth/me', { 
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[useAuth] Dados do usuário recebidos:', data.user);
        
        // Garantir que todos os campos necessários existem
        if (data.user && typeof data.user.points === 'number' && data.user.id) {
          setUser(data.user);
        } else {
          console.error('[useAuth] Dados do usuário inválidos:', data.user);
          setUser(null);
        }
      } else {
        console.log('[useAuth] Usuário não autenticado');
        setUser(null);
      }
    } catch (error) {
      console.error('[useAuth] Erro ao verificar autenticação:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar autenticação periodicamente
  useEffect(() => {
    const interval = setInterval(checkAuth, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const login = async (nickname: string, password: string) => {
    try {
      console.log('[useAuth] Iniciando login...', { nickname });
      setError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ nickname, password }),
        cache: 'no-store'
      });

      const data = await response.json();
      console.log('[useAuth] Resposta do login:', data);

      if (!response.ok) {
        throw new Error(data.error);
      }

      console.log('[useAuth] Login bem sucedido, atualizando estado...');
      if (data.user && typeof data.user.points === 'number' && data.user.id) {
        setUser(data.user);
      } else {
        console.error('[useAuth] Dados do usuário inválidos após login:', data.user);
      }
      
      // Redireciona para a página inicial
      router.push('/');
      
      return data;
    } catch (error) {
      console.error('[useAuth] Erro no login:', error);
      setError({ message: error instanceof Error ? error.message : 'Erro ao fazer login' });
      throw error;
    }
  };

  const register = async (nickname: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      setError({ message: error instanceof Error ? error.message : 'Erro ao registrar' });
      throw error;
    }
  };

  const verify = async (nickname: string, verificationCode: string) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      router.push('/auth/signin?message=Conta criada com sucesso');
      return data;
    } catch (error) {
      setError({ message: error instanceof Error ? error.message : 'Erro ao verificar conta' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[useAuth] Fazendo logout...');
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Força uma atualização da página para recarregar o estado
      window.location.reload();
    } catch (error) {
      console.error('[useAuth] Erro ao fazer logout:', error);
      setUser(null);
      window.location.reload();
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    verify,
    logout,
    checkAuth,
  };
} 