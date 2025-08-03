import { useEffect } from 'react';
import Head from 'next/head';

export default function SEOHead() {
  return (
    <Head>
      <title>T513 - Comunidade Habbo | Eventos, Doações e Diversão</title>
      <meta name="description" content="T513 - A melhor comunidade Habbo! Participe de eventos exclusivos, doações, roleta da sorte e ganhe prêmios incríveis. Sistema de níveis, emblemas e muito mais!" />
      <meta name="keywords" content="t513, t513.org, habbo, habbo hotel, comunidade habbo, eventos habbo, doações habbo, roleta habbo, prêmios habbo, T513 habbo, habbo brasil, habbo português, sistema de níveis, emblemas habbo, tarefas diárias habbo" />
      <link rel="canonical" href="https://t513.org" />
      <meta httpEquiv="content-language" content="pt-BR" />
      <meta name="theme-color" content="#4424a1" />
      
      {/* Open Graph */}
      <meta property="og:title" content="T513 - Comunidade Habbo | Eventos e Diversão" />
      <meta property="og:description" content="Participe da melhor comunidade Habbo! Eventos exclusivos, sistema de níveis, doações e muito mais!" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://t513.org/imagens/logo-oficial.png" />
      <meta property="og:url" content="https://t513.org" />
      <meta property="og:site_name" content="T513.org - Comunidade Habbo" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="T513.org - Comunidade Habbo | Eventos e Diversão" />
      <meta name="twitter:description" content="Participe da melhor comunidade Habbo! Eventos exclusivos, sistema de níveis, doações e muito mais!" />
      <meta name="twitter:image" content="https://t513.org/imagens/logo-oficial.png" />
      
      {/* Outros */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="T513 Community" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Ícones */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/imagens/logo-oficial.png" />
      <link rel="icon" type="image/png" href="/imagens/logo-oficial.png" />
      
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          })
        }}
      />
    </Head>
  );
}