"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface QueueUser {
  id: string;
  nickname: string;
  cambiosEarned: number;
  nextCambioIn: number;
  avatarUrl: string;
}

interface DonationContextType {
  isLive: boolean;
  isQueuePaused: boolean;
  elapsedTime: string;
  queue: QueueUser[];
  currentCode: string | null;
  queueResults: any;
  startDonation: () => Promise<void>;
  endDonation: () => Promise<void>;
  generateCode: () => Promise<void>;
  addToQueue: (nickname: string) => Promise<void>;
  removeFromQueue: (nickname: string) => Promise<void>;
  redeemCode: (code: string) => Promise<void>;
  toggleQueuePause: () => Promise<void>;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [queue, setQueue] = useState<QueueUser[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [queueResults, setQueueResults] = useState(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Função para buscar o status da doação
  const fetchDonationStatus = async () => {
    try {
      const response = await fetch('/api/donations/status');
      const data = await response.json();

      setIsLive(data.isLive);
      setIsQueuePaused(data.isQueuePaused);
      setQueue(data.queue.map((user: any) => ({
        ...user,
        nextCambioIn: user.nextCambioIn || 180 // 3 minutos por padrão
      })));
      setCurrentCode(data.currentCode);
      setQueueResults(data.results);
      
      if (data.startTime) {
        setStartTime(new Date(data.startTime));
      }
    } catch (error) {
      console.error('Erro ao buscar status da doação:', error);
    }
  };

  // Atualiza o tempo decorrido
  useEffect(() => {
    if (!isLive || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, startTime]);

  // Atualiza os câmbios e timers dos usuários na fila
  useEffect(() => {
    if (!isLive || isQueuePaused) return;

    const interval = setInterval(() => {
      setQueue(prevQueue => 
        prevQueue.map(user => ({
          ...user,
          nextCambioIn: Math.max(0, user.nextCambioIn - 1),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, isQueuePaused]);

  // Verifica e atualiza câmbios a cada segundo
  useEffect(() => {
    if (!isLive || isQueuePaused) return;

    const interval = setInterval(() => {
      setQueue(prevQueue => 
        prevQueue.map(user => {
          if (user.nextCambioIn === 0) {
            return {
              ...user,
              cambiosEarned: user.cambiosEarned + 1,
              nextCambioIn: 180 // Reseta para 3 minutos
            };
          }
          return user;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, isQueuePaused]);

  // Busca o status a cada 3 segundos
  useEffect(() => {
    fetchDonationStatus();
    const interval = setInterval(fetchDonationStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const startDonation = async () => {
    try {
      const response = await fetch('/api/donations/start', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao iniciar doação');
      }
      
      await fetchDonationStatus();
    } catch (error) {
      console.error('Erro ao iniciar doação:', error);
    }
  };

  const endDonation = async () => {
    try {
      const response = await fetch('/api/donations/end', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao encerrar doação');
      }
      
      await fetchDonationStatus();
    } catch (error) {
      console.error('Erro ao encerrar doação:', error);
    }
  };

  const generateCode = async () => {
    try {
      const response = await fetch('/api/donations/code', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao gerar código');
      }
      
      const data = await response.json();
      setCurrentCode(data.code);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
    }
  };

  const addToQueue = async (nickname: string) => {
    try {
      const response = await fetch('/api/donations/queue/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar usuário à fila');
      }
      
      await fetchDonationStatus();
    } catch (error) {
      console.error('Erro ao adicionar usuário à fila:', error);
    }
  };

  const removeFromQueue = async (nickname: string) => {
    try {
      const response = await fetch('/api/donations/queue/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao remover usuário da fila');
      }
      
      await fetchDonationStatus();
    } catch (error) {
      console.error('Erro ao remover usuário da fila:', error);
    }
  };

  const redeemCode = async (code: string) => {
    try {
      const response = await fetch('/api/donations/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao resgatar código');
      }
      
      await fetchDonationStatus();
    } catch (error) {
      console.error('Erro ao resgatar código:', error);
    }
  };

  const toggleQueuePause = async () => {
    try {
      const response = await fetch('/api/donations/queue/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPaused: !isQueuePaused }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao pausar/retomar fila');
      }
      
      setIsQueuePaused(!isQueuePaused);
      await fetchDonationStatus();
    } catch (error) {
      console.error('Erro ao pausar/retomar fila:', error);
    }
  };

  return (
    <DonationContext.Provider
      value={{
        isLive,
        isQueuePaused,
        elapsedTime,
        queue,
        currentCode,
        queueResults,
        startDonation,
        endDonation,
        generateCode,
        addToQueue,
        removeFromQueue,
        redeemCode,
        toggleQueuePause
      }}
    >
      {children}
    </DonationContext.Provider>
  );
}

export function useDonation() {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
}