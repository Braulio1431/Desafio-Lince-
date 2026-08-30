"use client";

import { useState } from "react";
import { Equipo, Integrante } from "@/types";
import { crearEquipo, actualizarEquipo } from "@/lib/equipos";
import { X } from "lucide-react";

const INTEGRANTE_VACIO: Integrante = { nombre: "", apellido: "", matricula: "" };
const inputClass =
  "px-3 py-2 border border-gray-300 rounded-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D7282F] focus:border-[#D7282F]";

export function ModalEquipo({
  equipo,
  onClose,
}: {
  equipo: Equipo | null;
  onClose: () => void;
}) {
  const [nombreEquipo, setNombreEquipo] = useState(equipo?.nombreEquipo ?? "");
  const [integrantes, setIntegrantes] = useState<Integrante[]>(
    equipo?.integrantes?.length ? equipo.integrantes : [{ ...INTEGRANTE_VACIO }]
  );
  const [repNombre, setRepNombre] = useState(equipo?.representante?.nombre ?? "");
  const [repTelefono, setRepTelefono] = useState(equipo?.representante?.telefono ?? "");
  const [repCorreo, setRepCorreo] = useState(equipo?.representante?.correo ?? "");
  const [guardando, setGuardando] = useState(false);

  function actualizarIntegrante(i: number, campo: keyof Integrante, valor: string) {
    setIntegrantes((prev) =>
      prev.map((int, idx) => (idx === i ? { ...int, [campo]: valor } : int))
    );
  }

  function agregarIntegrante() {
    setIntegrantes((prev) => [...prev, { ...INTEGRANTE_VACIO }]);
  }

  function quitarIntegrante(i: number) {
    setIntegrantes((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleGuardar() {
    setGuardando(true);
    const data = {
      nombreEquipo,
      integrantes,
      representante: { nombre: repNombre, telefono: repTelefono, correo: repCorreo },
      fechaAlta: equipo?.fechaAlta ?? new Date().toISOString(),
    };

    if (equipo) {
      await actualizarEquipo(equipo.id, data);
    } else {
      await crearEquipo(data);
    }
    setGuardando(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-none p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {equipo ? "Editar equipo" : "Nuevo equipo"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del equipo
          </label>
          <input
            value={nombreEquipo}
            onChange={(e) => setNombreEquipo(e.target.value)}
            className={`w-full ${inputClass}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Integrantes</label>
          <div className="space-y-2">
            {integrantes.map((int, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Nombre"
                  value={int.nombre}
                  onChange={(e) => actualizarIntegrante(i, "nombre", e.target.value)}
                  className={`flex-1 text-sm ${inputClass}`}
                />
                <input
                  placeholder="Apellido"
                  value={int.apellido}
                  onChange={(e) => actualizarIntegrante(i, "apellido", e.target.value)}
                  className={`flex-1 text-sm ${inputClass}`}
                />
                <input
                  placeholder="Matrícula"
                  value={int.matricula}
                  onChange={(e) => actualizarIntegrante(i, "matricula", e.target.value)}
                  className={`flex-1 text-sm ${inputClass}`}
                />
                <button
                  onClick={() => quitarIntegrante(i)}
                  className="text-gray-400 hover:text-red-600 px-2"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={agregarIntegrante}
            type="button"
            className="text-sm text-[#D7282F] font-medium mt-2"
          >
            + Agregar integrante
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Representante</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              placeholder="Nombre"
              value={repNombre}
              onChange={(e) => setRepNombre(e.target.value)}
              className={`text-sm ${inputClass}`}
            />
            <input
              placeholder="Teléfono"
              value={repTelefono}
              onChange={(e) => setRepTelefono(e.target.value)}
              className={`text-sm ${inputClass}`}
            />
            <input
              placeholder="Correo"
              value={repCorreo}
              onChange={(e) => setRepCorreo(e.target.value)}
              className={`text-sm ${inputClass}`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-none border border-gray-300 text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || !nombreEquipo}
            type="button"
            className="px-4 py-2 rounded-none bg-[#D7282F] text-white hover:bg-[#B91F26] disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}