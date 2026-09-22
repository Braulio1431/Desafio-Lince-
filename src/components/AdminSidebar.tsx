"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cerrarSesion } from "@/lib/auth";
import { useAuth } from "./AuthProvider";
import { FolderKanban, LogOut, Users, ListChecks, Trophy, UserCheck, Menu, X } from "lucide-react";

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
  const { rol } = useAuth();
  const [abierto, setAbierto] = useState(false);

  async function handleSalir() {
    await cerrarSesion();
    router.replace("/login");
  }

  return (
    <>
      {/* Barra superior — SOLO en móvil */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#202124] text-white flex items-center justify-between px-4 h-14 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Image src="/logo-uvm.png" alt="UVM" width={32} height={32} className="h-7 w-auto bg-white rounded p-0.5 shrink-0" />
          <span className="text-sm font-semibold truncate">Desafío Lince · Admin</span>
        </div>
        <button onClick={() => setAbierto(true)} aria-label="Abrir menú" className="p-2 -mr-2 shrink-0">
          <Menu size={24} />
        </button>
      </header>

      {/* Fondo oscuro al abrir el menú en móvil */}
      {abierto && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setAbierto(false)} />
      )}

      {/* Panel: cajón (drawer) en móvil, columna fija en desktop */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 lg:w-64 bg-[#202124] text-white flex flex-col shrink-0 z-50 transition-transform duration-200 ease-out
          ${abierto ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="bg-white px-5 py-5 flex items-center justify-between gap-2">
          <div className="flex flex-col items-start gap-1">
            <Image src="/logo-uvm.png" alt="UVM" width={160} height={160} className="h-12 lg:h-16 w-auto" priority />
            <span className="text-[#202124] text-xs font-semibold uppercase tracking-wide">
              Evaluación de proyectos
            </span>
          </div>
          <button onClick={() => setAbierto(false)} aria-label="Cerrar menú" className="lg:hidden text-[#202124] p-1">
            <X size={22} />
          </button>
        </div>

        <div className="hidden lg:block px-5 py-5 border-b border-white/10">
          <p className="text-xs uppercase tracking-[.18em] text-white/50">Desafío Lince</p>
          <p className="text-lg font-bold mt-1">Administración</p>
        </div>

        <nav className="flex-1 py-2 lg:py-4 space-y-1 overflow-y-auto">
          {ENLACES.filter((e) => (rol === "subadmin" ? e.href !== "/admin/usuarios" : true)).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setAbierto(false)}
              className={`mx-1 lg:mx-3 flex items-center gap-3 px-3 py-3 text-sm transition border-l-4 rounded-r ${
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
            className="mx-1 lg:mx-3 flex w-[calc(100%-0.5rem)] items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white border-l-4 border-transparent text-left"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </nav>
      </aside>
    </>
  );
}