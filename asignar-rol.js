// Uso: node asignar-rol.js <uid> <admin|maestro>
// Requiere serviceAccountKey.json local. Después de cambiar el rol, el usuario
// debe cerrar sesión y volver a entrar para recibir el nuevo token.
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");
const path = require("path");
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), "..", "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

const uid = process.argv[2];
const rol = process.argv[3];
if (!uid || !["admin", "maestro"].includes(rol)) {
  console.error("Uso: node asignar-rol.js <uid> <admin|maestro>");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
getAuth().setCustomUserClaims(uid, { rol })
  .then(() => console.log(`Rol "${rol}" asignado a ${uid}. El usuario debe iniciar sesión nuevamente.`))
  .catch((err) => { console.error("No se pudo asignar el rol:", err.message); process.exit(1); });
