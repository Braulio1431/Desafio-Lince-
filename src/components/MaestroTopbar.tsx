"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cerrarSesion } from "@/lib/auth";
import { Bell, FolderKanban, LogOut } from "lucide-react";

export function MaestroTopbar() {
  const router = useRouter(); const pathname = usePathname();
  async function handleSalir() { await cerrarSesion(); router.replace("/login"); }
  return <header className="bg-white border-b border-gray-200 shadow-sm"><div className="h-16 px-4 sm:px-6 flex items-center justify-between"><div className="flex items-center gap-4"><span className="text-3xl font-black text-[#c8102e]">UVM</span><span className="hidden sm:block text-lg font-semibold text-[#202124]">Evaluación de Proyectos</span></div><div className="flex items-center gap-3 sm:gap-4 text-gray-500"><Bell size={20} /><button onClick={handleSalir} className="flex items-center gap-2 border-l pl-3 sm:pl-4 text-sm hover:text-[#c8102e]"><LogOut size={17} /> <span className="hidden sm:inline">Cerrar sesión</span></button></div></div><nav className="px-4 sm:px-6 flex gap-1"><Link href="/maestro/proyectos" className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 ${pathname.startsWith("/maestro/proyectos") ? "border-[#c8102e] text-[#c8102e] font-semibold" : "border-transparent text-gray-500"}`}><FolderKanban size={16} /> Proyectos por evaluar</Link></nav></header>;
}
