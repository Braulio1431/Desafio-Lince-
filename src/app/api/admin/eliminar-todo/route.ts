import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  const autorizacion = request.headers.get("authorization");
  const token = autorizacion?.startsWith("Bearer ") ? autorizacion.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Falta el token de sesión." }, { status: 401 });

  try {
    const usuario = await adminAuth.verifyIdToken(token);
    if (usuario.rol !== "admin" && usuario.role !== "admin") {
      return NextResponse.json({ error: "Solo un administrador puede ejecutar esta acción." }, { status: 403 });
    }

    const colecciones = ["equipos", "entregas", "calificaciones"];
    let eliminados = { proyectos: 0, entregas: 0, calificaciones: 0 };
    for (const nombre of colecciones) {
      const snapshot = await adminDb.collection(nombre).get();
      for (let inicio = 0; inicio < snapshot.docs.length; inicio += 450) {
        const lote = adminDb.batch();
        snapshot.docs.slice(inicio, inicio + 450).forEach((registro) => lote.delete(registro.ref));
        await lote.commit();
      }
      if (nombre === "equipos") eliminados.proyectos = snapshot.size;
      if (nombre === "entregas") eliminados.entregas = snapshot.size;
      if (nombre === "calificaciones") eliminados.calificaciones = snapshot.size;
    }
    return NextResponse.json(eliminados);
  } catch (error) {
    console.error("Error en borrado general:", error);
    return NextResponse.json({ error: "No se pudieron eliminar los registros." }, { status: 500 });
  }
}
