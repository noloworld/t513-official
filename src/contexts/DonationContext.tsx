"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface QueueUser {
  id: string;
  nickname: string;
  avatarUrl: string;
  joinedAt: string;
  cambiosEarned: number;
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
  queueResults: QueueResults | null;
  // Funções para admins
  startDonation: () => Promise<void>;
  endDonation: () => Promise<void>;
  generateCode: () => Promise<string>;
  addToQueue: (nickname: string) => Promise<void>;
  removeFromQueue: (nickname: string) => Promise<void>;
}

const DonationContext = createContext<DonationContextType | null>(null);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [queue, setQueue] = useState<QueueUser[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [queueResults, setQueueResults] = useState<QueueResults | null>(null);

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
  }, []);

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

  // Funções para admins
  const startDonation = async () => {
    try {
      const response = await fetch('/api/donations/start', { method: 'POST' });
      
      if (response.ok) {
        const data = await response.json();
        setIsLive(true);
        setStartTime(new Date(data.startTime));
        setQueueResults(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao iniciar doação');
      }
    } catch (error) {
      console.error('Erro ao iniciar doação:', error);
      alert('Erro ao iniciar doação. Tente novamente.');
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

  const addToQueue = async (nickname: string) => {
    try {
      const response = await fetch('/api/donations/queue/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });

      if (response.ok) {
        const data = await response.json();
        setQueue(currentQueue => [...currentQueue, {
          id: data.id,
          nickname: data.nickname,
          avatarUrl: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${data.nickname}&action=std&direction=2&head_direction=2&gesture=std&size=m`,
          joinedAt: new Date().toISOString(),
          cambiosEarned: 0
        }]);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao adicionar usuário à fila');
      }
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      alert('Erro ao adicionar usuário à fila. Tente novamente.');
    }
  };

  const removeFromQueue = async (nickname: string) => {
    try {
      const response = await fetch('/api/donations/queue/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });

      if (response.ok) {
        setQueue(currentQueue => currentQueue.filter(user => user.nickname !== nickname));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao remover usuário da fila');
      }
    } catch (error) {
      console.error('Erro ao remover da fila:', error);
      alert('Erro ao remover usuário da fila. Tente novamente.');
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
        queueResults,
        startDonation,
        endDonation,
        generateCode,
        addToQueue,
        removeFromQueue
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