"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { escucharUsuarios } from "@/lib/usuarios";
import { Usuario, Rol } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { Pencil, Trash2, X, Check } from "lucide-react";

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("maestro");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const { user, rol: rolAuth } = useAuth();
  const router = useRouter();

  const [editandoUid, setEditandoUid] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editCorreo, setEditCorreo] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRol, setEditRol] = useState<Rol>("maestro");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (rolAuth === "subadmin") router.replace("/admin/equipos");
  }, [rolAuth, router]);

  useEffect(() => escucharUsuarios(setUsuarios), []);

  if (rolAuth === "subadmin") return null;

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return setMensaje("Tu sesión administrativa terminó. Vuelve a iniciar sesión.");
    setGuardando(true);
    setMensaje("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const token = await user.getIdToken(true);
      const response = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: nombre.trim(), correo: correo.trim(), password, rol }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Error del servidor (${response.status})`);

      setUsuarios((actuales) => {
        if (actuales.some((u) => u.uid === data.uid)) return actuales;
        return [...actuales, { uid: data.uid, nombre: data.nombre, correo: data.correo, rol: data.rol }];
      });

      setMensaje(`Usuario creado como ${rol}. Debe iniciar sesión con ${correo}.`);
      setNombre(""); setCorreo(""); setPassword("");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMensaje("El servidor tardó demasiado en responder. Verifica tu conexión e inténtalo de nuevo; si el usuario ya se creó, aparecerá abajo automáticamente.");
      } else {
        setMensaje(error instanceof Error ? error.message : "No se pudo crear el usuario");
      }
    } finally {
      clearTimeout(timeout);
      setGuardando(false);
    }
  }

  function iniciarEdicion(usuario: Usuario) {
    setEditandoUid(usuario.uid);
    setEditNombre(usuario.nombre || "");
    setEditCorreo(usuario.correo || "");
    setEditPassword("");
    setEditRol(usuario.rol);
    setMensaje("");
  }

  function cancelarEdicion() {
    setEditandoUid(null);
    setEditPassword("");
  }

  async function guardarEdicion(uid: string) {
    if (!user) return setMensaje("Tu sesión administrativa terminó. Vuelve a iniciar sesión.");
    if (editPassword && editPassword.length < 6) return setMensaje("La nueva contraseña debe tener al menos 6 caracteres.");
    setProcesando(true);
    try {
      const token = await user.getIdToken(true);
      const body: Record<string, string> = { uid, nombre: editNombre.trim(), correo: editCorreo.trim(), rol: editRol };
      if (editPassword) body.password = editPassword;

      const response = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar el usuario");

      setUsuarios((actuales) =>
        actuales.map((u) => (u.uid === uid ? { ...u, nombre: editNombre.trim(), correo: editCorreo.trim(), rol: editRol } : u))
      );
      setMensaje(editPassword ? "Usuario actualizado y contraseña restablecida." : "Usuario actualizado.");
      setEditandoUid(null);
      setEditPassword("");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo actualizar el usuario");
    } finally {
      setProcesando(false);
    }
  }

  async function eliminarUsuario(uid: string, nombreUsuario: string) {
    if (!user) return setMensaje("Tu sesión administrativa terminó. Vuelve a iniciar sesión.");
    if (!confirm(`¿Eliminar a "${nombreUsuario}"? Esta acción no se puede deshacer.`)) return;
    setProcesando(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch("/api/admin/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo eliminar el usuario");
      setUsuarios((actuales) => actuales.filter((u) => u.uid !== uid));
      setMensaje("Usuario eliminado.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo eliminar el usuario");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios y roles</h1>
        <p className="text-sm text-gray-500 mt-1">Crea, edita o elimina cuentas de maestros, subadministradores o administradores.</p>
      </div>
      <form onSubmit={crearUsuario} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input required placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="border rounded-lg px-3 py-2 text-gray-900" />
        <input required type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} className="border rounded-lg px-3 py-2 text-gray-900" />
        <input required minLength={6} type="password" placeholder="Contraseña temporal" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded-lg px-3 py-2 text-gray-900" />
        <select value={rol} onChange={(e) => setRol(e.target.value as Rol)} className="border rounded-lg px-3 py-2 text-gray-900">
          <option value="maestro">Maestro</option>
          <option value="admin">Administrador</option>
          <option value="subadmin">Subadministrador</option>
        </select>
        <button disabled={guardando} className="bg-[#D7282F] text-white rounded-lg px-3 py-2 font-semibold disabled:opacity-50">
          {guardando ? "Creando..." : "Crear usuario"}
        </button>
        {mensaje && <p className="md:col-span-5 text-sm text-gray-700 bg-gray-50 border rounded-lg p-3">{mensaje}</p>}
      </form>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Rol</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const enEdicion = editandoUid === usuario.uid;
                return (
                  <tr key={usuario.uid} className="border-t align-top">
                    {enEdicion ? (
                      <>
                        <td className="p-3">
                          <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" placeholder="Nombre" />
                        </td>
                        <td className="p-3">
                          <input type="email" value={editCorreo} onChange={(e) => setEditCorreo(e.target.value)} className="border rounded px-2 py-1 text-sm w-full mb-1" placeholder="Correo" />
                          <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" placeholder="Nueva contraseña (opcional)" minLength={6} />
                        </td>
                        <td className="p-3">
                          <select value={editRol} onChange={(e) => setEditRol(e.target.value as Rol)} className="border rounded px-2 py-1 text-xs">
                            <option value="maestro">maestro</option>
                            <option value="subadmin">subadmin</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => guardarEdicion(usuario.uid)} disabled={procesando} className="text-green-700 hover:text-green-800 disabled:opacity-50" title="Guardar">
                              <Check size={18} />
                            </button>
                            <button onClick={cancelarEdicion} disabled={procesando} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" title="Cancelar">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3">{usuario.nombre || "Sin nombre"}</td>
                        <td className="p-3">{usuario.correo}</td>
                        <td className="p-3">
                          <select
                            value={usuario.rol}
                            onChange={(e) => {
                              setEditRol(e.target.value as Rol);
                              guardarEdicion(usuario.uid);
                            }}
                            className="border rounded px-2 py-1 text-xs"
                          >
                            <option value="maestro">maestro</option>
                            <option value="subadmin">subadmin</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => iniciarEdicion(usuario)} className="flex items-center gap-1 text-gray-600 hover:text-[#c8102e] text-sm">
                              <Pencil size={14} /> Editar
                            </button>
                            <button onClick={() => eliminarUsuario(usuario.uid, usuario.nombre || usuario.correo)} disabled={procesando} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm disabled:opacity-50">
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}