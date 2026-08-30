"use client";

import { useEffect, useState } from "react";
import { escucharEquipos } from "@/lib/equipos";
import { Equipo } from "@/types";
import { detectarEquipo, subirArchivoEntrega } from "@/lib/importarArchivos";
import { detectarTipoArchivo } from "@/lib/tipoArchivo";

interface FilaArchivo {
  file: File;
  equipoId: string;
  estado: "pendiente" | "subiendo" | "listo" | "error";
}

export function ModalImportarArchivos({ onClose }: { onClose: () => void }) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [filas, setFilas] = useState<FilaArchivo[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    const unsub = escucharEquipos(setEquipos);
    return () => unsub();
  }, []);

  function procesarArchivos(files: FileList) {
    const nuevasFilas: FilaArchivo[] = Array.from(files).map((file) => {
      const rutaRelativa = (file as unknown as { webkitRelativePath?: string })
        .webkitRelativePath;
      const referencia = rutaRelativa ? rutaRelativa.split("/")[0] : file.name;
      const equipoDetectado = detectarEquipo(referencia, equipos);

      return {
        file,
        equipoId: equipoDetectado?.id ?? "",
        estado: "pendiente" as const,
      };
    });
    setFilas(nuevasFilas);
  }

  function actualizarEquipoFila(index: number, equipoId: string) {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, equipoId } : f)));
  }

  async function handleSubirTodo() {
    setSubiendo(true);
    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      if (!fila.equipoId) continue;
      const equipo = equipos.find((eq) => eq.id === fila.equipoId);
      if (!equipo) continue;

      setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, estado: "subiendo" } : f)));
      try {
        await subirArchivoEntrega(fila.file, equipo.id, equipo.nombreEquipo);
        setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, estado: "listo" } : f)));
      } catch {
        setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, estado: "error" } : f)));
      }
    }
    setSubiendo(false);
  }

  const sinEquipo = filas.filter((f) => !f.equipoId).length;
  const listos = filas.filter((f) => f.estado === "listo").length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold">Migrar archivos existentes</h2>
        <p className="text-sm text-gray-500">
          Selecciona una carpeta (una subcarpeta por equipo) o archivos sueltos.
          Intentamos adivinar el equipo por el nombre — revisa y corrige el
          selector de cada fila antes de subir.
        </p>

        <div className="flex gap-3">
          <label className="border border-black px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
            Seleccionar carpeta
            <input
              type="file"
              multiple
              // @ts-expect-error atributo no estándar pero soportado por navegadores Chromium/Firefox
              webkitdirectory=""
              className="hidden"
              onChange={(e) => e.target.files && procesarArchivos(e.target.files)}
            />
          </label>
          <label className="border border-black px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
            Seleccionar archivos sueltos
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && procesarArchivos(e.target.files)}
            />
          </label>
        </div>

        {filas.length > 0 && (
          <>
            <p className="text-sm text-gray-600">
              {filas.length} archivos · {sinEquipo} sin equipo asignado · {listos} subidos
            </p>

            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left sticky top-0">
                  <tr>
                    <th className="p-2">Archivo</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Equipo</th>
                    <th className="p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{fila.file.name}</td>
                      <td className="p-2 capitalize">{detectarTipoArchivo(fila.file.name)}</td>
                      <td className="p-2">
                        <select
                          value={fila.equipoId}
                          onChange={(e) => actualizarEquipoFila(i, e.target.value)}
                          className={`px-2 py-1 border rounded text-xs ${
                            !fila.equipoId ? "border-red-400 bg-red-50" : ""
                          }`}
                        >
                          <option value="">— sin asignar —</option>
                          {equipos.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                              {eq.nombreEquipo}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        {fila.estado === "pendiente" && "—"}
                        {fila.estado === "subiendo" && "Subiendo..."}
                        {fila.estado === "listo" && "✅"}
                        {fila.estado === "error" && "❌"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cerrar
          </button>
          <button
            onClick={handleSubirTodo}
            disabled={filas.length === 0 || subiendo || sinEquipo === filas.length}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            {subiendo ? "Subiendo..." : `Subir ${filas.length - sinEquipo} archivos`}
          </button>
        </div>
      </div>
    </div>
  );
}