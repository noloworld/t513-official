"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface QueueUser {
  id: string;
  nickname: string;
  avatarUrl: string;
  joinedAt: string;
  cambiosEarned: number;
  nextCambioIn: number; // segundos restantes para o próximo câmbio
}

interface QueueResults {
  totalTime: string;
  participants: {
    nickname: string;
    avatarUrl: string;
    cambiosEarned: number;
    position: number;
  }[];
}

interface DonationContextType {
  isLive: boolean;
  startTime: Date | null;
  elapsedTime: string;
  queue: QueueUser[];
  currentCode: string | null;
  isInQueue: boolean;
  queueResults: QueueResults | null;
  isQueueStopped: boolean;
  // Funções para usuários normais
  joinQueue: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  redeemCode: (code: string) => Promise<void>;
  // Funções para admins
  startDonation: () => Promise<void>;
  endDonation: () => Promise<void>;
  generateCode: () => Promise<string>;
  stopQueue: () => Promise<void>;
}

const DonationContext = createContext<DonationContextType | null>(null);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [queue, setQueue] = useState<QueueUser[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueResults, setQueueResults] = useState<QueueResults | null>(null);
  const [isQueueStopped, setIsQueueStopped] = useState(false);

  // Carregar estado inicial
  useEffect(() => {
    const fetchDonationStatus = async () => {
      try {
        const response = await fetch('/api/donations/status');
        if (response.ok) {
          const data = await response.json();
          setIsLive(data.isLive);
          setStartTime(data.startTime ? new Date(data.startTime) : null);
          setQueue(data.queue || []);
          setCurrentCode(data.currentCode);
          setIsQueueStopped(data.isQueueStopped || false);
          setIsInQueue(data.queue?.some((entry: any) => entry.id === user?.id) || false);
          if (data.queueResults) {
            setQueueResults({
              totalTime: data.queueResults.totalTime,
              participants: data.queueResults.participants
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar status da doação:', error);
      }
    };

    fetchDonationStatus();
    const interval = setInterval(fetchDonationStatus, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, [user?.id]);

  // Timer para atualizar o tempo decorrido
  useEffect(() => {
    if (!isLive || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, startTime]);

  // Timer para atualizar os câmbios dos usuários na fila
  useEffect(() => {
    if (!isLive || queue.length === 0 || isQueueStopped) return;

    const interval = setInterval(() => {
      setQueue(currentQueue =>
        currentQueue.map(user => {
          const joinedAt = new Date(user.joinedAt);
          const timeInQueue = new Date().getTime() - joinedAt.getTime();
          const cambiosEarned = Math.floor(timeInQueue / (3 * 60 * 1000)); // 3 minutos
          const nextCambioIn = 180 - (Math.floor(timeInQueue / 1000) % 180); // 180 segundos = 3 minutos

          return {
            ...user,
            cambiosEarned,
            nextCambioIn
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, queue.length, isQueueStopped]);

  // Funções para usuários normais
  const joinQueue = async () => {
    try {
      const response = await fetch('/api/donations/queue/join', { method: 'POST' });
      if (response.ok) {
        setIsInQueue(true);
      }
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
    }
  };

  const leaveQueue = async () => {
    try {
      const response = await fetch('/api/donations/queue/leave', { method: 'POST' });
      if (response.ok) {
        setIsInQueue(false);
      }
    } catch (error) {
      console.error('Erro ao sair da fila:', error);
    }
  };

  const redeemCode = async (code: string) => {
    try {
      const response = await fetch('/api/donations/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Código inválido');
      }

      // Atualizar o estado após resgate bem sucedido
      setCurrentCode(null);
      
      // Atualizar a fila para refletir os novos câmbios
      const statusResponse = await fetch('/api/donations/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setQueue(statusData.queue || []);
      }

      alert('Código resgatado com sucesso!');
    } catch (error) {
      console.error('Erro ao resgatar código:', error);
      alert(error instanceof Error ? error.message : 'Erro ao resgatar código');
    }
  };

  // Funções para admins
  const startDonation = async () => {
    try {
      const response = await fetch('/api/donations/start', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setIsLive(true);
        setStartTime(new Date(data.startTime));
        setIsQueueStopped(false);
        setQueueResults(null);
      }
    } catch (error) {
      console.error('Erro ao iniciar doação:', error);
    }
  };

  const endDonation = async () => {
    try {
      const response = await fetch('/api/donations/end', { method: 'POST' });
      if (response.ok) {
        setIsLive(false);
        setStartTime(null);
        setQueue([]);
        setCurrentCode(null);
        setQueueResults(null);
        setIsQueueStopped(false);
      }
    } catch (error) {
      console.error('Erro ao encerrar doação:', error);
    }
  };

  const generateCode = async () => {
    try {
      const response = await fetch('/api/donations/code', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setCurrentCode(data.code);
        return data.code;
      }
      return '';
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      return '';
    }
  };

  const stopQueue = async () => {
    try {
      const response = await fetch('/api/donations/queue/stop', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setIsQueueStopped(true);
        setQueueResults({
          totalTime: elapsedTime,
          participants: data.results.map((result: any) => ({
            nickname: result.nickname,
            avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${result.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
            cambiosEarned: result.cambiosEarned,
            position: result.position
          }))
        });
        setQueue([]);
        // Forçar atualização do status imediatamente
        const statusResponse = await fetch('/api/donations/status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setIsQueueStopped(statusData.isQueueStopped || false);
        }
      }
    } catch (error) {
      console.error('Erro ao parar fila:', error);
    }
  };

  return (
    <DonationContext.Provider
      value={{
        isLive,
        startTime,
        elapsedTime,
        queue,
        currentCode,
        isInQueue,
        queueResults,
        isQueueStopped,
        joinQueue,
        leaveQueue,
        redeemCode,
        startDonation,
        endDonation,
        generateCode,
        stopQueue
      }}
    >
      {children}
    </DonationContext.Provider>
  );
}

export function useDonation() {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error("useDonation must be used within a DonationProvider");
  }
  return context;
} 