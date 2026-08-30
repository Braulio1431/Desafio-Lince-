import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { storage, db, auth } from "./firebase";
import { detectarTipoArchivo } from "./tipoArchivo";
import { Equipo } from "@/types";

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Intenta adivinar el equipo comparando el nombre de carpeta/archivo contra la lista de equipos
export function detectarEquipo(referencia: string, equipos: Equipo[]): Equipo | null {
  const normalizado = normalizarTexto(referencia);
  return (
    equipos.find((eq) => {
      const nombreEq = normalizarTexto(eq.nombreEquipo);
      return normalizado.includes(nombreEq) || nombreEq.includes(normalizado);
    }) ?? null
  );
}

export async function subirArchivoEntrega(
  file: File,
  equipoId: string,
  nombreEquipo: string
) {
  const tipo = detectarTipoArchivo(file.name);
  const storageRef = ref(storage, `entregas/${equipoId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const archivoURL = await getDownloadURL(storageRef);

  await addDoc(collection(db, "entregas"), {
    equipoId,
    nombreEquipo,
    tipo,
    archivoURL,
    nombreArchivo: file.name,
    subidoPor: auth.currentUser?.uid ?? "admin",
    fechaSubida: new Date().toISOString(),
    estado: "pendiente",
  });
}