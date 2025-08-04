"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DonationProvider } from "@/contexts/DonationContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import SEOHead from "@/components/SEOHead";

const inter = Inter({ subsets: ["latin"] });

function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSubject, setHelpSubject] = useState("");
  const [helpMessage, setHelpMessage] = useState("");

  const handleSendHelp = async () => {
    if (!helpSubject.trim() || !helpMessage.trim()) return;

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: helpSubject,
          message: helpMessage,
        }),
      });

      if (response.ok) {
        setShowHelpModal(false);
        setHelpSubject("");
        setHelpMessage("");
        alert("Pedido de ajuda enviado com sucesso!");
      } else {
        alert("Erro ao enviar pedido de ajuda. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar pedido de ajuda:", error);
      alert("Erro ao enviar pedido de ajuda. Tente novamente.");
    }
  };

  return (
    <html lang="pt-BR">
      <head>
        <SEOHead />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DonationProvider>
            <TaskProvider>
              {children}

              {/* Modal de Ajuda */}
              {showHelpModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Precisa de Ajuda?</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Assunto
                        </label>
                        <input
                          type="text"
                          value={helpSubject}
                          onChange={(e) => setHelpSubject(e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite o assunto"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Mensagem
                        </label>
                        <textarea
                          value={helpMessage}
                          onChange={(e) => setHelpMessage(e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                          placeholder="Descreva sua dúvida ou problema"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSendHelp}
                          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          Enviar
                        </button>
                        <button
                          onClick={() => setShowHelpModal(false)}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Ajuda */}
              {user && (
                <footer className="fixed bottom-4 right-4 z-50">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold shadow text-sm sm:text-base"
                    onClick={() => setShowHelpModal(true)}
                  >
                    ❓ Ajuda
                  </button>
                </footer>
              )}
            </TaskProvider>
          </DonationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;