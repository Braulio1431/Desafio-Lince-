import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { Equipo } from "@/types";

export function escucharEquipos(callback: (equipos: Equipo[]) => void) {
  const q = query(collection(db, "equipos"), orderBy("nombreEquipo"));
  return onSnapshot(q, (snapshot) => {
    const equipos = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Equipo[];
    callback(equipos);
  });
}

export async function crearEquipo(data: Omit<Equipo, "id">) {
  const codigoProyecto = data.codigoProyecto ?? await generarCodigoProyecto(data.registro?.campusUvmCercano ?? "UVM");
  return addDoc(collection(db, "equipos"), { ...data, codigoProyecto });
}

function abreviarCampus(campus: string) {
  const palabras = campus.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
  return (palabras.length > 1 ? palabras.map((p) => p[0]).join("") : (palabras[0] ?? "UVM").slice(0, 3)).slice(0, 5);
}

export async function generarCodigoProyecto(campus: string) {
  const prefijo = abreviarCampus(campus || "UVM");
  for (let intento = 0; intento < 10; intento++) {
    const codigo = `PROY-${prefijo}-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}${Math.floor(Math.random() * 10)}`;
    const existente = await getDocs(query(collection(db, "equipos"), where("codigoProyecto", "==", codigo)));
    if (existente.empty) return codigo;
  }
  throw new Error("No se pudo generar un ID único para el proyecto.");
}

export async function actualizarEquipo(
  id: string,
  data: Partial<Omit<Equipo, "id">>
) {
  return updateDoc(doc(db, "equipos", id), data);
}

export async function eliminarEquipo(id: string) {
  return deleteDoc(doc(db, "equipos", id));
}

export async function eliminarTodosLosProyectosYCalificaciones() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("La sesión terminó. Inicia sesión nuevamente.");
  const respuesta = await fetch("/api/admin/eliminar-todo", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  const resultado = await respuesta.json();
  if (!respuesta.ok) throw new Error(resultado.error ?? "No se pudieron eliminar los registros.");
  return resultado as { proyectos: number; entregas: number; calificaciones: number };
}

export async function asignarMaestros(equipoId: string, maestrosAsignados: string[]) {
  return updateDoc(doc(db, "equipos", equipoId), { maestrosAsignados });
}
