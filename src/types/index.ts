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

export interface Representante {
  nombre: string;
  telefono: string;
  correo: string;
}

export interface Equipo {
  id: string;
  nombreEquipo: string;
  integrantes: Integrante[];
  representante: Representante;
  fechaAlta: string;
}

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
}

// Rúbrica genérica temporal (3 criterios, 1-10 c/u)
// Reemplazar cuando llegue el formulario real
export const RUBRICA_GENERICA: Omit<CriterioRubrica, "puntosObtenidos">[] = [
  { criterio: "Criterio 1", puntosMax: 10 },
  { criterio: "Criterio 2", puntosMax: 10 },
  { criterio: "Criterio 3", puntosMax: 10 },
];