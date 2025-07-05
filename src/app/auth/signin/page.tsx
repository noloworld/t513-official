"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function SignInContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { login, error } = useAuth();

  const [formData, setFormData] = useState({
    nickname: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Tentando fazer login com:', { nickname: formData.nickname });

    try {
      console.log('Chamando função login...');
      const result = await login(formData.nickname, formData.password);
      console.log('Resultado do login:', result);
    } catch (error) {
      console.error('Erro detalhado no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        {message && (
          <div className="mb-8 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-2xl backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300 ease-out animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transform hover:rotate-12 transition-transform duration-300">
                ✓
              </div>
              <p className="text-green-400">
                {message}
              </p>
            </div>
          </div>
        )}

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

        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 ease-out hover:shadow-orange-500/20 animate-fadeInRotate">
            H
          </div>
        </div>

        <div className="text-center mb-8 transform transition-all duration-500 ease-out hover:scale-[1.02] animate-slideDown">
          <h1 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 font-bold mb-3">
            Fazer Login
          </h1>
          <p className="text-gray-300">
            Entre na sua conta da comunidade Habbo
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl transform transition-all duration-500 ease-out hover:shadow-orange-500/10 hover:bg-white/[0.12] animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-300 font-medium mb-2 block">
                Nickname
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
                <>
                  <span className="flex items-center justify-center gap-2">
                    <span>Entrar</span>
                    <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{" "}
              <Link
                href="/auth/signup"
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 ease-in-out hover:scale-105 inline-block"
              >
                Criar Conta
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
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SignInContent />
    </Suspense>
  );
} 