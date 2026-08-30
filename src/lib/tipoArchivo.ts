import { TipoEntrega } from "@/types";

const MAPA_EXTENSIONES: Record<string, TipoEntrega> = {
  mp4: "video", mov: "video", avi: "video", mkv: "video", webm: "video",
  pdf: "pdf",
  doc: "doc", docx: "doc",
  xls: "excel", xlsx: "excel",
  csv: "csv",
};

export function detectarTipoArchivo(nombreArchivo: string): TipoEntrega {
  const ext = nombreArchivo.split(".").pop()?.toLowerCase() ?? "";
  return MAPA_EXTENSIONES[ext] ?? "doc";
}