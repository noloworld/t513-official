'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RadioContextType {
  isReady: boolean;
  hasPermission: boolean;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Aguarda o componente montar
    setIsReady(true);

    // Verifica permissões quando o usuário mudar
    if (user && user.role && ['admin', 'moderator'].includes(user.role)) {
      console.log('Usuário tem permissão para rádio:', user);
      setHasPermission(true);
    } else {
      console.log('Usuário não tem permissão para rádio:', user);
      setHasPermission(false);
    }
  }, [user]);

  return (
    <RadioContext.Provider value={{ isReady, hasPermission }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
}