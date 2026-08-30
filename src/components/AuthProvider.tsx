"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { Rol } from "@/types";
import { escucharSesion } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  rol: Rol | null;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  rol: null,
  cargando: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [rol, setRol] = useState<Rol | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
const unsub = escucharSesion((u: User | null, r: Rol | null) => {
  setUser(u);
  setRol(r);
  setCargando(false);
});
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, rol, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);