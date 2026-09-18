"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { escucharEquipos } from "@/lib/equipos";
import { Equipo } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { ArrowRight, Search } from "lucide-react";

export default function ProyectosMaestroPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const { user } = useAuth();

  useEffect(() => escucharEquipos(setEquipos), []);

  const asignados = useMemo(
    () => equipos.filter((e) => (e.maestrosAsignados ?? []).includes(user?.uid ?? "")),
    [equipos, user]
  );

  const filtrados = useMemo(
    () =>
      asignados.filter((e) =>
        `${e.codigoProyecto} ${e.nombreEquipo} ${e.registro?.nombreProyecto}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      ),
    [asignados, busqueda]
  );

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-[#c8102e] font-semibold uppercase tracking-wider">Maestro evaluador</p>
        <h1 className="text-3xl font-bold text-[#202124] mt-1">Proyectos asignados</h1>
        <p className="text-gray-500 mt-2">
          Estos son los proyectos que el administrador te asignó para evaluar.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por ID, equipo o proyecto"
          className="w-full bg-white border border-gray-300 pl-10 pr-3 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e] outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtrados.map((equipo) => (
          <article key={equipo.id} className="bg-white border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex justify-between gap-3">
              <span className="text-xs font-bold text-[#c8102e] bg-red-50 px-2 py-1">{equipo.codigoProyecto ?? "Sin ID"}</span>
              <span className="text-xs text-gray-500">{equipo.documentos?.filter((d) => d.link).length ?? 0}/4 documentos</span>
            </div>
            <h2 className="font-bold text-lg mt-4 text-[#202124]">{equipo.registro?.nombreProyecto || equipo.nombreEquipo}</h2>
            <p className="text-sm text-gray-500 mt-1">{equipo.nombreEquipo}</p>
            <p className="text-xs text-gray-500 mt-3">Líder: {equipo.registro?.nombreCompleto || equipo.representante?.nombre || "No registrado"}</p>
            <Link href={`/maestro/proyectos/${equipo.id}`} className="mt-5 w-full inline-flex justify-center items-center gap-2 bg-[#c8102e] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#a50d26]">
              Evaluar proyecto <ArrowRight size={16} />
            </Link>
          </article>
        ))}

        {asignados.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 bg-white border border-dashed p-10 text-center text-gray-500">
            Todavía no tienes proyectos asignados. El administrador debe asignarte proyectos desde el panel.
          </div>
        )}
        {asignados.length > 0 && filtrados.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 bg-white border border-dashed p-10 text-center text-gray-500">
            Ningún proyecto asignado coincide con la búsqueda.
          </div>
        )}
      </div>
    </main>
  );
}