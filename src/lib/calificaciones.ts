import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ClaveDocumento, CriterioRubrica } from "@/types";

function idCalificacion(equipoId: string, documentoClave: ClaveDocumento, maestroId: string) {
  return `${equipoId}_${documentoClave}_${maestroId}`;
}

export async function obtenerCalificacionMaestro(equipoId: string, documentoClave: ClaveDocumento) {
  const maestroId = auth.currentUser?.uid;
  if (!maestroId) return null;
  const resultado = await getDoc(doc(db, "calificaciones", idCalificacion(equipoId, documentoClave, maestroId)));
  return resultado.exists() ? { id: resultado.id, ...resultado.data() } : null;
}

export async function guardarCalificacion(data: {
  entregaId: string;
  equipoId: string;
  documentoClave: ClaveDocumento;
  nombreDocumento: string;
  nombreEquipo: string;
  codigoProyecto?: string;
  nombreProyecto?: string;
  rubrica: CriterioRubrica[];
  comentarios: string;
  recomendadoFinal: boolean;
}) {
  const maestro = auth.currentUser;
  if (!maestro) throw new Error("La sesión del maestro terminó. Inicia sesión nuevamente.");
  const id = idCalificacion(data.equipoId, data.documentoClave, maestro.uid);
  const existente = await getDoc(doc(db, "calificaciones", id));
  if (existente.exists()) throw new Error("Ya calificaste este documento de este proyecto. No se puede volver a calificar.");
  const suma = data.rubrica.reduce((total, criterio) => total + criterio.puntosObtenidos, 0);
  const puntajeMaximo = 25;
  const maximoRubro = data.rubrica.reduce((total, criterio) => total + criterio.puntosMax, 0);
  const puntajeTotal = maximoRubro ? Number(((suma / maximoRubro) * puntajeMaximo).toFixed(4)) : 0;
  await setDoc(doc(db, "calificaciones", id), {
    ...data,
    maestroId: maestro.uid,
    nombreMaestro: maestro.displayName || maestro.email || "Maestro",
    correoMaestro: maestro.email || "",
    puntajeTotal,
    puntajeMaximo,
    fechaCalificacion: new Date().toISOString(),
  });
  return id;
}
