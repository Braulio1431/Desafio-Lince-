import * as XLSX from "xlsx";
import { writeBatch, doc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { Equipo, Integrante } from "@/types";

interface FilaExcel {
  nombreEquipo: string;
  nombreIntegrante: string;
  apellidoIntegrante: string;
  matricula: string;
  esRepresentante?: string;
  telefonoRepresentante?: string;
  correoRepresentante?: string;
}

export function parsearExcelEquipos(file: File): Promise<Omit<Equipo, "id">[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json<FilaExcel>(hoja);

        const equiposMap = new Map<string, Omit<Equipo, "id">>();

        for (const fila of filas) {
          const nombreEquipo = String(fila.nombreEquipo ?? "").trim();
          if (!nombreEquipo) continue;

          if (!equiposMap.has(nombreEquipo)) {
            equiposMap.set(nombreEquipo, {
              nombreEquipo,
              integrantes: [],
              representante: { nombre: "", telefono: "", correo: "" },
              fechaAlta: new Date().toISOString(),
            });
          }

          const equipo = equiposMap.get(nombreEquipo)!;
          const integrante: Integrante = {
            nombre: String(fila.nombreIntegrante ?? "").trim(),
            apellido: String(fila.apellidoIntegrante ?? "").trim(),
            matricula: String(fila.matricula ?? "").trim(),
          };
          equipo.integrantes.push(integrante);

          const esRep = String(fila.esRepresentante ?? "").toLowerCase() === "si";
          if (esRep) {
            equipo.representante = {
              nombre: `${integrante.nombre} ${integrante.apellido}`.trim(),
              telefono: String(fila.telefonoRepresentante ?? "").trim(),
              correo: String(fila.correoRepresentante ?? "").trim(),
            };
          }
        }

        resolve(Array.from(equiposMap.values()));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function importarEquiposMasivo(equipos: Omit<Equipo, "id">[]) {
  // Firestore permite máx. 500 escrituras por batch
  const LOTE = 450;
  for (let i = 0; i < equipos.length; i += LOTE) {
    const batch = writeBatch(db);
    const grupo = equipos.slice(i, i + LOTE);
    grupo.forEach((equipo) => {
      const ref = doc(collection(db, "equipos"));
      batch.set(ref, equipo);
    });
    await batch.commit();
  }
}