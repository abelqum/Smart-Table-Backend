import { Server } from "socket.io";

import { entorno } from "../config/entorno.js";

export function crearServidorSocket(servidorHttp) {
  const io = new Server(servidorHttp, {
    cors: {
      origin: entorno.frontendUrl,

      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.emit("servidor:listo", {
      mensaje: "Conectado a SmartTable.",
    });

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });

  return io;
}
