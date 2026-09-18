"use client";

import { useEffect, useMemo, useState } from "react";
import { escucharEquipos } from "@/lib/equipos";
import { escucharUsuarios } from "@/lib/usuarios";
import { Equipo, Usuario } from "@/types";
import { ModalAsignarMaestros } from "@/components/ModalAsignarMaestros";
import { Search, UserCheck, Users2 } from "lucide-react";

export default function AsignacionesPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<Equipo | null>(null);

  useEffect(() => escucharEquipos(setEquipos), []);
  useEffect(() => escucharUsuarios(setUsuarios), []);

  const maestros = useMemo(() => usuarios.filter((u) => u.rol === "maestro"), [usuarios]);

  const termino = busqueda.trim().toLowerCase();
  const filtrados = equipos.filter((e) =>
    !termino ||
    [e.codigoProyecto, e.registro?.nombreProyecto, e.nombreEquipo].some((c) =>
      c?.toLowerCase().includes(termino)
    )
  );

  function nombreMaestro(uid: string) {
    return maestros.find((m) => m.uid === uid)?.nombre || "Maestro";
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-sm text-[#c8102e] font-bold uppercase tracking-wider">Administración</p>
        <h1 className="text-3xl font-bold text-[#202124] mt-1">Asignación de evaluadores</h1>
        <p className="text-gray-500 mt-1">
          Define qué maestros pueden calificar cada proyecto. Al iniciar sesión, cada maestro solo verá los proyectos que le asignes aquí.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
        <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar proyecto por ID, nombre o equipo..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c8102e]/40 focus:border-[#c8102e] transition"
        />
      </div>

      {maestros.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-center gap-2">
          <Users2 size={18} />
          Todavía no hay usuarios con rol "maestro". Crea alguno en la sección Usuarios.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-[#202124] text-white text-left">
              <tr>
                <th className="p-4 font-semibold">Proyecto / ID</th>
                <th className="p-4 font-semibold">Maestros asignados</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((equipo) => {
                const asignados = equipo.maestrosAsignados ?? [];
                return (
                  <tr key={equipo.id} className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <span className="block text-xs text-[#c8102e] font-bold">{equipo.codigoProyecto ?? "Sin ID"}</span>
                      <span className="font-semibold text-gray-900">{equipo.registro?.nombreProyecto || equipo.nombreEquipo}</span>
                    </td>
                    <td className="p-4">
                      {asignados.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Sin asignar</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {asignados.map((uid) => (
                            <span key={uid} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full border border-gray-200">
                              {nombreMaestro(uid)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditando(equipo)}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-[#c8102e] transition"
                      >
                        <UserCheck size={15} /> Asignar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editando && (
        <ModalAsignarMaestros
          equipo={editando}
          maestros={maestros}
          onClose={() => setEditando(null)}
        />
      )}
    </main>
  );
}