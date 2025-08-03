"use client";

import { useState } from 'react';
import { useDonation } from '@/contexts/DonationContext';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function DonationStatus() {
  const { user } = useAuth();
  const {
    isLive,
    elapsedTime,
    queue,
    currentCode,
    queueResults,
    startDonation,
    endDonation,
    generateCode,
    addToQueue,
    removeFromQueue
  } = useDonation();

  const [nicknameInput, setNicknameInput] = useState("");
  const isAdmin = user?.role === 'admin';

  const handleAddToQueue = async () => {
    if (!nicknameInput.trim()) return;
    await addToQueue(nicknameInput);
    setNicknameInput("");
  };

  // Função para formatar o timer
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background com gradiente e efeito de brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-indigo-900/40 rounded-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl animate-pulse"></div>
      
      {/* Container principal */}
      <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
        
        {/* Header com status e título */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          {/* Status com animação */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'} shadow-lg`}></div>
              {isLive && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-ping opacity-75"></div>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold ${isLive ? 'text-green-400' : 'text-gray-400'} tracking-wide`}>
                {isLive ? '🔴 AO VIVO' : '⚫ OFFLINE'}
              </span>
              {isLive && (
                <span className="text-sm text-green-300 font-mono">{elapsedTime}</span>
              )}
            </div>
          </div>

          {/* Título principal centralizado */}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
              {isLive ? 'DOAÇÕES DECORRENDO' : queueResults ? 'RESULTADOS DA DOAÇÃO' : 'SISTEMA DE DOAÇÕES'}
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Controles para Administradores */}
        {user && isAdmin && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {!isLive ? (
              <button
                onClick={startDonation}
                className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg">▶️</span>
                  Começar Doação
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={endDonation}
                  className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">⏹️</span>
                    Encerrar Doação
                  </span>
                </button>
                <button
                  onClick={generateCode}
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">🎲</span>
                    Gerar Código
                  </span>
                </button>
                {currentCode && (
                  <div className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl text-white font-mono text-lg shadow-lg">
                    <div className="text-center">
                      <div className="text-xs text-purple-300 mb-1">Código Ativo</div>
                      <div className="text-2xl font-bold text-purple-400">{currentCode}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Input para adicionar usuário à fila (apenas admin) */}
        {isAdmin && isLive && (
          <div className="flex items-center gap-3 justify-center mb-6">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Digite o nickname"
              className="px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <button
              onClick={handleAddToQueue}
              disabled={!nicknameInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar à Fila
            </button>
          </div>
        )}

        {/* Fila de Usuários */}
        {isLive && queue.length > 0 && (
          <div className="mt-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">👥 Usuários na Fila</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {queue.map((user) => (
                <div key={user.id} className="flex flex-col items-center gap-2 group">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 p-0.5 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                        <Image
                          src={user.avatarUrl}
                          alt={user.nickname}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => removeFromQueue(user.nickname)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <span className="text-white text-xs">×</span>
                      </button>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-white text-sm font-semibold">{user.nickname}</div>
                    <div className="text-green-400 text-lg font-bold">{user.cambiosEarned}c</div>
                    {/* Timer para próximo câmbio */}
                    <div className="text-xs text-gray-400 font-mono">
                      Próximo em: {formatTimer(user.nextCambioIn)}
                    </div>
                    {/* Barra de progresso */}
                    <div className="w-full h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                        style={{ width: `${((180 - user.nextCambioIn) / 180) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultados da Doação */}
        {queueResults && (
          <div className="mt-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">🏆 Resultados da Doação</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full"></div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
                  <span className="text-yellow-400">⏱️</span>
                  <span className="text-white font-mono text-lg">Tempo Total: {queueResults.totalTime}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queueResults.participants.map((participant, index) => (
                  <div key={participant.nickname} className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 p-0.5">
                          <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                            <Image
                              src={participant.avatarUrl}
                              alt={participant.nickname}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{participant.nickname}</div>
                        <div className="text-green-400 font-bold text-lg">{participant.cambiosEarned}c</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 text-2xl font-bold">#{participant.position}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}