"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesion } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const router = useRouter();
  const { user, rol, cargando } = useAuth();

  useEffect(() => {
    if (cargando || !user) return;
    if (rol === "admin") router.replace("/admin");
    if (rol === "maestro") router.replace("/maestro/dashboard");
  }, [user, rol, cargando, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await iniciarSesion(correo, password);
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-none shadow-sm border border-gray-200 w-full max-w-sm space-y-5"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-[#D7282F] uppercase tracking-wide">
            Desafío Lince
          </h1>
          <p className="text-gray-500 text-sm">Inicia sesión para continuar</p>
        </div>

        {error && (
          <p className="text-[#D7282F] text-sm text-center bg-[#D7282F]/5 border border-[#D7282F]/30 py-2 rounded-none">
            {error}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#D7282F] focus:border-[#D7282F]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#D7282F] focus:border-[#D7282F]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 bg-[#D7282F] text-white py-2 rounded-none font-medium hover:bg-[#B91F26] transition disabled:opacity-50"
        >
          <LogIn size={18} />
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}