"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import RedeemPointsModal from "./RedeemPointsModal";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [showRedeem, setShowRedeem] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSubject, setHelpSubject] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpMessage, setHelpMessage] = useState<string|null>(null);
  
  // Estados para animações de pontos
  const [pointsAnimation, setPointsAnimation] = useState<'none' | 'deduct' | 'add'>('none');
  const [displayPoints, setDisplayPoints] = useState(0);
  const pointsRef = useRef<HTMLSpanElement>(null);
  const previousPointsRef = useRef(0);
  const [scrolled, setScrolled] = useState(false);

  // Atualizar pontos de exibição quando o usuário muda
  useEffect(() => {
    if (user) {
      setDisplayPoints(user.points);
      previousPointsRef.current = user.points;
    }
  }, [user]);

  // Listener para eventos de mudança de pontos
  useEffect(() => {
    const handlePointsChange = (event: CustomEvent) => {
      const { type, points } = event.detail;
      
      if (type === 'deduct') {
        setPointsAnimation('deduct');
        // Animar contagem decrescente
        const startPoints = displayPoints;
        const endPoints = points;
        const duration = 1000; // 1 segundo
        const steps = 20;
        const stepValue = (startPoints - endPoints) / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          const newPoints = Math.max(endPoints, startPoints - (stepValue * currentStep));
          setDisplayPoints(Math.round(newPoints));
          
          if (currentStep >= steps) {
            setDisplayPoints(endPoints);
            setPointsAnimation('none');
            clearInterval(interval);
          }
        }, stepDuration);
      } else if (type === 'add') {
        setPointsAnimation('add');
        // Animar contagem crescente
        const startPoints = displayPoints;
        const endPoints = points;
        const duration = 1000; // 1 segundo
        const steps = 20;
        const stepValue = (endPoints - startPoints) / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          const newPoints = Math.min(endPoints, startPoints + (stepValue * currentStep));
          setDisplayPoints(Math.round(newPoints));
          
          if (currentStep >= steps) {
            setDisplayPoints(endPoints);
            setPointsAnimation('none');
            clearInterval(interval);
          }
        }, stepDuration);
      }
    };

    window.addEventListener('pointsChanged' as any, handlePointsChange);
    
    return () => {
      window.removeEventListener('pointsChanged' as any, handlePointsChange);
    };
  }, [displayPoints]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`top-0 left-0 w-full z-50 fixed transition-all duration-300 ${scrolled ? 'backdrop-blur-md shadow-2xl bg-gradient-to-r from-[#1e2875]/90 to-[#4424a1]/90' : 'bg-gradient-to-r from-[#1e2875] to-[#4424a1]'} text-white`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 transition-all duration-300">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {loading ? (
                <div className="h-10 w-32 bg-gray-600 rounded animate-pulse"></div>
              ) : (
                <img 
                  src="/imagens/logo-oficial.png" 
                  alt="T513 Community" 
                  className="h-10 w-auto object-contain bg-transparent"
                  style={{ 
                    filter: 'brightness(1.2) contrast(1.5) saturate(1.1) drop-shadow(0 0 10px rgba(255,255,255,0.1))'
                  }}
                />
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {loading ? (
              <>
                {/* Skeleton para nome do usuário */}
                <div className="h-8 w-24 bg-gray-600 rounded-full animate-pulse"></div>
                {/* Skeleton para pontos */}
                <div className="h-12 w-20 bg-gray-600 rounded-lg animate-pulse"></div>
                {/* Skeleton para botão sair */}
                <div className="h-8 w-16 bg-gray-600 rounded-full animate-pulse"></div>
                {/* Skeleton para botão ajuda */}
                <div className="h-10 w-20 bg-gray-600 rounded-lg animate-pulse"></div>
              </>
            ) : user ? (
              <>
                {/* Nome do usuário */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                  <span>Olá, {user.nickname}</span>
                </div>

                {/* Card de Pontos com Animação */}
                <div className="flex flex-col items-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg px-3 py-1 min-w-[80px] border border-yellow-500/20">
                  <div className="flex items-center gap-1.5">
                    <span 
                      ref={pointsRef}
                      className={`text-sm font-bold text-yellow-300 transition-all duration-300 ${
                        pointsAnimation === 'deduct' 
                          ? 'scale-125 text-red-300 animate-pulse' 
                          : pointsAnimation === 'add' 
                            ? 'scale-125 text-green-300 animate-pulse' 
                            : ''
                      }`}
                    >
                      {displayPoints}
                    </span>
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
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