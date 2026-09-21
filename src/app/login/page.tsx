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
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background:
          "radial-gradient(120% 120% at 50% 0%, #d7282f 0%, #d7282f 75%, #a22327 100%)",
      }}
    >
      {/* Marca UVM arriba */}
      <Image
        src="/logo-uvm-white.png"
        alt="UVM"
        width={140}
        height={35}
        className="h-6 w-auto mb-10 opacity-95"
        priority
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white rounded-2xl shadow-[0_25px_70px_-20px_rgba(0,0,0,0.55)] w-full max-w-sm p-8 space-y-6"
      >
        <div className="flex justify-center">
          <Image
            src="/desafio-lince-logo1.png"
            alt="Desafío Lince"
            width={260}
            height={140}
            className="h-28 w-auto"
            priority
          />
        </div>

        {error && (
          <p className="text-[#D7282F] text-sm text-center bg-[#D7282F]/5 border border-[#D7282F]/20 py-2.5 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#202124] mb-1.5">
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
            <label className="block text-sm font-medium text-[#202124] mb-1.5">
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
          className="w-full flex items-center justify-center gap-2 bg-[#D7282F] text-white py-3 rounded-lg font-semibold hover:bg-[#B91F26] active:scale-[0.99] transition disabled:opacity-50"
        >
          <LogIn size={18} />
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}