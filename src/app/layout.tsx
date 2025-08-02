"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TaskProvider } from "@/contexts/TaskContext";
import { DonationProvider } from "@/contexts/DonationContext";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

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

  // SEO Meta Tags
  useEffect(() => {
    // Título da página
    document.title = "T513 - Comunidade Habbo | Eventos, Doações e Diversão";
    
    // Meta Description
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', 'T513 - A melhor comunidade Habbo! Participe de eventos exclusivos, doações, roleta da sorte e ganhe prêmios incríveis. Sistema de níveis, emblemas e muito mais!');
    if (!document.querySelector('meta[name="description"]')) {
      document.head.appendChild(metaDescription);
    }

    // Meta Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    metaKeywords.setAttribute('content', 't513, habbo, habbo hotel, comunidade habbo, eventos habbo, doações habbo, roleta habbo, prêmios habbo, T513 habbo, habbo brasil, habbo português');
    if (!document.querySelector('meta[name="keywords"]')) {
      document.head.appendChild(metaKeywords);
    }

    // Open Graph Tags para redes sociais
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'T513 - Comunidade Habbo | Eventos e Diversão');
    if (!document.querySelector('meta[property="og:title"]')) {
      document.head.appendChild(ogTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Participe da melhor comunidade Habbo! Eventos exclusivos, sistema de níveis, doações e muito mais!');
    if (!document.querySelector('meta[property="og:description"]')) {
      document.head.appendChild(ogDescription);
    }

    const ogType = document.querySelector('meta[property="og:type"]') || document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.setAttribute('content', 'website');
    if (!document.querySelector('meta[property="og:type"]')) {
      document.head.appendChild(ogType);
    }

    const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', '/imagens/logo-oficial.png');
    if (!document.querySelector('meta[property="og:image"]')) {
      document.head.appendChild(ogImage);
    }

    // Twitter Card
    const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.setAttribute('content', 'summary_large_image');
    if (!document.querySelector('meta[name="twitter:card"]')) {
      document.head.appendChild(twitterCard);
    }

    // Meta robots
    const metaRobots = document.querySelector('meta[name="robots"]') || document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    metaRobots.setAttribute('content', 'index, follow');
    if (!document.querySelector('meta[name="robots"]')) {
      document.head.appendChild(metaRobots);
    }

    // Author
    const metaAuthor = document.querySelector('meta[name="author"]') || document.createElement('meta');
    metaAuthor.setAttribute('name', 'author');
    metaAuthor.setAttribute('content', 'T513 Community');
    if (!document.querySelector('meta[name="author"]')) {
      document.head.appendChild(metaAuthor);
    }

    // Viewport (garantir que existe)
    if (!document.querySelector('meta[name="viewport"]')) {
      const metaViewport = document.createElement('meta');
      metaViewport.setAttribute('name', 'viewport');
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(metaViewport);
    }

    // JSON-LD para dados estruturados
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "T513 - Comunidade Habbo",
      "description": "A melhor comunidade Habbo! Participe de eventos exclusivos, doações, roleta da sorte e ganhe prêmios incríveis.",
      "url": "https://t513-official.vercel.app",
      "logo": "https://t513-official.vercel.app/imagens/logo-oficial.png",
      "sameAs": [],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://t513-official.vercel.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    // Remover JSON-LD anterior se existir
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    // Adicionar novo JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
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
    <html lang="pt-BR">
      <body className={inter.className}>
        <DonationProvider>
          <TaskProvider>
            {children}
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
          </TaskProvider>
        </DonationProvider>
      </body>
    </html>
  );
}
