"use client";

import { useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import BackgroundBeams from "@/components/BackgroundBeams";
import { useAuth } from "@/hooks/useAuth";
import { BackgroundLines } from "@/components/ui/background-lines";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

export default function AuthCheck() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Se não há usuário logado, mostrar página inicial com Background Beams
  if (!user) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 overflow-hidden">
        <BackgroundBeams />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white max-w-4xl mx-auto px-4 relative">
            {/* BackgroundLines original do Aceternity UI atrás do título */}
            <div className="absolute left-1/2 top-0 w-full flex justify-center z-0 pointer-events-none select-none" style={{height: 400, transform: 'translateX(-50%)'}}>
              <BackgroundLines className="!h-[400px] !w-full" svgOptions={{ duration: 12 }}>{/* children obrigatório */}<></></BackgroundLines>
            </div>
            <div className="relative z-10 mb-6 flex justify-center">
              <img 
                src="/imagens/logo-oficial.png" 
                alt="T513 Community" 
                className="h-24 w-auto object-contain bg-transparent"
                style={{ 
                  filter: 'brightness(1.2) contrast(1.5) saturate(1.1) drop-shadow(0 0 10px rgba(255,255,255,0.1))'
                }}
              />
            </div>
            <p className="text-xl mb-8 text-gray-300">
              Junte-se ao T513 e participe de eventos, 
              complete tarefas diárias, gire a roleta e ganhe prêmios incríveis e muito mais!
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <CardContainer containerClassName="!py-0" className="!w-full">
                  <CardBody className="!h-auto !w-full">
                    <CardItem className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 !h-auto !w-full">
                      <h3 className="text-lg font-semibold mb-2">🎯 Tarefas Diárias</h3>
                      <p className="text-sm text-gray-300">Complete tarefas e ganhe pontos para subir de nível</p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
                <CardContainer containerClassName="!py-0" className="!w-full">
                  <CardBody className="!h-auto !w-full">
                    <CardItem className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 !h-auto !w-full">
                      <h3 className="text-lg font-semibold mb-2">🎁 Eventos Especiais</h3>
                      <p className="text-sm text-gray-300">Participe de eventos exclusivos e ganhe prêmios</p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
                <CardContainer containerClassName="!py-0" className="!w-full">
                  <CardBody className="!h-auto !w-full">
                    <CardItem className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 !h-auto !w-full">
                      <h3 className="text-lg font-semibold mb-2">🏆 Sistema de Níveis</h3>
                      <p className="text-sm text-gray-300">Suba de nível e desbloqueie multiplicadores de pontos</p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/signin"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Entrar
                </a>
                <a
                  href="/auth/signup"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  Cadastrar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <LandingPage />;
} 