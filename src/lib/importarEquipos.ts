import * as XLSX from "xlsx";
import { writeBatch, doc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { DatosRegistroEquipo, Equipo, Integrante } from "@/types";
import { generarCodigoProyecto } from "./equipos";

// Este importador sigue la estructura real de la plantilla del concurso.
// No depende de que los encabezados lleguen codificados igual: usa el orden
// fijo de las 13 columnas del documento entregado.
const NUMERO_COLUMNAS = 13;
const ENCABEZADO_REFERENCIA = "nombre completo";

function texto(valor: unknown) { return String(valor ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }
function normalizar(valor: unknown) { return texto(valor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""); }
function filaTieneDatos(fila: unknown[]) { return fila.some((valor) => texto(valor) !== ""); }

function encontrarFilaEncabezados(filas: unknown[][]) {
  const exacta = filas.findIndex((fila) => normalizar(fila[0]) === normalizar(ENCABEZADO_REFERENCIA) && fila.filter((v) => texto(v)).length >= NUMERO_COLUMNAS);
  if (exacta >= 0) return exacta;
  const candidata = filas.findIndex((fila) => fila.filter((v) => texto(v)).length >= NUMERO_COLUMNAS);
  if (candidata >= 0) return candidata;
  throw new Error("El archivo no contiene una tabla de 13 columnas. Usa la plantilla de Desafío Lince.");
}

function construirRegistro(columnas: unknown[], filaExcel: number): Omit<Equipo, "id"> {
  const [nombre, telefono, email, edad, genero, nivelEstudios, campus, matricula, carrera, cantidad, proyecto, clasificacion, cuentaCon] = columnas.slice(0, NUMERO_COLUMNAS).map(texto);
  const telefonoFinal = telefono || "No registrado";
  const requeridos: [string, string][] = [["nombre completo", nombre], ["e-mail", email], ["edad", edad], ["género", genero], ["nivel de estudios", nivelEstudios], ["campus", campus], ["matrícula", matricula], ["carrera", carrera], ["número de integrantes", cantidad], ["nombre del proyecto", proyecto], ["clasificación", clasificacion], ["el proyecto cuenta con", cuentaCon]];
  const faltantes = requeridos.filter(([, valor]) => !valor).map(([campo]) => campo);
  if (faltantes.length) throw new Error(`La fila ${filaExcel} está incompleta. Faltan: ${faltantes.join(", ")}.`);
  const numeroIntegrantes = Number(cantidad.match(/\d+/)?.[0] ?? 0);
  if (!numeroIntegrantes) throw new Error(`La fila ${filaExcel} tiene un número de integrantes inválido.`);
  const registro: DatosRegistroEquipo = { nombreCompleto: nombre, numeroTelefonico: telefonoFinal, email, edad, genero, nivelEstudios, campusUvmCercano: campus, matriculaLider: matricula, carreraLider: carrera, numeroIntegrantes, nombreProyecto: proyecto, clasificacionProyecto: clasificacion, cuentaCon };
  const integrante: Integrante = { nombre, apellido: "", matricula };
  return { nombreEquipo: proyecto, integrantes: [integrante], representante: { nombre, telefono: telefonoFinal, correo: email }, registro, fechaAlta: new Date().toISOString(), documentos: [] };
}

export function parsearExcelEquipos(file: File): Promise<Omit<Equipo, "id">[]> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = (evento) => {
      try {
        const bytes = new Uint8Array(evento.target?.result as ArrayBuffer);
        const libro = XLSX.read(bytes, { type: "array", raw: false, cellDates: false });
        if (!libro.SheetNames.length) throw new Error("El archivo no contiene hojas.");
        const hoja = libro.Sheets[libro.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json<unknown[]>(hoja, { header: 1, raw: false, defval: "", blankrows: false });
        const indiceEncabezado = encontrarFilaEncabezados(filas);
        const equipos: Omit<Equipo, "id">[] = [];
        for (let indice = indiceEncabezado + 1; indice < filas.length; indice++) {
          const fila = filas[indice];
          if (!filaTieneDatos(fila)) continue;
          const columnas = Array.from({ length: NUMERO_COLUMNAS }, (_, columna) => fila[columna] ?? "");
          const proyecto = texto(columnas[10]);
          // Filas de continuación: el formato oficial debe tener una fila completa.
          if (!proyecto) throw new Error(`La fila ${indice + 1} no tiene nombre de proyecto.`);
          equipos.push(construirRegistro(columnas, indice + 1));
        }
        if (!equipos.length) throw new Error("No se encontraron proyectos debajo de la fila de encabezados.");
        resolve(equipos);
      } catch (error) { reject(error instanceof Error ? error : new Error("No se pudo leer el archivo.")); }
    };
    lector.onerror = () => reject(new Error("No se pudo leer el archivo Excel."));
    lector.readAsArrayBuffer(file);
  });
}

export async function importarEquiposMasivo(equipos: Omit<Equipo, "id">[]) {
  const equiposConCodigo = await Promise.all(equipos.map(async (equipo) => ({ ...equipo, codigoProyecto: equipo.codigoProyecto ?? await generarCodigoProyecto(equipo.registro?.campusUvmCercano ?? "UVM") })));
  for (let inicio = 0; inicio < equiposConCodigo.length; inicio += 450) { const lote = writeBatch(db); equiposConCodigo.slice(inicio, inicio + 450).forEach((equipo) => lote.set(doc(collection(db, "equipos")), equipo)); await lote.commit(); }
}
