"use client";

import { Entrega } from "@/types";
import Link from "next/link";

const ICONOS: Record<Entrega["tipo"], string> = {
  video: "🎬",
  pdf: "📄",
  doc: "📝",
  excel: "📊",
  csv: "🧮",
  link: "🔗",
};

export function TarjetaEntrega({ entrega }: { entrega: Entrega }) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition bg-white">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{ICONOS[entrega.tipo]}</span>
        <div>
          <p className="font-semibold">{entrega.nombreEquipo}</p>
          <p className="text-sm text-gray-500">{entrega.nombreArchivo}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            entrega.estado === "calificado"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {entrega.estado === "calificado" ? "Calificado" : "Pendiente"}
        </span>
        <Link
          href={`/maestro/calificar/${entrega.id}`}
          className="text-sm font-medium underline"
        >
          {entrega.estado === "calificado" ? "Ver" : "Calificar"}
        </Link>
      </div>
    </div>
  );
}