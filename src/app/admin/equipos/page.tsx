"use client";

import { useEffect, useState } from "react";
import { escucharEquipos, eliminarEquipo, eliminarTodosLosProyectosYCalificaciones } from "@/lib/equipos";
import { Equipo } from "@/types";
import { ModalEquipo } from "@/components/ModalEquipo";
import { ModalImportarEquipos } from "@/components/ModalImportarEquipos";
import { Pencil, Plus, Trash2, Upload, FolderKanban, Search, X, CheckCircle2 } from "lucide-react";

export default function EquiposAdminPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Equipo | null>(null);
  const [importar, setImportar] = useState(false);
  const [eliminandoTodo, setEliminandoTodo] = useState(false);
  const [mensajeEliminacion, setMensajeEliminacion] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [campusFiltro, setCampusFiltro] = useState("todos");

  useEffect(() => escucharEquipos(setEquipos), []);

  async function eliminar(id: string) {
    if (confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) await eliminarEquipo(id);
  }

  async function eliminarTodo() {
    if (prompt("Esta accion es irreversible. Escribe ELIMINAR para continuar:") !== "ELIMINAR") return;
    setEliminandoTodo(true); setMensajeEliminacion("");
    try {
      const resultado = await eliminarTodosLosProyectosYCalificaciones();
      setMensajeEliminacion(`Se eliminaron ${resultado.proyectos} proyectos, ${resultado.entregas} entregas y ${resultado.calificaciones} calificaciones.`);
    } catch (error) {
      setMensajeEliminacion(error instanceof Error ? error.message : "No se pudieron eliminar los registros.");
    } finally { setEliminandoTodo(false); }
  }

  const campusDisponibles = Array.from(
    new Set(equipos.map((e) => e.registro?.campusUvmCercano).filter(Boolean))
  ).sort() as string[];

  const termino = busqueda.trim().toLowerCase();
  const filtrados = equipos.filter((equipo) => {
    const coincideBusqueda =
      !termino ||
      [
        equipo.codigoProyecto,
        equipo.registro?.nombreProyecto,
        equipo.nombreEquipo,
        equipo.registro?.nombreCompleto,
        equipo.representante?.nombre,
      ].some((campo) => campo?.toLowerCase().includes(termino));

    const coincideCampus =
      campusFiltro === "todos" || equipo.registro?.campusUvmCercano === campusFiltro;

    return coincideBusqueda && coincideCampus;
  });

  const hayFiltrosActivos = termino !== "" || campusFiltro !== "todos";

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#c8102e] font-bold uppercase tracking-wider">Administración</p>
          <h1 className="text-3xl font-bold text-[#202124] mt-1">Proyectos registrados</h1>
          <p className="text-gray-500 mt-1">Gestiona equipos, datos de registro y documentos del concurso.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setImportar(true)} className="inline-flex justify-center items-center gap-2 border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 font-semibold hover:bg-gray-50 transition">
            <Upload size={17} /> Importar tabla
          </button>
          <button onClick={() => { setEditando(null); setModal(true); }} className="inline-flex justify-center items-center gap-2 bg-[#c8102e] text-white rounded-lg px-4 py-2.5 font-semibold hover:bg-[#a50d26] transition shadow-sm">
            <Plus size={17} /> Nuevo proyecto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Proyectos</p>
          <p className="text-3xl font-bold text-[#202124] mt-1">{equipos.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Documentos enlazados</p>
          <p className="text-3xl font-bold text-[#c8102e] mt-1">
            {equipos.reduce((n, e) => n + (e.documentos?.filter((d) => d.link).length ?? 0), 0)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Campus participantes</p>
          <p className="text-3xl font-bold text-[#202124] mt-1">
            {new Set(equipos.map((e) => e.registro?.campusUvmCercano).filter(Boolean)).size}
          </p>
        </div>
      </div>

      <section className="border border-red-200 bg-red-50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="font-bold text-red-900">Borrado general de registros</h2><p className="text-sm text-red-800 mt-1">Elimina proyectos, entregas y calificaciones de Firestore. Requiere escribir ELIMINAR.</p></div>
        <button onClick={eliminarTodo} disabled={eliminandoTodo} className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-4 py-2.5 font-semibold disabled:opacity-50"><Trash2 size={17} />{eliminandoTodo ? "Eliminando..." : "Eliminar todos los proyectos y calificaciones"}</button>
        {mensajeEliminacion && <p className="text-sm text-red-900">{mensajeEliminacion}</p>}
      </section>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ID, proyecto, equipo o líder..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c8102e]/40 focus:border-[#c8102e] transition"
          />
        </div>

        <select
          value={campusFiltro}
          onChange={(e) => setCampusFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/40 focus:border-[#c8102e] md:w-56 transition"
        >
          <option value="todos">Todos los campus</option>
          {campusDisponibles.map((campus) => (
            <option key={campus} value={campus}>{campus}</option>
          ))}
        </select>

        {hayFiltrosActivos && (
          <button
            onClick={() => { setBusqueda(""); setCampusFiltro("todos"); }}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#c8102e] px-2 transition"
          >
            <X size={15} /> Limpiar filtros
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-[#202124] text-white text-left">
              <tr>
                <th className="p-4 font-semibold">Proyecto / ID</th>
                <th className="p-4 font-semibold">Líder</th>
                <th className="p-4 font-semibold">Campus</th>
                <th className="p-4 font-semibold">Contacto</th>
                <th className="p-4 font-semibold">Documentos</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((equipo) => {
                const totalDocs = equipo.documentos?.length || 4;
                const subidos = equipo.documentos?.filter((d) => d.link).length ?? 0;
                const completo = subidos === totalDocs && totalDocs > 0;

                return (
                  <tr key={equipo.id} className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <span className="block text-xs text-[#c8102e] font-bold tracking-wide">{equipo.codigoProyecto ?? "Sin ID"}</span>
                      <span className="font-semibold text-gray-900">{equipo.registro?.nombreProyecto || equipo.nombreEquipo}</span>
                    </td>
                    <td className="p-4 text-gray-700">{equipo.registro?.nombreCompleto || equipo.representante?.nombre}</td>
                    <td className="p-4 text-gray-700">{equipo.registro?.campusUvmCercano || "—"}</td>
                    <td className="p-4 text-gray-600">
                      {equipo.registro?.email || equipo.representante?.correo}<br />
                      <span className="text-gray-400">{equipo.registro?.numeroTelefonico || equipo.representante?.telefono}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          completo
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {completo && <CheckCircle2 size={13} />}
                        {subidos} / {totalDocs}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => { setEditando(equipo); setModal(true); }} className="inline-flex items-center gap-1 text-gray-600 hover:text-[#c8102e] transition">
                          <Pencil size={15} /> Editar
                        </button>
                        <button onClick={() => eliminar(equipo.id)} className="inline-flex items-center gap-1 text-gray-600 hover:text-red-700 transition">
                          <Trash2 size={15} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <FolderKanban className="mx-auto text-gray-300" size={42} />
                    <p className="text-gray-500 mt-3">
                      {equipos.length === 0 ? "Todavía no hay proyectos registrados." : "Ningún proyecto coincide con los filtros."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ModalEquipo equipo={editando} onClose={() => setModal(false)} />}
      {importar && <ModalImportarEquipos onClose={() => setImportar(false)} />}
    </main>
  );
}
