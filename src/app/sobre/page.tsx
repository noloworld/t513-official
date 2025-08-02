"use client";

import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { useEffect } from "react";

export default function SobrePage() {
  const { user } = useAuth();

  useEffect(() => {
    // SEO para página Sobre
    document.title = "Sobre T513.org - A Melhor Comunidade Habbo do Brasil";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Conheça a história da T513.org, a maior comunidade Habbo do Brasil. Eventos exclusivos, sistema de níveis, doações e muito mais!');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800">
      <Header />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Sobre a T513.org
              </h1>
              <p className="text-xl text-gray-300">
                A maior e melhor comunidade Habbo do Brasil
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">🎮 Nossa História</h2>
                <p className="text-gray-300 leading-relaxed">
                  A T513 nasceu da paixão pela comunidade Habbo Hotel. Somos uma organização 
                  dedicada a criar eventos únicos, promover doações solidárias e conectar 
                  jogadores através de experiências inesquecíveis no mundo virtual.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">🏆 Nossa Missão</h2>
                <p className="text-gray-300 leading-relaxed">
                  Criar a melhor plataforma de comunidade Habbo do Brasil, oferecendo 
                  eventos exclusivos, sistema de níveis gamificado, doações transparentes 
                  e um ambiente seguro para todos os jogadores.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                ✨ O que oferecemos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Eventos Exclusivos</h3>
                  <p className="text-gray-300 text-sm">
                    Eventos únicos como Doações, Competições e Quiz especiais
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎰</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Roleta da Sorte</h3>
                  <p className="text-gray-300 text-sm">
                    Sistema de roleta com prêmios incríveis usando seus pontos
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📈</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Sistema de Níveis</h3>
                  <p className="text-gray-300 text-sm">
                    Evolua seu personagem completando tarefas diárias e ganhando emblemas
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                🌟 Por que escolher T513.org?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <span className="text-green-400 text-xl">✅</span>
                  <div>
                    <h4 className="text-white font-semibold">100% Gratuito</h4>
                    <p className="text-gray-300 text-sm">Todos os recursos são completamente gratuitos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-green-400 text-xl">✅</span>
                  <div>
                    <h4 className="text-white font-semibold">Comunidade Ativa</h4>
                    <p className="text-gray-300 text-sm">Centenas de jogadores participando diariamente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-green-400 text-xl">✅</span>
                  <div>
                    <h4 className="text-white font-semibold">Eventos Regulares</h4>
                    <p className="text-gray-300 text-sm">Novos eventos toda semana com prêmios exclusivos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-green-400 text-xl">✅</span>
                  <div>
                    <h4 className="text-white font-semibold">Suporte 24/7</h4>
                    <p className="text-gray-300 text-sm">Equipe dedicada para ajudar você a qualquer momento</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Pronto para começar?
              </h2>
              <p className="text-gray-300 mb-8">
                Junte-se a milhares de jogadores na melhor comunidade Habbo do Brasil!
              </p>
              {!user && (
                <div className="space-x-4">
                  <a 
                    href="/auth/signup"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Criar Conta Grátis
                  </a>
                  <a 
                    href="/auth/signin"
                    className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all duration-300"
                  >
                    Já tenho conta
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-black/20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2025 T513.org - A maior comunidade Habbo do Brasil</p>
          <p className="text-sm mt-2">Não afiliado oficialmente ao Habbo Hotel</p>
        </div>
      </footer>
    </div>
  );
}