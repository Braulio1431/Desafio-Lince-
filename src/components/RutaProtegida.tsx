"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Rol } from "@/types";

export function RutaProtegida({
  rolRequerido,
  children,
}: {
  rolRequerido: Rol;
  children: React.ReactNode;
}) {
  const { user, rol, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;
    if (!user || rol !== rolRequerido) {
      router.replace("/login");
    }
  }, [user, rol, cargando, rolRequerido, router]);

  if (cargando || !user || rol !== rolRequerido) return null;
  return <>{children}</>;
}