import { ClaveDocumento, CriterioRubrica } from "@/types";

const nivel = (nombre: string): Omit<CriterioRubrica, "puntosObtenidos"> => ({
  criterio: nombre,
  puntosMax: 5,
  niveles: ["No presenta evidencia suficiente.", "Presenta avances iniciales, incompletos o poco claros.", "Cumple de forma funcional con los elementos básicos.", "Presenta un desarrollo sólido, claro y coherente.", "Presenta un desarrollo excelente, completo, estratégico y sustentado."],
});
const bloque = (nombres: string[]) => nombres.map(nivel);
const bloqueCanvas = (nombres: string[]) => nombres.map((nombre) => ({ ...nivel(nombre), puntosMax: 4, niveles: ["No presenta.", "Presenta de forma insuficiente.", "Presenta elementos básicos.", "Presenta una solución clara y factible.", "Presenta una solución estratégica y optimizada."] }));

export const RUBRICAS_POR_DOCUMENTO: Record<ClaveDocumento, Omit<CriterioRubrica, "puntosObtenidos">[]> = {
  planNegocios: bloque([
    "Definición del producto/servicio", "Ventajas comparativas y competitivas", "Filosofía institucional", "Planeación estratégica", "Organigrama y descripción de puestos",
    "Identidad de marca y gráfica", "Estudio y segmentación de mercado", "Estrategias de promoción y publicidad", "Descripción técnica", "Recursos", "Control de calidad y mejora continua",
    "Plan de inversión", "Flujo de efectivo", "Indicadores financieros", "Estrategias de financiamiento", "Constitución de la empresa", "Propiedad intelectual y legal", "Cumplimiento de regulaciones",
    "Sostenibilidad", "Medición de impacto ambiental", "Contribución social",
  ]),
  modeloCanvas: bloqueCanvas([
    "1. Propuesta de valor", "2. Segmentación y mercado meta", "3. Canales de distribución", "4. Relación con el cliente", "5. Estructura de ingresos",
    "6. Actividades clave", "6.1 Actividades de venta y distribución", "7. Recursos clave", "8. Alianzas clave", "9. Estructura de costos",
  ]),
  planFinanciero: bloque(["Plan de inversión", "Flujo de efectivo", "Indicadores financieros", "Estrategias de financiamiento"]),
  videoPitch: [
    { ...nivel("Coherencia con el modelo de negocio"), niveles: ["Es confuso o contradictorio.", "Refleja algunos elementos y omite otros clave.", "Comunica la esencia, pero conecta débilmente los componentes.", "Integra la mayoría de los elementos con detalles menores pendientes.", "Integra claramente propuesta, clientes, canales, ingresos y recursos."] },
    { ...nivel("Duración y gestión del tiempo"), niveles: ["Descontrol evidente del tiempo.", "Excede o queda muy por debajo del límite.", "Cumple, aunque el cierre es apresurado.", "Tiempo y secciones equilibrados.", "Se ajusta completamente al tiempo y fluye con ritmo perfecto."] },
    { ...nivel("Calidad de la imagen"), niveles: ["Pixelada o no permite ver al ponente/producto.", "Baja, con iluminación deficiente.", "Clara, 720p y encuadre fijo.", "Alta definición, nítida y con fondos limpios.", "Calidad profesional con iluminación, color y encuadre óptimos."] },
    { ...nivel("Calidad del audio"), niveles: ["El ruido vuelve ininteligible el discurso.", "Eco, volumen bajo o interferencias.", "Audio legible y volumen constante.", "Audio nítido y voz clara.", "Audio profesional, sin ruido y mezcla impecable."] },
    { ...nivel("Edición y recursos visuales"), niveles: ["Edición deficiente y sin recursos útiles.", "Cortes bruscos y recursos confusos.", "Edición mínima y recursos repetitivos.", "Edición dinámica con apoyos integrados.", "Edición fluida y recursos estratégicos que refuerzan el mensaje."] },
    { ...nivel("Presencia escénica y comunicación"), niveles: ["Lee, usa tono monótono y no mira a cámara.", "Muestra nervios y poca fluidez.", "Comunicación clara y lenguaje corporal adecuado.", "Proyecta confianza y contacto visual constante.", "Demuestra dominio, dicción y excelente comunicación."] },
  ],
};

export function rubricasIniciales() {
  return Object.fromEntries(Object.entries(RUBRICAS_POR_DOCUMENTO).map(([clave, criterios]) => [clave, criterios.map((c) => ({ ...c }))])) as Record<ClaveDocumento, Omit<CriterioRubrica, "puntosObtenidos">[]>;
}
