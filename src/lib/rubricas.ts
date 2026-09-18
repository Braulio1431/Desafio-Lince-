import { ClaveDocumento, ClaveRubrica, CriterioRubrica } from "@/types";

const nivel = (criterio: string): Omit<CriterioRubrica, "puntosObtenidos"> => ({ criterio, puntosMax: 5, niveles: ["No presenta evidencia suficiente.", "Presenta avances iniciales, incompletos o poco claros.", "Cumple de forma funcional con los elementos basicos.", "Presenta un desarrollo solido, claro y coherente.", "Presenta un desarrollo excelente, completo, estrategico y sustentado."] });
const bloque = (nombres: string[]) => nombres.map(nivel);
const bloqueCanvas = (nombres: string[]) => nombres.map((nombre) => ({ ...nivel(nombre), puntosMax: 4, niveles: ["No presenta.", "Presenta de forma insuficiente.", "Presenta elementos basicos.", "Presenta una solucion clara y factible.", "Presenta una solucion estrategica y optimizada."] }));

export const CATEGORIAS_PROYECTO = [
  { clave: "mujer", nombre: "Mujer emprendedora", alias: ["mujer", "mujeres", "mujer emprendedora", "emprendimiento de mujeres", "perspectiva de genero"] },
  { clave: "sostenible", nombre: "Sostenible", alias: ["sostenible", "sostenibilidad", "sustentable", "medio ambiente", "ambiental"] },
  { clave: "social", nombre: "Social", alias: ["social", "impacto social", "comunitario", "inclusion"] },
  { clave: "innovador", nombre: "Innovador", alias: ["innovador", "innovacion", "tecnologico", "tecnologia", "base tecnologica"] },
  { clave: "general", nombre: "General", alias: [] },
] as const;

const nivelesCategoria = (enfoque: string) => [
  `No demuestra el enfoque ${enfoque.toLowerCase()} ni presenta evidencia verificable.`,
  `Menciona el enfoque ${enfoque.toLowerCase()}, pero la evidencia es limitada o poco clara.`,
  `Cumple de forma funcional con los elementos basicos del enfoque ${enfoque.toLowerCase()}.`,
  `Integra el enfoque ${enfoque.toLowerCase()} con evidencia clara, coherente y suficiente.`,
  `Desarrolla de manera excelente, medible y estrategica el enfoque ${enfoque.toLowerCase()}.`,
];

export const CRITERIO_CATEGORIA = { criterio: "Alineacion con la categoria del proyecto", puntosMax: 5, esCategoria: true, niveles: nivelesCategoria("proyecto"), nivelesPorCategoria: Object.fromEntries(CATEGORIAS_PROYECTO.map((c) => [c.clave, nivelesCategoria(c.nombre)])) };

