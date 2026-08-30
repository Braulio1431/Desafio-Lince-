"use client";

import { useState } from "react";
import { Entrega, TipoEntrega, EstadoEntrega } from "@/types";
import { actualizarEntrega } from "@/lib/entregas";

const TIPOS: TipoEntrega[] = ["video", "pdf", "doc", "excel", "csv", "link"];
const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D7282F] focus:border-[#D7282F]";

export function ModalEntrega({
  entrega,
  onClose,
}: {
  entrega: Entrega;
  onClose: () => void;
}) {
  const [nombreArchivo, setNombreArchivo] = useState(entrega.nombreArchivo);
  const [tipo, setTipo] = useState<TipoEntrega>(entrega.tipo);
  const [estado, setEstado] = useState<EstadoEntrega>(entrega.estado);
  const [link, setLink] = useState(entrega.link ?? "");
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    setGuardando(true);
    await actualizarEntrega(entrega.id, {
      nombreArchivo,
      tipo,
      estado,
      ...(tipo === "link" ? { link } : {}),
    });
    setGuardando(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-none p-6 w-full max-w-md space-y-4 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Editar entrega</h2>
        <p className="text-sm text-gray-500">Equipo: {entrega.nombreEquipo}</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del archivo
          </label>
          <input
            value={nombreArchivo}
            onChange={(e) => setNombreArchivo(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoEntrega)}
            className={inputClass}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {tipo === "link" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} className={inputClass} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoEntrega)}
            className={inputClass}
          >
            <option value="pendiente">Pendiente</option>
            <option value="calificado">Calificado</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-none border border-gray-300 text-gray-700">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-2 rounded-none bg-[#D7282F] text-white hover:bg-[#B91F26] disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}