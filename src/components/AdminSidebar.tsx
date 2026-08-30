"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/lib/auth";
import { useRouter } from "next/navigation";

const ENLACES = [
  { href: "/admin/equipos", label: "Equipos" },
  { href: "/admin/entregas", label: "Entregas" },
  { href: "/admin/calificaciones", label: "Calificaciones" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSalir() {
    await cerrarSesion();
    router.replace("/login");
  }

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-lg font-bold mb-6">Desafío Lince — Admin</h2>
      <nav className="flex-1 space-y-1">
        {ENLACES.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              pathname.startsWith(enlace.href)
                ? "bg-white text-gray-900 font-medium"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            {enlace.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleSalir}
        className="text-sm text-gray-400 hover:text-white text-left"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}