export function claveCategoria(clasificacion?: string) {
  const valor = (clasificacion ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return CATEGORIAS_PROYECTO.find((categoria) => categoria.alias.some((alias) => valor.includes(alias)))?.clave ?? "general";
}

export function prepararRubricaParaCategoria(criterios: Omit<CriterioRubrica, "puntosObtenidos">[], clasificacion?: string, incluirCategoria = true) {
  const categoria = claveCategoria(clasificacion);
  const base = incluirCategoria && !criterios.some((criterio) => criterio.esCategoria) ? criterios.concat(CRITERIO_CATEGORIA) : criterios;
  return base.map((criterio) => criterio.esCategoria ? { ...criterio, niveles: criterio.nivelesPorCategoria?.[categoria] ?? criterio.niveles } : criterio);
}

export const PONDERACION_RUBRICAS: Record<ClaveRubrica, number> = { planNegocios: 30, modeloCanvas: 20, planFinanciero: 20, videoPitch: 10, categoriaProyecto: 10, esgSostenibilidad: 10 };

export const RUBRICAS_POR_DOCUMENTO: Record<ClaveDocumento, Omit<CriterioRubrica, "puntosObtenidos">[]> = {
  planNegocios: bloque(["Definicion del producto/servicio", "Ventajas comparativas y competitivas", "Filosofia institucional", "Planeacion estrategica", "Organigrama y descripcion de puestos", "Identidad de marca y grafica", "Estudio y segmentacion de mercado", "Estrategias de promocion y publicidad", "Descripcion tecnica", "Recursos", "Control de calidad y mejora continua", "Plan de inversion", "Flujo de efectivo", "Indicadores financieros", "Estrategias de financiamiento", "Constitucion de la empresa", "Propiedad intelectual y legal", "Cumplimiento de regulaciones"]),
  modeloCanvas: bloqueCanvas(["1. Propuesta de valor", "2. Segmentacion y mercado meta", "3. Canales de distribucion", "4. Relacion con el cliente", "5. Estructura de ingresos", "6. Actividades clave", "6.1 Actividades de venta y distribucion", "7. Recursos clave", "8. Alianzas clave", "9. Estructura de costos"]),
  planFinanciero: bloque(["Plan de inversion", "Flujo de efectivo", "Indicadores financieros", "Estrategias de financiamiento"]),
  videoPitch: [
    { ...nivel("Coherencia con el modelo de negocio"), niveles: ["Es confuso o contradictorio.", "Refleja algunos elementos y omite otros clave.", "Comunica la esencia, pero conecta debilmente los componentes.", "Integra la mayoria de los elementos con detalles menores pendientes.", "Integra claramente propuesta, clientes, canales, ingresos y recursos."] },
    { ...nivel("Duracion y gestion del tiempo"), niveles: ["Descontrol evidente del tiempo.", "Excede o queda muy por debajo del limite.", "Cumple, aunque el cierre es apresurado.", "Tiempo y secciones equilibrados.", "Se ajusta completamente al tiempo y fluye con ritmo perfecto."] },
    { ...nivel("Calidad de la imagen"), niveles: ["Pixelada o no permite ver al ponente/producto.", "Baja, con iluminacion deficiente.", "Clara, 720p y encuadre fijo.", "Alta definicion, nitida y con fondos limpios.", "Calidad profesional con iluminacion, color y encuadre optimos."] },
    { ...nivel("Calidad del audio"), niveles: ["El ruido vuelve ininteligible el discurso.", "Eco, volumen bajo o interferencias.", "Audio legible y volumen constante.", "Audio nitido y voz clara.", "Audio profesional, sin ruido y mezcla impecable."] },
    { ...nivel("Edicion y recursos visuales"), niveles: ["Edicion deficiente y sin recursos utiles.", "Cortes bruscos y recursos confusos.", "Edicion minima y recursos repetitivos.", "Edicion dinamica con apoyos integrados.", "Edicion fluida y recursos estrategicos que refuerzan el mensaje."] },
    { ...nivel("Presencia escenica y comunicacion"), niveles: ["Lee, usa tono monotono y no mira a camara.", "Muestra nervios y poca fluidez.", "Comunicacion clara y lenguaje corporal adecuado.", "Proyecta confianza y contacto visual constante.", "Demuestra dominio, diccion y excelente comunicacion."] },
  ],
};

export const RUBRICAS_ESPECIALES: Record<"categoriaProyecto" | "esgSostenibilidad", Omit<CriterioRubrica, "puntosObtenidos">[]> = {
  categoriaProyecto: [CRITERIO_CATEGORIA],
  esgSostenibilidad: bloque(["Impacto ambiental", "Responsabilidad social", "Etica y gobernanza"]),
};

export function rubricasIniciales() {
  return Object.fromEntries([...Object.entries(RUBRICAS_POR_DOCUMENTO), ...Object.entries(RUBRICAS_ESPECIALES)].map(([clave, criterios]) => [clave, criterios.map((c) => ({ ...c }))])) as Record<ClaveRubrica, Omit<CriterioRubrica, "puntosObtenidos">[]>;
}
