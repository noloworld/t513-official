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
  const [showHelpForm, setShowHelpForm] = useState(false);
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
        setShowHelpForm(false);
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

  const closeAllModals = () => {
    setShowHelpModal(false);
    setShowHelpForm(false);
    setHelpSubject("");
    setHelpMessage("");
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
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-white/10 shadow-xl">
                    {!showHelpForm ? (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Como Funciona o T513?
                          </h2>
                          <button
                            onClick={closeAllModals}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-6 text-gray-300">
                          {/* Seção: Sistema de Doações */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              <span className="text-green-400">💰</span> Sistema de Doações
                            </h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                              <li>Administradores podem iniciar uma sessão de doações</li>
                              <li>Usuários são adicionados à fila por administradores</li>
                              <li>Cada usuário na fila recebe câmbios a cada 3 minutos</li>
                              <li>Administradores podem gerar códigos para resgatar câmbios extras</li>
                              <li>A fila pode ser pausada temporariamente quando necessário</li>
                            </ul>
                          </div>

                          {/* Seção: Tarefas Diárias */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              <span className="text-yellow-400">✨</span> Tarefas Diárias
                            </h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                              <li>Complete tarefas diárias para ganhar pontos</li>
                              <li>Responda perguntas sobre o Habbo</li>
                              <li>Acumule pontos para trocar por prêmios</li>
                            </ul>
                          </div>

                          {/* Seção: Eventos */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              <span className="text-blue-400">🎉</span> Eventos
                            </h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                              <li>Participe de eventos exclusivos</li>
                              <li>Ganhe emblemas especiais</li>
                              <li>Acompanhe o calendário de eventos</li>
                            </ul>
                          </div>

                          {/* Seção: Roleta da Sorte */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              <span className="text-purple-400">🎲</span> Roleta da Sorte
                            </h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                              <li>Gire a roleta uma vez por dia</li>
                              <li>Ganhe pontos aleatórios</li>
                              <li>Acumule pontos para trocar por prêmios</li>
                            </ul>
                          </div>

                          {/* Seção: Emblemas */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              <span className="text-pink-400">🏆</span> Emblemas
                            </h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                              <li>Ganhe emblemas por suas conquistas</li>
                              <li>Desbloqueie emblemas especiais em eventos</li>
                              <li>Colecione emblemas raros</li>
                            </ul>
                          </div>

                          {/* Botão para abrir formulário de ajuda */}
                          <div className="mt-8 text-center">
                            <div className="text-gray-400 mb-2">Ainda precisa de ajuda?</div>
                            <button
                              onClick={() => setShowHelpForm(true)}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                              <span>📝</span>
                              Enviar Mensagem
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Enviar Mensagem</h2>
                          <button
                            onClick={() => setShowHelpForm(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            ←
                          </button>
                        </div>

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
                              onClick={() => setShowHelpForm(false)}
                              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                              Voltar
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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