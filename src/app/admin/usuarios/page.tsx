"use client";
import { useEffect, useState } from "react";
import { escucharUsuarios } from "@/lib/usuarios";
import { Usuario, Rol } from "@/types";
import { useAuth } from "@/components/AuthProvider";

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("maestro");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const { user } = useAuth();

  useEffect(() => escucharUsuarios(setUsuarios), []);

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return setMensaje("Tu sesión administrativa terminó. Vuelve a iniciar sesión.");
    setGuardando(true);
    setMensaje("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s máximo

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

      // Actualización optimista: no dependemos únicamente del listener en tiempo real.
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

  async function cambiarRol(uid: string, nuevoRol: Rol) {
    if (!user) return setMensaje("Tu sesión administrativa terminó. Vuelve a iniciar sesión.");
    try {
      const token = await user.getIdToken(true);
      const response = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, rol: nuevoRol }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo cambiar el rol");
      setUsuarios((actuales) => actuales.map((u) => (u.uid === uid ? { ...u, rol: nuevoRol } : u)));
      setMensaje("Rol actualizado. La persona debe cerrar sesión y volver a entrar.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo cambiar el rol");
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios y roles</h1>
        <p className="text-sm text-gray-500 mt-1">Crea cuentas de maestros o administradores.</p>
      </div>
      <form onSubmit={crearUsuario} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input required placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="border rounded-lg px-3 py-2 text-gray-900" />
        <input required type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} className="border rounded-lg px-3 py-2 text-gray-900" />
        <input required minLength={6} type="password" placeholder="Contraseña temporal" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded-lg px-3 py-2 text-gray-900" />
        <select value={rol} onChange={(e) => setRol(e.target.value as Rol)} className="border rounded-lg px-3 py-2 text-gray-900">
          <option value="maestro">Maestro</option>
          <option value="admin">Administrador</option>
        </select>
        <button disabled={guardando} className="bg-[#D7282F] text-white rounded-lg px-3 py-2 font-semibold disabled:opacity-50">
          {guardando ? "Creando..." : "Crear usuario"}
        </button>
        {mensaje && <p className="md:col-span-5 text-sm text-gray-700 bg-gray-50 border rounded-lg p-3">{mensaje}</p>}
      </form>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr><th className="p-3">Nombre</th><th className="p-3">Correo</th><th className="p-3">Rol</th></tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.uid} className="border-t">
                <td className="p-3">{usuario.nombre || "Sin nombre"}</td>
                <td className="p-3">{usuario.correo}</td>
                <td className="p-3">
                  <select value={usuario.rol} onChange={(e) => cambiarRol(usuario.uid, e.target.value as Rol)} className="border rounded px-2 py-1 text-xs">
                    <option value="maestro">maestro</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-gray-400">No hay usuarios registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}