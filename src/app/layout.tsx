"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TaskProvider } from "@/contexts/TaskContext";
import { DonationProvider } from "@/contexts/DonationContext";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionSubject, setSuggestionSubject] = useState("");
  const [suggestionDescription, setSuggestionDescription] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState<string|null>(null);

  const handleSendSuggestion = async () => {
    setSuggestionLoading(true);
    setSuggestionMessage(null);
    try {
      const res = await fetch('/api/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: suggestionSubject, description: suggestionDescription })
      });
      if (res.ok) {
        setSuggestionMessage('Sugestão enviada com sucesso!');
        setSuggestionSubject("");
        setSuggestionDescription("");
        setTimeout(() => {
          setShowSuggestionModal(false);
          setSuggestionMessage(null);
        }, 1200);
      } else {
        const data = await res.json();
        setSuggestionMessage(data.error || 'Erro ao enviar sugestão.');
      }
    } catch (e) {
      setSuggestionMessage('Erro ao enviar sugestão.');
    } finally {
      setSuggestionLoading(false);
    }
  };

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <DonationProvider>
          <TaskProvider>
            {children}
            {/* Rodapé fixo com botão Sugestão */}
            {user && (
              <footer className="fixed bottom-4 right-4 z-50">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold shadow text-sm sm:text-base"
                  onClick={() => setShowSuggestionModal(true)}
                >
                  💡 Sugestão
                </button>
              </footer>
            )}
            {/* Modal de Sugestão */}
            {showSuggestionModal && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowSuggestionModal(false)}
              >
                <div 
                  className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowSuggestionModal(false)}
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-green-800">Enviar Sugestão</h2>
                  <label className="block mb-2 font-semibold text-gray-700">Assunto</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                    value={suggestionSubject}
                    onChange={e => setSuggestionSubject(e.target.value)}
                    placeholder="Digite o assunto"
                    disabled={suggestionLoading}
                  />
                  <label className="block mb-2 font-semibold text-gray-700">Descrição</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                    value={suggestionDescription}
                    onChange={e => setSuggestionDescription(e.target.value)}
                    placeholder="Descreva sua sugestão"
                    rows={4}
                    disabled={suggestionLoading}
                  />
                  {suggestionMessage && (
                    <div className={`mb-2 text-center ${suggestionMessage.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{suggestionMessage}</div>
                  )}
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-2 disabled:opacity-60"
                    onClick={handleSendSuggestion}
                    disabled={!suggestionSubject || !suggestionDescription || suggestionLoading}
                  >
                    {suggestionLoading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            )}
          </TaskProvider>
        </DonationProvider>
      </body>
    </html>
  );
}
