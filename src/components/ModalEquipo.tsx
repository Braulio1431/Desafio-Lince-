"use client";
import { useState } from "react";
import { DOCUMENTOS_EQUIPO, DatosRegistroEquipo, Equipo } from "@/types";
import { actualizarEquipo, crearEquipo } from "@/lib/equipos";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
import { CheckCircle2, ExternalLink, Trash2, X } from "lucide-react";

const CAMPOS: { key: keyof DatosRegistroEquipo; label: string; type?: string }[] = ["nombreCompleto","numeroTelefonico","email","edad","genero","nivelEstudios","campusUvmCercano","matriculaLider","carreraLider","numeroIntegrantes","nombreProyecto","clasificacionProyecto","cuentaCon"].map((key) => ({ key: key as keyof DatosRegistroEquipo, label: key }));
const VACIO: DatosRegistroEquipo = { nombreCompleto:"",numeroTelefonico:"",email:"",edad:"",genero:"",nivelEstudios:"",campusUvmCercano:"",matriculaLider:"",carreraLider:"",numeroIntegrantes:1,nombreProyecto:"",clasificacionProyecto:"",cuentaCon:"" };
const input = "w-full px-3 py-2.5 border border-gray-300 text-gray-900 bg-white";

export function ModalEquipo({ equipo, onClose }: { equipo: Equipo | null; onClose: () => void }) {
  const [registro, setRegistro] = useState<DatosRegistroEquipo>(equipo?.registro ?? { ...VACIO, nombreCompleto: equipo?.representante?.nombre ?? "", numeroTelefonico: equipo?.representante?.telefono ?? "", email: equipo?.representante?.correo ?? "", nombreProyecto: equipo?.nombreEquipo ?? "", numeroIntegrantes: equipo?.integrantes?.length || 1 });
  const [documentos, setDocumentos] = useState(equipo?.documentos ?? []); const [guardando, setGuardando] = useState(false); const [subiendo, setSubiendo] = useState<string | null>(null); const [error, setError] = useState("");
  function cambiar(campo: keyof DatosRegistroEquipo, valor: string) { setRegistro((actual) => ({ ...actual, [campo]: campo === "numeroIntegrantes" ? Number(valor) || 0 : valor })); }
  async function subirDocumento(clave: typeof DOCUMENTOS_EQUIPO[number]["clave"], nombre: string, file: File) {
    setError(""); setSubiendo(clave);
    try {
      const ruta = `proyectos/${equipo?.id ?? "nuevo"}/${clave}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, ruta);
      await uploadBytes(storageRef, file);
      const archivoURL = await getDownloadURL(storageRef);
      setDocumentos((prev) => [...prev.filter((d) => d.clave !== clave), { clave, nombre, tipo: "archivo", link: archivoURL, archivoURL, storagePath: ruta, nombreArchivo: file.name, fechaActualizacion: new Date().toISOString(), actualizadoPor: auth.currentUser?.uid }]);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo subir el archivo."); }
    finally { setSubiendo(null); }
  }
  async function eliminarDocumento(documento: typeof documentos[number]) {
    if (documento.tipo === "video") {
      setDocumentos((prev) => prev.filter((d) => d.clave !== documento.clave));
      return;
    }
    if (!confirm(`¿Eliminar ${documento.nombre}? Después podrás subir otro archivo.`)) return;
    setError(""); setSubiendo(documento.clave);
    try {
      await deleteObject(ref(storage, documento.storagePath || documento.archivoURL || documento.link));
      setDocumentos((prev) => prev.filter((d) => d.clave !== documento.clave));
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo eliminar el archivo."); }
    finally { setSubiendo(null); }
  }
  async function guardar() { setError(""); if (Object.values(registro).some((v) => v === "" || v === 0)) return setError("Completa todos los campos del registro."); if (DOCUMENTOS_EQUIPO.some((d) => !documentos.find((x) => x.clave === d.clave)?.link)) return setError("Agrega los tres archivos y el enlace del Video Pitch."); setGuardando(true); try { const data = { nombreEquipo: registro.nombreProyecto, integrantes: [{ nombre: registro.nombreCompleto, apellido: "", matricula: registro.matriculaLider }], representante: { nombre: registro.nombreCompleto, telefono: registro.numeroTelefonico, correo: registro.email }, registro, documentos, fechaAlta: equipo?.fechaAlta ?? new Date().toISOString(), ...(equipo?.codigoProyecto ? { codigoProyecto: equipo.codigoProyecto } : {}) }; if (equipo) await actualizarEquipo(equipo.id, data); else await crearEquipo(data); onClose(); } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el proyecto."); } finally { setGuardando(false); } }
  return <div className="fixed inset-0 z-50 bg-black/60 p-3 flex items-center justify-center"><div className="bg-white w-full max-w-4xl max-h-[94vh] overflow-y-auto"><div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex items-center justify-between"><div><p className="text-xs text-[#c8102e] font-bold uppercase">Registro de proyecto</p><h2 className="text-xl font-bold">{equipo ? "Editar proyecto" : "Nuevo proyecto"}</h2></div><button onClick={onClose}><X /></button></div><div className="p-5 space-y-6"><div><p className="text-sm text-gray-500 mb-4">Datos del proyecto.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{CAMPOS.map(({ key, label }) => <label key={key} className="text-sm font-semibold text-gray-700">{label}<input required type={key === "email" ? "email" : key === "numeroIntegrantes" ? "number" : "text"} value={String(registro[key])} onChange={(e) => cambiar(key, e.target.value)} className={`${input} mt-1`} /></label>)}</div></div><div className="border-t pt-5"><h3 className="font-bold">Entregables del proyecto</h3><p className="text-xs text-gray-500 mt-1 mb-3">Los archivos existentes se muestran abajo. Elimínalos para poder reemplazarlos.</p><div className="space-y-3">{DOCUMENTOS_EQUIPO.map(({ clave, nombre, tipo }) => { const actual = documentos.find((d) => d.clave === clave); return <div key={clave} className="border border-gray-200 rounded-lg p-3"><div className="flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex-1"><span className="text-sm font-semibold">{nombre}</span>{actual?.link ? <span className="flex items-center gap-1 text-xs text-green-700 mt-1"><CheckCircle2 size={14} /> {actual.nombreArchivo || "Enlace guardado"}</span> : <small className="block text-gray-500 mt-1">Pendiente</small>}</div>{actual?.link && <div className="flex gap-2">{<a href={actual.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#c8102e]"><ExternalLink size={14} /> Ver</a>}<button type="button" onClick={() => void eliminarDocumento(actual)} disabled={Boolean(subiendo)} className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900 disabled:opacity-50"><Trash2 size={14} /> Eliminar</button></div>}</div>{tipo === "video" ? <input type="url" placeholder="https://youtube.com/... o Vimeo" value={actual?.link ?? ""} onChange={(e) => setDocumentos((prev) => [...prev.filter((d) => d.clave !== clave), { clave, nombre, tipo, link: e.target.value, fechaActualizacion: new Date().toISOString() }])} className={`${input} mt-3`} /> : <label className="block mt-3"><span className="sr-only">Subir {nombre}</span><input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" disabled={Boolean(subiendo)} onChange={(e) => { const file = e.target.files?.[0]; if (file) void subirDocumento(clave, nombre, file); }} className={`${input} text-sm`} /></label>}</div>; })}</div></div>{error && <p className="bg-red-50 border border-red-200 text-[#c8102e] px-3 py-2 text-sm">{error}</p>}{subiendo && <p className="text-sm text-gray-500">Procesando archivo...</p>}<div className="flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 border">Cancelar</button><button onClick={guardar} disabled={guardando || Boolean(subiendo)} className="px-4 py-2 bg-[#c8102e] text-white disabled:opacity-50">{guardando ? "Guardando..." : "Guardar proyecto"}</button></div></div></div></div>;
}
