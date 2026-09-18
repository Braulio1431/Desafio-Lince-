"use client";

import { useState } from "react";
import { Equipo, Usuario } from "@/types";
import { asignarMaestros } from "@/lib/equipos";
import { X, Check } from "lucide-react";

export function ModalAsignarMaestros({
  equipo,
  maestros,
  onClose,
}: {
  equipo: Equipo;
  maestros: Usuario[];
  onClose: () => void;
}) {
  const [seleccion, setSeleccion] = useState<string[]>(equipo.maestrosAsignados ?? []);
  const [guardando, setGuardando] = useState(false);

  function toggle(uid: string) {
    setSeleccion((actual) =>
      actual.includes(uid) ? actual.filter((u) => u !== uid) : [...actual, uid]
    );
  }

  async function guardar() {
    setGuardando(true);
    try {
      await asignarMaestros(equipo.id, seleccion);
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 border border-gray-200 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Asignar maestros evaluadores</h2>
            <p className="text-sm text-gray-500 mt-1">
              {equipo.registro?.nombreProyecto || equipo.nombreEquipo}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y border rounded-lg">
          {maestros.map((m) => {
            const activo = seleccion.includes(m.uid);
            return (
              <button
                type="button"
                key={m.uid}
                onClick={() => toggle(m.uid)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${
                  activo ? "bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.nombre || "Sin nombre"}</p>
                  <p className="text-xs text-gray-500">{m.correo}</p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    activo ? "bg-[#c8102e] border-[#c8102e]" : "border-gray-300"
                  }`}
                >
                  {activo && <Check size={13} className="text-white" />}
                </span>
              </button>
            );
          })}
          {maestros.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-400">
              No hay maestros registrados. Crea usuarios con rol "maestro" primero.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="px-4 py-2 rounded-lg bg-[#c8102e] text-white hover:bg-[#a50d26] disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar asignación"}
          </button>
        </div>
      </div>
    </div>
  );
}