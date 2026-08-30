const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const uid = "sPR8nt7p3rRfrHQlcgVaOPHwtCF2"; //UID del usuario a asignar el rol 
const rol = "admin"; // Rol seleccionado (puede ser "admin" o "maestro")

getAuth()
  .setCustomUserClaims(uid, { rol })
  .then(() => {
    console.log(`Rol "${rol}" asignado a ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
  // codigo para correrlo es: node asignar-rol.js