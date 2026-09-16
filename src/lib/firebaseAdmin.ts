import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const ruta = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? path.join(process.cwd(), "..", "serviceAccountKey.json");
  const serviceAccount = JSON.parse(json ?? fs.readFileSync(/* turbopackIgnore: true */ ruta, "utf8"));
  return initializeApp({ credential: cert(serviceAccount) });
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
