import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const rutas = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? [process.env.GOOGLE_APPLICATION_CREDENTIALS]
    : [path.join(process.cwd(), "serviceAccountKey.json"), path.join(process.cwd(), "..", "serviceAccountKey.json")];
  if (json) return initializeApp({ credential: cert(JSON.parse(json)) });
  const ruta = rutas.find((candidata) => fs.existsSync(candidata));
  if (ruta) {
    const serviceAccount = JSON.parse(fs.readFileSync(/* turbopackIgnore: true */ ruta, "utf8"));
    return initializeApp({ credential: cert(serviceAccount) });
  }
  // Permite compilar y usar el emulador; producción debe definir la cuenta de servicio.
  return initializeApp();
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
