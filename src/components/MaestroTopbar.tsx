"use client";

import { useRouter } from "next/navigation";
import { cerrarSesion } from "@/lib/auth";

export function MaestroTopbar() {
  const router = useRouter();

  async function handleSalir() {
    await cerrarSesion();
    router.replace("/login");
  }

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-b">
      <h2 className="font-bold text-lg">Desafío Lince — Maestro</h2>
      <button
        onClick={handleSalir}
        className="text-sm text-gray-500 hover:text-black"
      >
        Cerrar sesión
      </button>
    </div>
  );
}