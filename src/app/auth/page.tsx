"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Auth() {
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