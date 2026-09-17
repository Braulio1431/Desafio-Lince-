import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const ROLES = ["admin", "maestro"] as const;

export async function POST(request: NextRequest) {
  try {
    const header = request.headers.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return NextResponse.json({ error: "No autorizado: falta el token de sesión." }, { status: 401 });
    const actual = await adminAuth.verifyIdToken(token);
    if (actual.rol !== "admin" && actual.role !== "admin") return NextResponse.json({ error: "Sólo un administrador puede crear usuarios" }, { status: 403 });

    const body = await request.json() as { nombre?: string; correo?: string; password?: string; rol?: string };
    const nombre = body.nombre?.trim(); const correo = body.correo?.trim().toLowerCase(); const password = body.password; const rol = body.rol;
    if (!nombre || !correo || !password || !rol || !ROLES.includes(rol as (typeof ROLES)[number])) return NextResponse.json({ error: "Nombre, correo, contraseña y rol son obligatorios" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

    const user = await adminAuth.createUser({ displayName: nombre, email: correo, password });
    await adminAuth.setCustomUserClaims(user.uid, { rol });
    await adminDb.collection("usuarios").doc(user.uid).set({ uid: user.uid, nombre, correo, rol, creadoEn: FieldValue.serverTimestamp() });
    return NextResponse.json({ uid: user.uid, nombre, correo, rol });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el usuario";
    const errorResponse = /credential|Project Id|private_key/i.test(message)
      ? "El servidor no tiene credenciales de Firebase Admin. Configura FIREBASE_SERVICE_ACCOUNT_JSON en las variables de entorno del despliegue."
      : message;
    return NextResponse.json({ error: errorResponse }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const header = request.headers.get("authorization"); const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    const actual = token ? await adminAuth.verifyIdToken(token) : null;
    if (!actual || (actual.rol !== "admin" && actual.role !== "admin")) return NextResponse.json({ error: "Sólo un administrador puede cambiar roles" }, { status: 403 });
    const body = await request.json() as { uid?: string; rol?: string };
    if (!body.uid || !ROLES.includes(body.rol as (typeof ROLES)[number])) return NextResponse.json({ error: "UID o rol inválido" }, { status: 400 });
    await adminAuth.setCustomUserClaims(body.uid, { rol: body.rol });
    await adminDb.collection("usuarios").doc(body.uid).set({ rol: body.rol }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo cambiar el rol" }, { status: 400 }); }
}
