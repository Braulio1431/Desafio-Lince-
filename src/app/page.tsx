"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user, rol, cargando } = useAuth();

  useEffect(() => {
    if (cargando) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (rol === "admin") router.replace("/admin");
    if (rol === "maestro") router.replace("/maestro/dashboard");
  }, [user, rol, cargando, router]);

  return null;
}