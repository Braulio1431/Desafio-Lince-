"use client";

import { Equipo } from "@/types";
import { ExternalLink, FileText, Play, X } from "lucide-react";

function videoEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes("youtube.com")) return `https://www.youtube.com/embed/${parsed.searchParams.get("v") || parsed.pathname.split("/").pop()}`;
    if (parsed.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean).pop()}`;
  } catch { return null; }
  return null;
}

export function ModalDetalleProyecto({ equipo, onClose }: { equipo: Equipo; onClose: () => void }) {
  const documentos = equipo.documentos?.filter((documento) => documento.link) ?? [];
  const video = documentos.find((documento) => documento.clave === "videoPitch");
  const embed = video?.link ? videoEmbed(video.link) : null;
  return <div className="fixed inset-0 z-50 bg-black/60 p-3 flex items-center justify-center"><div className="bg-white w-full max-w-5xl max-h-[94vh] overflow-y-auto"><div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex items-center justify-between"><div><p className="text-xs text-[#c8102e] font-bold uppercase">Contenido del proyecto</p><h2 className="text-xl font-bold">{equipo.registro?.nombreProyecto || equipo.nombreEquipo}</h2><p className="text-xs text-gray-500 mt-1">{equipo.codigoProyecto || "Sin ID"}</p></div><button onClick={onClose} aria-label="Cerrar"><X /></button></div><div className="p-5 space-y-6"><section><h3 className="font-bold mb-3">Datos generales</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">{[["Líder", equipo.registro?.nombreCompleto || equipo.representante?.nombre], ["Correo", equipo.registro?.email || equipo.representante?.correo], ["Teléfono", equipo.registro?.numeroTelefonico || equipo.representante?.telefono], ["Campus", equipo.registro?.campusUvmCercano], ["Categoría", equipo.registro?.clasificacionProyecto], ["Integrantes", equipo.registro?.numeroIntegrantes]].map(([label, value]) => <div key={String(label)} className="bg-gray-50 border border-gray-200 rounded-lg p-3"><span className="block text-xs text-gray-500">{label}</span><span className="font-semibold text-gray-900">{value || "—"}</span></div>)}</div></section><section><h3 className="font-bold mb-3">Entregables ({documentos.length}/4)</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{documentos.filter((d) => d.clave !== "videoPitch").map((documento) => <a key={documento.clave} href={documento.link} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-lg p-4 hover:border-[#c8102e] transition"><FileText className="text-[#c8102e]" size={22} /><span className="block font-semibold mt-2">{documento.nombre}</span><span className="block text-xs text-gray-500 mt-1 truncate">{documento.nombreArchivo || "Abrir archivo"}</span><span className="inline-flex items-center gap-1 text-xs text-[#c8102e] mt-3">Abrir <ExternalLink size={13} /></span></a>)}{video && <a href={video.link} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-lg p-4 hover:border-[#c8102e] transition"><Play className="text-[#c8102e]" size={22} /><span className="block font-semibold mt-2">Video Pitch</span><span className="inline-flex items-center gap-1 text-xs text-[#c8102e] mt-3">Abrir video <ExternalLink size={13} /></span></a>}{documentos.length === 0 && <p className="text-sm text-gray-500">Este proyecto aún no tiene entregables.</p>}</div></section>{embed && <section><h3 className="font-bold mb-3">Vista previa del Video Pitch</h3><div className="aspect-video bg-black rounded-lg overflow-hidden"><iframe src={embed} title="Video Pitch" className="w-full h-full" allowFullScreen /></div></section>}</div></div></div>;
}
