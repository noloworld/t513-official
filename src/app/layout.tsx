"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TaskProvider } from "@/contexts/TaskContext";
import { DonationProvider } from "@/contexts/DonationContext";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Carrega o RadioPlayer dinamicamente para evitar problemas de SSR com Audio API
const RadioPlayer = dynamic(() => import('@/components/RadioPlayer'), {
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
    metaKeywords.setAttribute('content', 't513, t513.org, habbo, habbo hotel, comunidade habbo, eventos habbo, doações habbo, roleta habbo, prêmios habbo, T513 habbo, habbo brasil, habbo português, sistema de níveis, emblemas habbo, tarefas diárias habbo');
    if (!document.querySelector('meta[name="keywords"]')) {
      document.head.appendChild(metaKeywords);
    }

    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', 'https://t513.org');
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonicalLink);
    }

    // Language
    const metaLanguage = document.querySelector('meta[http-equiv="content-language"]') || document.createElement('meta');
    metaLanguage.setAttribute('http-equiv', 'content-language');
    metaLanguage.setAttribute('content', 'pt-BR');
    if (!document.querySelector('meta[http-equiv="content-language"]')) {
      document.head.appendChild(metaLanguage);
    }

    // Theme Color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]') || document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    metaThemeColor.setAttribute('content', '#4424a1');
    if (!document.querySelector('meta[name="theme-color"]')) {
      document.head.appendChild(metaThemeColor);
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
    ogImage.setAttribute('content', 'https://t513.org/imagens/logo-oficial.png');
    if (!document.querySelector('meta[property="og:image"]')) {
      document.head.appendChild(ogImage);
    }

    // Open Graph URL
    const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.setAttribute('content', 'https://t513.org');
    if (!document.querySelector('meta[property="og:url"]')) {
      document.head.appendChild(ogUrl);
    }

    // Open Graph Site Name
    const ogSiteName = document.querySelector('meta[property="og:site_name"]') || document.createElement('meta');
    ogSiteName.setAttribute('property', 'og:site_name');
    ogSiteName.setAttribute('content', 'T513.org - Comunidade Habbo');
    if (!document.querySelector('meta[property="og:site_name"]')) {
      document.head.appendChild(ogSiteName);
    }

    // Twitter Cards
    const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.setAttribute('content', 'summary_large_image');
    if (!document.querySelector('meta[name="twitter:card"]')) {
      document.head.appendChild(twitterCard);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta');
    twitterTitle.setAttribute('name', 'twitter:title');
    twitterTitle.setAttribute('content', 'T513.org - Comunidade Habbo | Eventos e Diversão');
    if (!document.querySelector('meta[name="twitter:title"]')) {
      document.head.appendChild(twitterTitle);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta');
    twitterDescription.setAttribute('name', 'twitter:description');
    twitterDescription.setAttribute('content', 'Participe da melhor comunidade Habbo! Eventos exclusivos, sistema de níveis, doações e muito mais!');
    if (!document.querySelector('meta[name="twitter:description"]')) {
      document.head.appendChild(twitterDescription);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]') || document.createElement('meta');
    twitterImage.setAttribute('name', 'twitter:image');
    twitterImage.setAttribute('content', 'https://t513.org/imagens/logo-oficial.png');
    if (!document.querySelector('meta[name="twitter:image"]')) {
      document.head.appendChild(twitterImage);
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

    // PWA Manifest
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      manifestLink.setAttribute('href', '/manifest.json');
      document.head.appendChild(manifestLink);
    }

    // Apple Touch Icon
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      appleIcon.setAttribute('href', '/imagens/logo-oficial.png');
      document.head.appendChild(appleIcon);
    }

    // Favicon
    if (!document.querySelector('link[rel="icon"]')) {
      const favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('type', 'image/png');
      favicon.setAttribute('href', '/imagens/logo-oficial.png');
      document.head.appendChild(favicon);
    }

    // JSON-LD para dados estruturados
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "T513.org - Comunidade Habbo",
      "alternateName": "T513 Habbo Community",
      "description": "A melhor comunidade Habbo! Participe de eventos exclusivos, doações, roleta da sorte e ganhe prêmios incríveis. Sistema de níveis, emblemas e muito mais!",
      "url": "https://t513.org",
      "logo": "https://t513.org/imagens/logo-oficial.png",
      "image": "https://t513.org/imagens/logo-oficial.png",
      "sameAs": [],
      "keywords": "t513, habbo, habbo hotel, comunidade habbo, eventos habbo, doações habbo, roleta habbo, prêmios habbo, habbo brasil",
      "inLanguage": "pt-BR",
      "author": {
        "@type": "Organization",
        "name": "T513 Community",
        "url": "https://t513.org"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://t513.org/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "WebApplication",
        "name": "T513 Habbo Community Platform",
        "applicationCategory": "GameApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "BRL"
        }
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
            {/* Player da Rádio */}
            {user && (
              <RadioPlayer 
                mixlrUsername="t513radio"
                defaultVolume={0.3}
              />
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
          </TaskProvider>
        </DonationProvider>
      </body>
    </html>
  );
}
