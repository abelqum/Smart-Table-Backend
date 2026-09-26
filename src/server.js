import { createServer } from "node:http";

import app from "./app.js";

import { entorno } from "./config/entorno.js";

import { prisma } from "./config/prisma.js";

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

async function cerrarServidor(senal) {
  console.log(`\n${senal} recibido. Cerrando SmartTable...`);

  servidorHttp.close(async () => {
    try {
      await prisma.$disconnect();

      console.log("Conexión con PostgreSQL cerrada.");

      console.log("Servidor cerrado.");

      process.exit(0);
    } catch (error) {
      console.error("Error durante el cierre:", error);

      process.exit(1);
    }
  });
}

process.on("SIGINT", () => cerrarServidor("SIGINT"));

process.on("SIGTERM", () => cerrarServidor("SIGTERM"));
