export type Rol = "admin" | "maestro";

export interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  rol: Rol;
}

export interface Integrante {
  nombre: string;
  apellido: string;
  matricula: string;
}

export interface DatosRegistroEquipo {
  nombreCompleto: string;
  numeroTelefonico: string;
  email: string;
  edad: string;
  genero: string;
  nivelEstudios: string;
  campusUvmCercano: string;
  matriculaLider: string;
  carreraLider: string;
  numeroIntegrantes: number;
  nombreProyecto: string;
  clasificacionProyecto: string;
  cuentaCon: string;
}

export interface Representante {
  nombre: string;
  telefono: string;
  correo: string;
}

export interface Equipo {
  id: string;
  codigoProyecto?: string;
  nombreEquipo: string;
  integrantes: Integrante[];
  representante: Representante;
  fechaAlta: string;
  registro?: DatosRegistroEquipo;
  documentos?: DocumentoEquipo[];
}

export const DOCUMENTOS_EQUIPO = [
  { clave: "documento1", nombre: "Documento 1" },
  { clave: "documento2", nombre: "Documento 2" },
  { clave: "documento3", nombre: "Documento 3" },
] as const;

export type ClaveDocumento = (typeof DOCUMENTOS_EQUIPO)[number]["clave"];

export interface DocumentoEquipo {
  clave: ClaveDocumento;
  nombre: string;
  link: string;
  fechaActualizacion?: string;
  actualizadoPor?: string;
}

export type RubricasPorDocumento = Record<ClaveDocumento, Omit<CriterioRubrica, "puntosObtenidos">[]>;

export type TipoEntrega = "video" | "pdf" | "doc" | "excel" | "csv" | "link";
export type EstadoEntrega = "pendiente" | "calificado";

export interface Entrega {
  id: string;
  equipoId: string;
  nombreEquipo: string;
  tipo: TipoEntrega;
  archivoURL?: string;
  link?: string;
  nombreArchivo: string;
  subidoPor: string;
  fechaSubida: string;
  estado: EstadoEntrega;
}

export interface CriterioRubrica {
  criterio: string;
  puntosMax: number;
  puntosObtenidos: number;
}

export interface Calificacion {
  id: string;
  entregaId: string;
  equipoId: string;
  maestroId: string;
  rubrica: CriterioRubrica[];
  puntajeTotal: number;
  puntajeMaximo: number;
  comentarios: string;
  fechaCalificacion: string;
  documentoClave?: ClaveDocumento;
  nombreDocumento?: string;
  nombreMaestro?: string;
  correoMaestro?: string;
  nombreEquipo?: string;
  codigoProyecto?: string;
  nombreProyecto?: string;
 recomendadoFinal?: boolean;
}

// Rúbrica genérica temporal (3 criterios, 1-10 c/u)
// Reemplazar cuando llegue el formulario real
export const RUBRICA_GENERICA: Omit<CriterioRubrica, "puntosObtenidos">[] = [
  { criterio: "Problema y oportunidad", puntosMax: 10 },
  { criterio: "Propuesta de valor", puntosMax: 10 },
  { criterio: "Innovación", puntosMax: 10 },
  { criterio: "Mercado objetivo", puntosMax: 10 },
  { criterio: "Modelo de negocio", puntosMax: 10 },
  { criterio: "Viabilidad y operación", puntosMax: 10 },
  { criterio: "Impacto y escalabilidad", puntosMax: 10 },
  { criterio: "Claridad y presentación", puntosMax: 10 },
];
