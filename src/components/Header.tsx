"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import RedeemPointsModal from "./RedeemPointsModal";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [showRedeem, setShowRedeem] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSubject, setHelpSubject] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpMessage, setHelpMessage] = useState<string|null>(null);

  const handleSendHelp = async () => {
    setHelpLoading(true);
    setHelpMessage(null);
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: helpSubject, description: helpDescription })
      });
      if (res.ok) {
        setHelpMessage('Pedido de ajuda enviado com sucesso!');
        setHelpSubject("");
        setHelpDescription("");
        setTimeout(() => {
          setShowHelpModal(false);
          setHelpMessage(null);
        }, 1200);
      } else {
        const data = await res.json();
        setHelpMessage(data.error || 'Erro ao enviar pedido de ajuda.');
      }
    } catch (e) {
      setHelpMessage('Erro ao enviar pedido de ajuda.');
    } finally {
      setHelpLoading(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#1e2875] to-[#4424a1] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">#T513</span>
            </div>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Nome do usuário */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                  <span>Olá, {user.nickname}</span>
                </div>

                {/* Card de Pontos */}
                <div className="flex flex-col items-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg px-3 py-1 min-w-[80px] border border-yellow-500/20">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-yellow-300">{user.points}</span>
                    <span className="text-xs text-yellow-300/80">pontos</span>
                  </div>
                  <button 
                    onClick={() => setShowRedeem(true)}
                    className="text-[10px] text-yellow-300/70 hover:text-yellow-300 transition-colors"
                  >
                    Resgatar
                  </button>
                </div>

                {/* Botão de Sair */}
                <button 
                  onClick={logout}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                >
                  Sair
                </button>
                {showRedeem && (
                  <RedeemPointsModal 
                    userPoints={user.points} 
                    onClose={() => setShowRedeem(false)} 
                    onSuccess={() => setShowRedeem(false)}
                  />
                )}
                {user && (
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow"
                    onClick={() => setShowHelpModal(true)}
                  >
                    Ajuda
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-full transition-colors"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Modal de Ajuda */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowHelpModal(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Pedido de Ajuda</h2>
            <label className="block mb-2 font-semibold text-gray-700">Assunto</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={helpSubject}
              onChange={e => setHelpSubject(e.target.value)}
              placeholder="Digite o assunto"
              disabled={helpLoading}
            />
            <label className="block mb-2 font-semibold text-gray-700">Descrição</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={helpDescription}
              onChange={e => setHelpDescription(e.target.value)}
              placeholder="Descreva seu pedido de ajuda"
              rows={4}
              disabled={helpLoading}
            />
            {helpMessage && (
              <div className={`mb-2 text-center ${helpMessage.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{helpMessage}</div>
            )}
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg mt-2 disabled:opacity-60"
              onClick={handleSendHelp}
              disabled={!helpSubject || !helpDescription || helpLoading}
            >
              {helpLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
} 