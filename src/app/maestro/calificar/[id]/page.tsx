"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { actualizarEntrega } from "@/lib/entregas";
import { guardarCalificacion } from "@/lib/calificaciones";
 import { CriterioRubrica, Entrega } from "@/types";
import { PONDERACION_RUBRICAS, rubricasIniciales } from "@/lib/rubricas";

export default function CalificarPage() {
  const params = useParams<{ id: string }>(); const router = useRouter();
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [rubrica, setRubrica] = useState<CriterioRubrica[]>(rubricasIniciales().planNegocios.map((c) => ({ ...c, puntosObtenidos: 0 })));
  const [comentarios, setComentarios] = useState(""); const [guardando, setGuardando] = useState(false);
 const [recomendado, setRecomendado] = useState(false);
  useEffect(() => { getDoc(doc(db, "entregas", params.id)).then((s) => s.exists() && setEntrega({ id: s.id, ...s.data() } as Entrega)); }, [params.id]);
  if (!entrega) return <div className="p-6 text-gray-500">Cargando entrega...</div>;
 async function guardar() { setGuardando(true); await guardarCalificacion({ entregaId: entrega!.id, equipoId: entrega!.equipoId, documentoClave: "planNegocios", nombreDocumento: "Plan de Negocios", nombreEquipo: entrega!.nombreEquipo, rubrica, comentarios, recomendadoFinal: recomendado, pesoRubrica: PONDERACION_RUBRICAS.planNegocios }); await actualizarEntrega(entrega!.id, { estado: "calificado" }); router.push("/maestro/dashboard"); }
  return <div className="p-6 max-w-3xl mx-auto space-y-6"><div><h1 className="text-2xl font-bold">Evaluar entrega</h1><p className="text-gray-500">{entrega.nombreEquipo} · {entrega.nombreArchivo}</p></div><div className="bg-white border rounded-xl divide-y">{rubrica.map((criterio, i) => <div key={criterio.criterio} className="p-4 flex items-center justify-between gap-4"><div><p className="font-medium">{i + 1}. {criterio.criterio}</p><p className="text-xs text-gray-500">Máximo {criterio.puntosMax} puntos</p></div><input type="number" min="0" max={criterio.puntosMax} value={criterio.puntosObtenidos} onChange={(e) => setRubrica((r) => r.map((c, n) => n === i ? { ...c, puntosObtenidos: Math.min(criterio.puntosMax, Math.max(0, Number(e.target.value))) } : c))} className="w-20 border px-3 py-2" /></div>)}</div><textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} placeholder="Comentarios para el equipo" className="w-full min-h-28 border px-3 py-2" />
 <label className="flex items-start gap-3 border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer"><input type="checkbox" checked={recomendado} onChange={(e) => setRecomendado(e.target.checked)} className="mt-1 w-4 h-4 accent-[#D7282F]" /><span><span className="font-medium text-gray-900 block">¿Recomienda que el equipo llegue a la final?</span><span className="text-xs text-gray-500">Suma un extra al puntaje global del equipo en el ranking.</span></span></label>
  <div className="flex justify-end gap-2"><button onClick={() => router.back()} className="border px-4 py-2">Cancelar</button><button onClick={guardar} disabled={guardando} className="bg-[#D7282F] text-white px-4 py-2 disabled:opacity-50">{guardando ? "Guardando..." : "Guardar evaluación"}</button></div></div>;
}
