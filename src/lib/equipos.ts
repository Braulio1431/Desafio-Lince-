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
import { db } from "./firebase";
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
