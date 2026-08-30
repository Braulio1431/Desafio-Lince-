"use client";

import { TipoEntrega } from "@/types";

const TIPOS: { valor: TipoEntrega | "todos"; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "video", etiqueta: "Video" },
  { valor: "pdf", etiqueta: "PDF" },
  { valor: "doc", etiqueta: "Doc" },
  { valor: "excel", etiqueta: "Excel" },
  { valor: "csv", etiqueta: "CSV" },
  { valor: "link", etiqueta: "Link" },
];

export function FiltroTipoArchivo({
  valorActual,
  onChange,
}: {
  valorActual: TipoEntrega | "todos";
  onChange: (valor: TipoEntrega | "todos") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIPOS.map((tipo) => (
        <button
          key={tipo.valor}
          onClick={() => onChange(tipo.valor)}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            valorActual === tipo.valor
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
          }`}
        >
          {tipo.etiqueta}
        </button>
      ))}
    </div>
  );
}