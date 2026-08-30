"use client";

import { useEffect, useMemo, useState } from "react";
import { escucharEntregas, eliminarEntrega } from "@/lib/entregas";
import { escucharUsuarios } from "@/lib/usuarios";
import { Entrega, TipoEntrega, Usuario } from "@/types";
import { FiltroTipoArchivo } from "@/components/FiltroTipoArchivo";
import { BuscadorNombre } from "@/components/BuscadorNombre";
import { ModalEntrega } from "@/components/ModalEntrega";
import { ModalImportarArchivos } from "@/components/ModalImportarArchivos";
import { Upload, Pencil, Trash2 } from "lucide-react";

export default function EntregasAdminPage() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<TipoEntrega | "todos">("todos");
  const [entregaEditando, setEntregaEditando] = useState<Entrega | null>(null);
  const [modalMigrarAbierto, setModalMigrarAbierto] = useState(false);

  useEffect(() => {
    const unsub1 = escucharEntregas(setEntregas);
    const unsub2 = escucharUsuarios(setUsuarios);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const mapaUsuarios = useMemo(() => {
    const mapa = new Map<string, string>();
    usuarios.forEach((u) => mapa.set(u.uid, u.nombre));
    return mapa;
  }, [usuarios]);

  const entregasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return entregas.filter((e) => {
      const coincideTexto =
        !texto ||
        e.nombreEquipo.toLowerCase().includes(texto) ||
        e.nombreArchivo.toLowerCase().includes(texto);
      const coincideTipo = tipo === "todos" || e.tipo === tipo;
      return coincideTexto && coincideTipo;
    });
  }, [entregas, busqueda, tipo]);

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta entrega? Esta acción no se puede deshacer.")) return;
    await eliminarEntrega(id);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Entregas ({entregas.length})</h1>
        <button
          onClick={() => setModalMigrarAbierto(true)}
          className="flex items-center gap-2 bg-[#D7282F] text-white px-4 py-2 rounded-none text-sm font-medium hover:bg-[#B91F26]"
        >
          <Upload size={16} />
          Migrar archivos
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <BuscadorNombre valor={busqueda} onChange={setBusqueda} />
        <FiltroTipoArchivo valorActual={tipo} onChange={setTipo} />
      </div>

      <div className="bg-white border border-gray-200 rounded-none overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 text-gray-700">Equipo</th>
              <th className="p-3 text-gray-700">Archivo</th>
              <th className="p-3 text-gray-700">Tipo</th>
              <th className="p-3 text-gray-700">Subido por</th>
              <th className="p-3 text-gray-700">Estado</th>
              <th className="p-3 text-right text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entregasFiltradas.map((entrega) => (
              <tr key={entrega.id} className="border-t border-gray-200">
                <td className="p-3 font-medium text-gray-900">{entrega.nombreEquipo}</td>
                <td className="p-3 text-gray-900">{entrega.nombreArchivo}</td>
                <td className="p-3 capitalize text-gray-700">{entrega.tipo}</td>
                <td className="p-3 text-gray-600">
                  {mapaUsuarios.get(entrega.subidoPor) ?? entrega.subidoPor}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-none ${
                      entrega.estado === "calificado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {entrega.estado}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEntregaEditando(entrega)}
                      className="flex items-center gap-1 text-gray-600 hover:text-[#D7282F] text-sm"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(entrega.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {entregasFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No hay entregas que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {entregaEditando && (
        <ModalEntrega entrega={entregaEditando} onClose={() => setEntregaEditando(null)} />
      )}

      {modalMigrarAbierto && (
        <ModalImportarArchivos onClose={() => setModalMigrarAbierto(false)} />
      )}
    </div>
  );
}