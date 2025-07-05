"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1a1b26] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                T513
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-blue-500/10 text-blue-400"
                    : "hover:bg-white/5"
                }`}
              >
                Início
              </Link>

              <Link
                href="/news"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/news"
                    ? "bg-blue-500/10 text-blue-400"
                    : "hover:bg-white/5"
                }`}
              >
                Notícias
              </Link>

              <Link
                href="/events"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/events"
                    ? "bg-blue-500/10 text-blue-400"
                    : "hover:bg-white/5"
                }`}
              >
                Eventos
              </Link>

              <Link
                href="/radio"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/radio"
                    ? "bg-blue-500/10 text-blue-400"
                    : "hover:bg-white/5"
                }`}
              >
                Rádio
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/auth"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/auth?register=true"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Registrar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 