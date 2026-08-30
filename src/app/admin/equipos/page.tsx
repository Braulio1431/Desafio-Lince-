"use client";

import { useEffect, useState } from "react";
import { escucharEquipos, eliminarEquipo } from "@/lib/equipos";
import { Equipo } from "@/types";
import { ModalEquipo } from "@/components/ModalEquipo";
import { ModalImportarEquipos } from "@/components/ModalImportarEquipos";
import { Upload, Plus, Pencil, Trash2 } from "lucide-react";

export default function EquiposAdminPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState<Equipo | null>(null);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);

  useEffect(() => {
    const unsub = escucharEquipos(setEquipos);
    return () => unsub();
  }, []);

  function abrirCrear() {
    setEquipoEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(equipo: Equipo) {
    setEquipoEditando(equipo);
    setModalAbierto(true);
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar este equipo? Esta acción no se puede deshacer.")) return;
    await eliminarEquipo(id);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Equipos ({equipos.length})</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setModalImportarAbierto(true)}
            className="flex items-center gap-2 border border-[#D7282F] text-[#D7282F] px-4 py-2 rounded-none text-sm font-medium hover:bg-[#D7282F]/5"
          >
            <Upload size={16} />
            Importar Excel
          </button>
          <button
            onClick={abrirCrear}
            className="flex items-center gap-2 bg-[#D7282F] text-white px-4 py-2 rounded-none text-sm font-medium hover:bg-[#B91F26]"
          >
            <Plus size={16} />
            Nuevo equipo
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-none overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 text-gray-700">Equipo</th>
              <th className="p-3 text-gray-700">Integrantes</th>
              <th className="p-3 text-gray-700">Representante</th>
              <th className="p-3 text-gray-700">Contacto</th>
              <th className="p-3 text-right text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo) => (
              <tr key={equipo.id} className="border-t border-gray-200">
                <td className="p-3 font-medium text-gray-900">{equipo.nombreEquipo}</td>
                <td className="p-3 text-gray-600">
                  {equipo.integrantes?.length ?? 0} integrante(s)
                </td>
                <td className="p-3 text-gray-900">{equipo.representante?.nombre}</td>
                <td className="p-3 text-gray-600">
                  {equipo.representante?.correo}
                  <br />
                  {equipo.representante?.telefono}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => abrirEditar(equipo)}
                      className="flex items-center gap-1 text-gray-600 hover:text-[#D7282F] text-sm"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(equipo.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {equipos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Aún no hay equipos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <ModalEquipo equipo={equipoEditando} onClose={() => setModalAbierto(false)} />
      )}

      {modalImportarAbierto && (
        <ModalImportarEquipos onClose={() => setModalImportarAbierto(false)} />
      )}
    </div>
  );
}