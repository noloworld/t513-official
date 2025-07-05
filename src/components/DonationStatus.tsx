"use client";

import { useState } from 'react';
import { useDonation } from '@/contexts/DonationContext';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function DonationStatus() {
  const { user, checkAuth } = useAuth();
  const {
    isLive,
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
  } = useDonation();

  const [codeInput, setCodeInput] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const isAdmin = user?.role === 'admin';
  const userInQueue = queue.find(u => u.id === user?.id);

  const handleRedeemCode = async () => {
    await redeemCode(codeInput);
    setCodeInput("");
    setShowCodeInput(false);
    if (typeof checkAuth === 'function') {
      await checkAuth();
    }
  };

  return (
    <div className="bg-[#1B2141]/80 rounded-2xl p-4">
      {/* Linha 1: Status à esquerda, doações participadas à direita */}
      <div className="w-full flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className={`text-sm ${isLive ? 'text-green-400' : 'text-gray-400'}`}>{isLive ? '🔴 AO VIVO' : '⚫ OFFLINE'}</span>
        </div>
        {user && !isAdmin && (
          <div className="flex flex-col items-center bg-[#232a4d]/80 rounded-xl shadow-lg px-5 py-2 border border-blue-800 min-w-[110px]">
            <span className="text-xs text-gray-300">Doações participadas</span>
            <span className="text-2xl font-bold text-yellow-400 text-center">{user.donationParticipations || 0}</span>
          </div>
        )}
      </div>
      {/* Linha 2: Título centralizado */}
      <div className="w-full flex justify-center mb-1">
        <span className="text-white text-xl font-semibold tracking-wide">
          {isLive ? 'DOAÇÕES DECORRENDO' : queueResults ? 'RESULTADOS DA DOAÇÃO' : 'SISTEMA DE DOAÇÕES'}
        </span>
      </div>
      {/* Linha 3: Status/descrição centralizado */}
      <div className="w-full flex justify-center mb-3">
        <span className="text-gray-400 text-sm text-center">
          {!user ? (
            'ℹ️ Faça login para participar das doações'
          ) : isAdmin ? (
            ''
          ) : isLive && !isQueueStopped ? (
            ''
          ) : (
            isQueueStopped ? 'ℹ️ Aguarde o encerramento da doação' : 'ℹ️ Aguarde o início da próxima doação'
          )}
        </span>
      </div>

      {/* Bloco de ações (apenas botões) */}
      {user && isAdmin && (
        <div className="flex items-center gap-3">
          {!isLive ? (
            <button
              onClick={startDonation}
              className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Começar Doação
            </button>
          ) : (
            <>
              {!isQueueStopped ? (
                <button
                  onClick={stopQueue}
                  className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Parar Fila
                </button>
              ) : (
                <button
                  onClick={endDonation}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Encerrar Doação
                </button>
              )}
              <button
                onClick={generateCode}
                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Gerar Código
              </button>
              {currentCode && (
                <div className="px-4 py-1.5 bg-white/10 rounded-lg text-white">
                  Código: {currentCode}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {user && !isAdmin && isLive && !isQueueStopped && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {!isInQueue ? (
              <button
                onClick={joinQueue}
                className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Entrar na Fila
              </button>
            ) : (
              <button
                onClick={leaveQueue}
                className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair da Fila
              </button>
            )}
            <button
              onClick={() => setShowCodeInput(!showCodeInput)}
              className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Resgatar Código
            </button>
          </div>

          {showCodeInput && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="Digite o código"
                className="px-3 py-1.5 bg-white/10 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
              <button
                onClick={handleRedeemCode}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                ✓
              </button>
            </div>
          )}
        </div>
      )}

      {/* Participações do usuário */}
      {/* Fila de Usuários ou Resultados */}
      {isLive && queue.length > 0 && !isQueueStopped && (
        <div className="mt-6 w-full">
          <div className="text-gray-400 text-sm mb-2">Usuários na fila:</div>
          <div className="flex items-center gap-4 overflow-x-auto py-2">
            {queue.map((user) => (
              <div key={user.id} className="flex flex-col items-center gap-1 min-w-[100px]">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10">
                  <Image
                    src={user.avatarUrl}
                    alt={user.nickname}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-white text-sm">{user.nickname}</div>
                <div className="text-green-400 text-sm">{user.cambiosEarned}c</div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(180 - user.nextCambioIn) / 180 * 100}%` }}
                  />
                </div>
                <div className="text-gray-400 text-xs">
                  {Math.floor(user.nextCambioIn / 60)}:{(user.nextCambioIn % 60).toString().padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados da Doação */}
      {queueResults && (
        <div className="mt-6 w-full">
          <div className="text-gray-400 text-sm mb-2">Resultados da Doação:</div>
          <div className="bg-[#1B2141] rounded-lg p-4">
            <div className="text-white text-sm mb-4">
              Tempo Total: <span className="font-mono">{queueResults.totalTime}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queueResults.participants.map((participant) => (
                <div key={participant.nickname} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
                    <Image
                      src={participant.avatarUrl}
                      alt={participant.nickname}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-white text-sm">{participant.nickname}</div>
                    <div className="text-green-400 text-sm">{participant.cambiosEarned}c</div>
                  </div>
                  <div className="ml-auto">
                    <div className="text-yellow-400 text-lg font-bold">#{participant.position}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 