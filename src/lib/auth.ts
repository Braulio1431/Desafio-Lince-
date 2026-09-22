import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";
import { Rol } from "@/types";

export async function iniciarSesion(correo: string, password: string) {
  return signInWithEmailAndPassword(auth, correo, password);
}

export async function cerrarSesion() {
  return signOut(auth);
}

export async function obtenerRol(user: User): Promise<Rol | null> {
  const tokenResult = await user.getIdTokenResult(true);
  const claim = tokenResult.claims.rol ?? tokenResult.claims.role;
 return claim === "admin" || claim === "maestro" || claim === "subadmin" ? claim : null;
}

export function escucharSesion(
  callback: (user: User | null, rol: Rol | null) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, null);
      return;
    }
    const rol = await obtenerRol(user);
    callback(user, rol);
  });
}
