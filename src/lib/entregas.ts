import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Entrega } from "@/types";

// Trae todas las entregas en tiempo real (ordenadas por fecha más reciente).
// Con cientos de registros esto es perfectamente manejable en el cliente.
export function escucharEntregas(
  callback: (entregas: Entrega[]) => void
) {
  const q = query(collection(db, "entregas"), orderBy("fechaSubida", "desc"));

  return onSnapshot(q, (snapshot) => {
    const entregas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Entrega[];
    callback(entregas);
  });
}

export async function actualizarEntrega(
  id: string,
  data: Partial<Omit<Entrega, "id">>
) {
  return updateDoc(doc(db, "entregas", id), data);
}

export async function eliminarEntrega(id: string) {
  return deleteDoc(doc(db, "entregas", id));
}