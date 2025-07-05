"use client";

import { useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCheck() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return <LandingPage />;
} 