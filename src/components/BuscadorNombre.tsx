"use client";

import { Search } from "lucide-react";

export function BuscadorNombre({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="relative w-full md:w-80">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por equipo o archivo..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D7282F] focus:border-[#D7282F]"
      />
    </div>
  );
}