"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cerrarSesion } from "@/lib/auth";
import { ClipboardCheck, FolderKanban, LogOut, Users, ListChecks, Trophy, UserCheck } from "lucide-react";

const ENLACES = [
  { href: "/admin/equipos", label: "Proyectos", icon: FolderKanban },
  { href: "/admin/asignaciones", label: "Asignaciones", icon: UserCheck },
  { href: "/admin/rubricas", label: "Rúbricas", icon: ListChecks },
  { href: "/admin/podio", label: "Podio", icon: Trophy },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSalir() {
    await cerrarSesion();
    router.replace("/login");
  }

  return (
    <aside className="w-full lg:w-64 lg:min-h-screen bg-[#202124] text-white flex flex-col shrink-0">
      <div className="bg-white px-5 py-5 flex flex-col items-center lg:items-start gap-1.5">
        <Image src="/logo-uvm.png" alt="UVM" width={160} height={160} className="h-16 w-auto" priority />
        <span className="text-[#202124] text-xs font-semibold uppercase tracking-wide">
          Evaluación de proyectos
        </span>
      </div>

      <div className="hidden lg:block px-5 py-5 border-b border-white/10">
        <p className="text-xs uppercase tracking-[.18em] text-white/50">Desafío Lince</p>
        <p className="text-lg font-bold mt-1">Administración</p>
      </div>

      <nav className="flex-1 py-2 lg:py-4 space-y-1 flex lg:block overflow-x-auto">
        {ENLACES.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`mx-1 lg:mx-3 flex shrink-0 items-center gap-2 lg:gap-3 px-3 py-2.5 lg:py-3 text-sm transition border-l-4 ${
              pathname.startsWith(href)
                ? "bg-[#c8102e] text-white font-semibold border-white"
                : "text-gray-300 hover:bg-white/10 border-transparent"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleSalir}
          className="mx-1 lg:mx-3 flex shrink-0 w-full items-center gap-2 lg:gap-3 px-3 py-2.5 lg:py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white border-l-4 border-transparent text-left"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}