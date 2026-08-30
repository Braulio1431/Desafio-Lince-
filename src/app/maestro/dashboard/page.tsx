"use client";

import { useEffect, useMemo, useState } from "react";
import { escucharEntregas } from "@/lib/entregas";
import { Entrega, TipoEntrega } from "@/types";
import { FiltroTipoArchivo } from "@/components/FiltroTipoArchivo";
import { BuscadorNombre } from "@/components/BuscadorNombre";
import { TarjetaEntrega } from "@/components/TarjetaEntrega";

export default function DashboardMaestro() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<TipoEntrega | "todos">("todos");
  const [estado, setEstado] = useState<"todos" | "pendiente" | "calificado">(
    "todos"
  );

  useEffect(() => {
    const unsub = escucharEntregas(setEntregas);
    return () => unsub();
  }, []);

  const entregasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return entregas.filter((e) => {
      const coincideTexto =
        !texto ||
        e.nombreEquipo.toLowerCase().includes(texto) ||
        e.nombreArchivo.toLowerCase().includes(texto);
      const coincideTipo = tipo === "todos" || e.tipo === tipo;
      const coincideEstado = estado === "todos" || e.estado === estado;
      return coincideTexto && coincideTipo && coincideEstado;
    });
  }, [entregas, busqueda, tipo, estado]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Entregas por calificar</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <BuscadorNombre valor={busqueda} onChange={setBusqueda} />
        <FiltroTipoArchivo valorActual={tipo} onChange={setTipo} />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as typeof estado)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="calificado">Calificados</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">
        {entregasFiltradas.length} de {entregas.length} entregas
      </p>

      <div className="grid gap-3">
        {entregasFiltradas.map((entrega) => (
          <TarjetaEntrega key={entrega.id} entrega={entrega} />
        ))}
        {entregasFiltradas.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No se encontraron entregas con esos filtros.
          </p>
        )}
      </div>
    </div>
  );
}