"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClaveRubrica, CriterioRubrica, DOCUMENTOS_EQUIPO, RUBRICAS_ESPECIALES } from "@/types";
import { PONDERACION_RUBRICAS, prepararRubricaParaCategoria, rubricasIniciales } from "@/lib/rubricas";
import { Save } from "lucide-react";

export default function RubricasAdminPage() {
  const [rubricas, setRubricas] = useState(rubricasIniciales());
  const [documento, setDocumento] = useState<ClaveRubrica>(DOCUMENTOS_EQUIPO[0].clave);
  const [guardando, setGuardando] = useState(false); const [mensaje, setMensaje] = useState("");
  useEffect(() => { getDoc(doc(db, "configuracion", "rubrica")).then((s) => { const base = rubricasIniciales(); const guardadas = s.exists() ? s.data().rubricas : {}; setRubricas({ ...base, ...guardadas, planNegocios: prepararRubricaParaCategoria(guardadas?.planNegocios ?? base.planNegocios) }); }); }, []);
  function cambiar(i: number, valor: string) { setRubricas((r) => ({ ...r, [documento]: r[documento].map((c, n) => n === i ? { ...c, criterio: valor } : c) })); }
  async function guardar() { setGuardando(true); await setDoc(doc(db, "configuracion", "rubrica"), { rubricas }); setMensaje("Las cuatro rúbricas quedaron guardadas."); setGuardando(false); }
  const actual = rubricas[documento];
  const todasLasRubricas = [...DOCUMENTOS_EQUIPO, ...RUBRICAS_ESPECIALES];
  return <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6"><div><p className="text-sm text-[#c8102e] font-semibold uppercase tracking-wider">Configuración administrativa</p><h1 className="text-3xl font-bold text-[#202124]">Rúbricas de evaluación</h1><p className="text-gray-500 mt-2">La evaluación final suma 100 puntos: Plan 30, CANVAS 20, Financiero 20, Video 10, Categoría 10 y ESG/Sostenibilidad 10.</p></div><div className="grid grid-cols-2 lg:grid-cols-3 gap-2">{todasLasRubricas.map(({ clave, nombre }) => <button key={clave} onClick={() => setDocumento(clave)} className={`px-4 py-3 text-sm font-semibold border text-left ${documento === clave ? "bg-[#c8102e] text-white border-[#c8102e]" : "bg-white text-gray-700 border-gray-300"}`}>{nombre}<span className="block text-xs font-normal opacity-80">{PONDERACION_RUBRICAS[clave]} puntos · {rubricas[clave].length} criterios</span></button>)}</div><section className="bg-white border border-gray-200"><div className="p-4 border-b"><h2 className="font-bold text-lg">{todasLasRubricas.find((d) => d.clave === documento)?.nombre}</h2><p className="text-sm text-gray-500">Las puntuaciones se normalizan al peso asignado a esta rúbrica.</p></div><div className="divide-y">{actual.map((c: Omit<CriterioRubrica, "puntosObtenidos"> & { niveles?: string[] }, i) => <div key={i} className="p-4 grid grid-cols-[32px_1fr] gap-3 items-start"><span className="w-8 h-8 rounded-full bg-red-50 text-[#c8102e] flex items-center justify-center font-bold text-sm">{i + 1}</span><div><input value={c.criterio} onChange={(e) => cambiar(i, e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-gray-900 font-semibold"/><div className="grid sm:grid-cols-5 gap-2 mt-2">{(c.niveles ?? []).map((nivel, n) => <div key={n} className="text-xs bg-gray-50 border border-gray-200 p-2"><b>Nivel {n + 1}</b><p className="mt-1 text-gray-600">{nivel}</p></div>)}</div></div></div>)}</div></section><div className="flex items-center gap-4"><button onClick={guardar} disabled={guardando} className="bg-[#c8102e] text-white px-5 py-2.5 font-semibold flex items-center gap-2 disabled:opacity-50"><Save size={17}/>{guardando ? "Guardando..." : "Guardar rúbricas"}</button>{mensaje && <span className="text-sm text-green-700">{mensaje}</span>}</div></main>;
}
