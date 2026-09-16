"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardMaestro() {
  const router = useRouter();
  useEffect(() => router.replace("/maestro/proyectos"), [router]);
  return <main className="p-8 text-gray-500">Cargando proyectos...</main>;
}
