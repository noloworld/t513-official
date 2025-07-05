"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = searchParams.get("register");

  useEffect(() => {
    if (register) {
      router.replace("/auth/signup");
    } else {
      router.replace("/auth/signin");
    }
  }, [register, router]);

  return null;
}

export default function Auth() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AuthContent />
    </Suspense>
  );
} 