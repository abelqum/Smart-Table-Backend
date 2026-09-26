import { createServer } from "node:http";

import app from "./app.js";

import { entorno } from "./config/entorno.js";

import { crearServidorSocket } from "./realtime/socket.js";

const servidorHttp = createServer(app);

export const io = crearServidorSocket(servidorHttp);

servidorHttp.listen(entorno.puerto, () => {
  console.log("");
  console.log("SmartTable Backend iniciado");

  console.log(`API: http://localhost:${entorno.puerto}/api`);

  console.log(`Health: http://localhost:${entorno.puerto}/api/health`);

  console.log("");
});

function cerrarServidor(senal) {
  console.log(`\n${senal} recibido. Cerrando servidor...`);

  servidorHttp.close(() => {
    console.log("Servidor cerrado.");

    process.exit(0);
  });
}

process.on("SIGINT", () => cerrarServidor("SIGINT"));

process.on("SIGTERM", () => cerrarServidor("SIGTERM"));
