"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { guardarCalificacion, obtenerCalificacionMaestro } from "@/lib/calificaciones";
import { CriterioRubrica, DOCUMENTOS_EQUIPO, Equipo, RUBRICA_GENERICA } from "@/types";
import { ArrowLeft, CheckCircle2, ExternalLink, ThumbsUp } from "lucide-react";

export default function EvaluarProyectoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [documento, setDocumento] = useState<"documento1" | "documento2" | "documento3">("documento1");
  const [rubrica, setRubrica] = useState<CriterioRubrica[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [recomendado, setRecomendado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [yaCalifico, setYaCalifico] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, "equipos", id)),
      getDoc(doc(db, "configuracion", "rubrica")),
      obtenerCalificacionMaestro(id, documento),
    ]).then(([proyecto, configuracion, calificacion]) => {
      if (proyecto.exists()) setEquipo({ id: proyecto.id, ...proyecto.data() } as Equipo);
      const criterios = configuracion.exists() ? configuracion.data().rubricas?.[documento] : null;
      setRubrica(
        (Array.isArray(criterios) ? criterios : RUBRICA_GENERICA).map(
          (c: { criterio: string; puntosMax: number }) => ({ ...c, puntosObtenidos: 0 }),
        ),
      );
      setYaCalifico(Boolean(calificacion));
      setRecomendado(Boolean((calificacion as { recomendadoFinal?: boolean } | null)?.recomendadoFinal));
    });
  }, [id, documento]);

  if (!equipo) return <main className="p-8 text-gray-500">Cargando proyecto...</main>;

  const seleccionado = equipo.documentos?.find((d) => d.clave === documento);

  const actualizaPunto = (index: number, valor: number) =>
    setRubrica((r) =>
      r.map((c, i) =>
        i === index ? { ...c, puntosObtenidos: Math.max(0, Math.min(c.puntosMax, valor || 0)) } : c,
      ),
    );

  async function guardar() {
    setGuardando(true);
    try {
      await guardarCalificacion({
        entregaId: `${equipo!.id}_${documento}`,
        equipoId: equipo!.id,
        documentoClave: documento,
        nombreDocumento: DOCUMENTOS_EQUIPO.find((d) => d.clave === documento)?.nombre ?? documento,
        nombreEquipo: equipo!.nombreEquipo,
        codigoProyecto: equipo!.codigoProyecto,
        nombreProyecto: equipo!.registro?.nombreProyecto,
        rubrica,
        comentarios,
        recomendadoFinal: recomendado,
      });
      setYaCalifico(true);
      setMensaje("Evaluación guardada correctamente.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo guardar la evaluación.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-[#c8102e] flex items-center gap-2">
        <ArrowLeft size={16} /> Volver a proyectos
      </button>

      <div className="bg-white border border-gray-200 p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#c8102e]">{equipo.codigoProyecto}</span>
            <h1 className="text-3xl font-bold text-[#202124] mt-2">
              {equipo.registro?.nombreProyecto || equipo.nombreEquipo}
            </h1>
            <p className="text-gray-500">
              {equipo.nombreEquipo} · {equipo.registro?.nombreCompleto || equipo.representante?.nombre}
            </p>
          </div>
          <div className="text-sm text-gray-500">{equipo.registro?.carreraLider || "Carrera no registrada"}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white border border-gray-200 p-4 h-fit">
          <h2 className="font-bold text-[#202124] mb-3">Documentos del proyecto</h2>
          {DOCUMENTOS_EQUIPO.map(({ clave, nombre }) => {
            const d = equipo!.documentos?.find((x) => x.clave === clave);
            return (
              <button
                key={clave}
                onClick={() => setDocumento(clave)}
                className={`w-full text-left p-3 mb-2 border ${documento === clave ? "border-[#c8102e] bg-red-50" : "border-gray-200"}`}
              >
                <span className="block text-sm font-semibold text-gray-800">{nombre}</span>
                <span className="text-xs text-gray-500">{d?.link ? "Enlace disponible" : "Sin enlace"}</span>
              </button>
            );
          })}
        </aside>

        <section className="bg-white border border-gray-200 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#202124]">
                Evaluación · {DOCUMENTOS_EQUIPO.find((d) => d.clave === documento)?.nombre}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Asigna los puntos definidos por administración.</p>
              {yaCalifico && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mt-3">
                  Ya calificaste este documento. Cada maestro sólo puede evaluarlo una vez.
                </p>
              )}
            </div>
            {seleccionado?.link && (
              <a
                href={seleccionado.link}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#c8102e] font-semibold flex items-center gap-1"
              >
                Abrir documento <ExternalLink size={15} />
              </a>
            )}
          </div>

          <div className="divide-y border border-gray-200">
            {rubrica.map((c, index) => (
              <div key={c.criterio} className="p-3 flex items-center justify-between gap-4">
                <span className="text-sm text-gray-800">
                  {index + 1}. {c.criterio}
                </span>
                <input
                  type="number"
                  min="0"
                  max={c.puntosMax}
                  value={c.puntosObtenidos}
                  onChange={(e) => actualizaPunto(index, Number(e.target.value))}
                  disabled={yaCalifico}
                  className="w-20 border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-100"
                />
              </div>
            ))}
          </div>

          <label
            className={[
              "flex items-center gap-3 border px-4 py-3 cursor-pointer select-none",
              recomendado ? "border-green-500 bg-green-50" : "border-gray-200 bg-white",
              yaCalifico ? "opacity-60 cursor-not-allowed" : "hover:border-green-400",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={recomendado}
              onChange={(e) => setRecomendado(e.target.checked)}
              disabled={yaCalifico}
              className="h-4 w-4 accent-green-600"
            />
            <ThumbsUp size={18} className={recomendado ? "text-green-600" : "text-gray-400"} />
            <span className="text-sm font-medium text-gray-800">
              Recomendar este proyecto como finalista
            </span>
          </label>

          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            disabled={yaCalifico}
            placeholder="Comentarios y recomendaciones"
            className="w-full min-h-28 border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 disabled:bg-gray-100"
          />

          <div className="flex items-center justify-between">
            <span className="font-bold text-[#202124]">
              Total: {rubrica.reduce((sum, c) => sum + c.puntosObtenidos, 0)} /{" "}
              {rubrica.reduce((sum, c) => sum + c.puntosMax, 0)}
            </span>
            <button
              onClick={guardar}
              disabled={yaCalifico || guardando}
              className="bg-[#c8102e] text-white px-5 py-2.5 font-semibold disabled:opacity-50"
            >
              {guardando ? "Guardando..." : yaCalifico ? "Ya evaluado" : "Guardar evaluación"}
            </button>
          </div>

          {mensaje && (
            <p className="text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 size={16} /> {mensaje}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}