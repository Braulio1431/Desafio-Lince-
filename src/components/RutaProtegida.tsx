"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Rol } from "@/types";

export function RutaProtegida({
  rolRequerido,
  children,
}: {
  rolRequerido: Rol | Rol[];
  children: React.ReactNode;
}) {
  const { user, rol, cargando } = useAuth();
  const router = useRouter();
  const permitidos = Array.isArray(rolRequerido) ? rolRequerido : [rolRequerido];
  const autorizado = rol !== null && permitidos.includes(rol);

  useEffect(() => {
    if (cargando) return;
    if (!user || !autorizado) {
      router.replace("/login");
    }
  }, [user, autorizado, cargando, router]);

  if (cargando || !user || !autorizado) return null;
  return <>{children}</>;
}