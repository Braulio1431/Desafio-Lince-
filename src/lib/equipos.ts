import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
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
  return addDoc(collection(db, "equipos"), data);
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