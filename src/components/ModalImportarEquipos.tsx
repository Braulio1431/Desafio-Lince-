"use client";

import { useState } from "react";
import { parsearExcelEquipos, importarEquiposMasivo } from "@/lib/importarEquipos";
import { Equipo } from "@/types";
import { FileSpreadsheet } from "lucide-react";

export function ModalImportarEquipos({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<Omit<Equipo, "id">[]>([]);
  const [error, setError] = useState("");
  const [importando, setImportando] = useState(false);
  const [hecho, setHecho] = useState(false);

  async function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const equipos = await parsearExcelEquipos(file);
      if (equipos.length === 0) {
        setError("No se encontraron equipos válidos en el archivo.");
        return;
      }
      setPreview(equipos);
    } catch {
      setError("No se pudo leer el archivo. Verifica que sea un .xlsx o .csv válido.");
    }
  }

  async function handleConfirmar() {
    setImportando(true);
    await importarEquiposMasivo(preview);
    setImportando(false);
    setHecho(true);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-none p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-[#D7282F]" />
          Importar equipos desde Excel
        </h2>

        {hecho ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-green-700 font-medium">
              {preview.length} equipos importados correctamente.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-none bg-[#D7282F] text-white hover:bg-[#B91F26]"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Columnas esperadas: nombreEquipo, nombreIntegrante, apellidoIntegrante,
              matricula, esRepresentante (si/no), telefonoRepresentante, correoRepresentante.
              Una fila por integrante.
            </p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleArchivo}
              className="block w-full text-sm text-gray-700"
            />

            {error && (
              <p className="text-red-700 text-sm bg-red-50 border border-red-200 p-2 rounded-none">
                {error}
              </p>
            )}

            {preview.length > 0 && (
              <div className="border border-gray-200 rounded-none overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-left sticky top-0">
                    <tr>
                      <th className="p-2 text-gray-700">Equipo</th>
                      <th className="p-2 text-gray-700">Integrantes</th>
                      <th className="p-2 text-gray-700">Representante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((equipo, i) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="p-2 font-medium text-gray-900">{equipo.nombreEquipo}</td>
                        <td className="p-2 text-gray-600">
                          {equipo.integrantes.length} integrante(s)
                        </td>
                        <td className="p-2 text-gray-600">
                          {equipo.representante.nombre || "— sin marcar —"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 rounded-none border border-gray-300 text-gray-700">
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={preview.length === 0 || importando}
                className="px-4 py-2 rounded-none bg-[#D7282F] text-white hover:bg-[#B91F26] disabled:opacity-50"
              >
                {importando ? "Importando..." : `Importar ${preview.length} equipos`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}