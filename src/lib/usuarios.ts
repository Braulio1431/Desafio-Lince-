import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Usuario } from "@/types";

export function escucharUsuarios(callback: (usuarios: Usuario[]) => void) {
  return onSnapshot(collection(db, "usuarios"), (snapshot) => {
    const usuarios = snapshot.docs.map((d) => ({
      uid: d.id,
      ...d.data(),
    })) as Usuario[];
    callback(usuarios);
  });
}