"use client";

import { RutaProtegida } from "@/components/RutaProtegida";
import { MaestroTopbar } from "@/components/MaestroTopbar";

export default function MaestroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RutaProtegida rolRequerido="maestro">
      <div className="min-h-screen bg-gray-50">
        <MaestroTopbar />
        {children}
      </div>
    </RutaProtegida>
  );
}