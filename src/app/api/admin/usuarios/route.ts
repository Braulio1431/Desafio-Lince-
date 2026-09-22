import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const ROLES = ["admin", "maestro", "subadmin"] as const;

async function requiereAdmin(request: NextRequest) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const actual = await adminAuth.verifyIdToken(token);
  if (actual.rol !== "admin" && actual.role !== "admin") return null;
  return actual;
}

export async function POST(request: NextRequest) {
  try {
    const actual = await requiereAdmin(request);
    if (!actual) return NextResponse.json({ error: "Sólo un administrador puede crear usuarios" }, { status: 403 });

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
    const actual = await requiereAdmin(request);
    if (!actual) return NextResponse.json({ error: "Sólo un administrador puede editar usuarios" }, { status: 403 });

    const body = await request.json() as { uid?: string; rol?: string; nombre?: string; correo?: string; password?: string };
    if (!body.uid) return NextResponse.json({ error: "Falta el UID del usuario" }, { status: 400 });
    if (body.rol && !ROLES.includes(body.rol as (typeof ROLES)[number])) return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    if (body.password && body.password.length < 6) return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });

    const cambiosAuth: { displayName?: string; email?: string; password?: string } = {};
    if (body.nombre?.trim()) cambiosAuth.displayName = body.nombre.trim();
    if (body.correo?.trim()) cambiosAuth.email = body.correo.trim().toLowerCase();
    if (body.password) cambiosAuth.password = body.password;
    if (Object.keys(cambiosAuth).length > 0) {
      await adminAuth.updateUser(body.uid, cambiosAuth);
    }

    if (body.rol) await adminAuth.setCustomUserClaims(body.uid, { rol: body.rol });

    const cambiosFirestore: { nombre?: string; correo?: string; rol?: string } = {};
    if (body.nombre?.trim()) cambiosFirestore.nombre = body.nombre.trim();
    if (body.correo?.trim()) cambiosFirestore.correo = body.correo.trim().toLowerCase();
    if (body.rol) cambiosFirestore.rol = body.rol;
    if (Object.keys(cambiosFirestore).length > 0) {
      await adminDb.collection("usuarios").doc(body.uid).set(cambiosFirestore, { merge: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo actualizar el usuario" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actual = await requiereAdmin(request);
    if (!actual) return NextResponse.json({ error: "Sólo un administrador puede eliminar usuarios" }, { status: 403 });

    const body = await request.json() as { uid?: string };
    if (!body.uid) return NextResponse.json({ error: "Falta el UID del usuario" }, { status: 400 });

    await adminAuth.deleteUser(body.uid);
    await adminDb.collection("usuarios").doc(body.uid).delete();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo eliminar el usuario" }, { status: 400 });
  }
}