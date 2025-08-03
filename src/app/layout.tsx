"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TaskProvider } from "@/contexts/TaskContext";
import { DonationProvider } from "@/contexts/DonationContext";
import { RadioProvider } from "@/contexts/RadioContext";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import dynamic from 'next/dynamic';
import SEOHead from '@/components/SEOHead';

// Carrega os componentes de áudio dinamicamente para evitar problemas de SSR
const RadioPlayer = dynamic(() => import('@/components/RadioPlayer'), {
  ssr: false
});

const RadioBroadcast = dynamic(() => import('@/components/RadioBroadcast'), {
  ssr: false
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
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
    <html lang="pt-BR">
      <SEOHead />
      <body className={inter.className}>
        <DonationProvider>
          <TaskProvider>
            <RadioProvider>
              {children}
            {/* Player da Rádio */}
            {user && (
              <>
                <RadioPlayer defaultVolume={0.3} />
                <RadioBroadcast />
              </>
            )}
            {/* Rodapé fixo com botão Ajuda */}
            {user && (
              <footer className="fixed bottom-4 right-4 z-50">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold shadow text-sm sm:text-base"
                  onClick={() => setShowHelpModal(true)}
                >
                  🆘 Ajuda
                </button>
              </footer>
            )}
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
                  <h2 className="text-2xl font-bold mb-4 text-yellow-800">Pedido de Ajuda</h2>
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
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg mt-2 disabled:opacity-60"
                    onClick={handleSendHelp}
                    disabled={!helpSubject || !helpDescription || helpLoading}
                  >
                    {helpLoading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            )}
            </RadioProvider>
          </TaskProvider>
        </DonationProvider>
      </body>
    </html>
  );
}
