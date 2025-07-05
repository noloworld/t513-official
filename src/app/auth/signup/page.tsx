"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SignUp() {
  const { register, verify, error } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (step === 1) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("As senhas não coincidem");
        }

        const result = await register(formData.nickname, formData.email, formData.password);
        setVerificationCode(result.verificationCode);
        setStep(2);
      } else {
        await verify(formData.nickname, verificationCode);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-8 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/20 rounded-2xl backdrop-blur-sm animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400">
                ⚠️
              </div>
              <p className="text-red-400">
                {error.message}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 ease-out hover:shadow-orange-500/20 animate-fadeInRotate">
            T
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center mb-8 animate-slideDown">
              <h1 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 font-bold mb-3">
                #T513 - Uma nova era!
              </h1>
              <p className="text-gray-300">
                Preencha seus dados básicos para começar
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl transform transition-all duration-500 ease-out hover:shadow-purple-500/10 hover:bg-white/[0.12] animate-slideUp">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-gray-300 font-medium mb-2 block">
                    Nick do Habbo
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) =>
                        setFormData({ ...formData, nickname: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-in-out hover:border-white/20"
                      placeholder="Digite seu nick do Habbo"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute right-4 top-4 text-2xl transform transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                      👤
                    </div>
                  </div>
                  <p className="mt-2 text-gray-400 text-sm">
                    Use exatamente o mesmo nick do seu Habbo
                  </p>
                </div>

                <div>
                  <label className="text-gray-300 font-medium mb-2 block">
                    Email
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-in-out hover:border-white/20"
                      placeholder="Digite seu email"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute right-4 top-4 text-2xl transform transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                      ✉️
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 font-medium mb-2 block">
                    Senha
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-in-out hover:border-white/20"
                      placeholder="Digite sua senha"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute right-4 top-4 text-2xl transform transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                      🔒
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 font-medium mb-2 block">
                    Confirme sua senha
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-in-out hover:border-white/20"
                      placeholder="Digite sua senha novamente"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute right-4 top-4 text-2xl transform transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                      🔒
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-medium text-lg hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-lg hover:shadow-purple-500/20 group ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Continuar</span>
                      <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8 animate-slideDown">
              <h1 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 font-bold mb-3">
                Ative sua conta
              </h1>
              <p className="text-gray-300">
                Siga os passos abaixo para ativar sua conta
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-6">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg mb-1">
                      Ative sua conta no T513
                    </h3>
                    <p className="text-gray-300">
                      Você precisa estar logado no Habbo para ativar
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      1
                    </div>
                    <span>Copie o código abaixo</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      2
                    </div>
                    <span>Abra o Habbo Hotel</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      3
                    </div>
                    <span>Vá no seu perfil → Editar Missão</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      4
                    </div>
                    <span>Cole o código na sua missão</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      5
                    </div>
                    <span>Clique em "Verificar & Criar Conta"</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-gray-300 font-medium mb-2 block">
                    Seu código de ativação
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 px-5 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl font-mono text-yellow-400 select-all">
                      {verificationCode}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors transform hover:scale-110 duration-300"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 font-medium mb-2 block">
                    Seu nick do Habbo
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.nickname}
                      readOnly
                      className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                    <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl flex items-center">
                      ✓ OK
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className={`flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-medium transition-all duration-300 ease-out hover:shadow-lg hover:shadow-white/10 transform hover:scale-[1.02] group ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
                      <span>Voltar</span>
                    </span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-medium hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-lg hover:shadow-green-500/20 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      "Verificar & Criar Conta"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Já tem uma conta?{" "}
            <Link
              href="/auth/signin"
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 ease-in-out hover:scale-105 inline-block"
            >
              Fazer Login
            </Link>
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5"
          >
            <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span className="text-white">Voltar ao Início</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 