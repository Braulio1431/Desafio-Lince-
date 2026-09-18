"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesion } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { Mail, Lock, LogIn } from "lucide-react";
import Image from "next/image";

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#7a0f18] px-4">
      {/* Fondo: gradiente diagonal rojo institucional */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #8f1119 0%, #c8102e 45%, #e2263c 70%, #8f1119 100%)",
        }}
      />

      {/* Formas geométricas decorativas */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rotate-12 bg-white/5" />
      <div className="absolute top-1/3 -right-32 w-[520px] h-[520px] rotate-45 bg-black/10" />
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 -skew-x-12 origin-top-right" />

      {/* Marca de agua del logo */}
      <Image
        src="/logo-uvm-white.png"
        alt=""
        width={900}
        height={225}
        className="absolute -bottom-16 -right-16 w-[700px] max-w-none opacity-10 pointer-events-none select-none"
        priority={false}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden"
      >
        {/* Barra de acento superior */}
        <div className="h-1.5 bg-gradient-to-r from-[#8f1119] via-[#D7282F] to-[#e2263c]" />

        <div className="p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
              <Image src="/logo-uvm.png" alt="UVM" width={40} height={40} className="h-9 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-[#D7282F] uppercase tracking-wide">
              Desafío Lince
            </h1>
            <p className="text-gray-500 text-sm">Inicia sesión para continuar</p>
          </div>

          {error && (
            <p className="text-[#D7282F] text-sm text-center bg-[#D7282F]/5 border border-[#D7282F]/20 py-2.5 rounded-lg">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D7282F]/40 focus:border-[#D7282F] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D7282F]/40 focus:border-[#D7282F] transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-[#D7282F] text-white py-2.5 rounded-lg font-medium hover:bg-[#B91F26] active:scale-[0.99] transition disabled:opacity-50"
          >
            <LogIn size={18} />
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}