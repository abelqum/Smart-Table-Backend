import { Server } from "socket.io";

import jwt from "jsonwebtoken";

import { entorno } from "../config/entorno.js";

import { prisma } from "../config/prisma.js";

function obtenerTokenSocket(socket) {
  const token = socket.handshake.auth?.token;

  if (typeof token !== "string" || !token.trim()) {
    return null;
  }

  return token.trim();
}

export function crearServidorSocket(servidorHttp) {
  const io = new Server(servidorHttp, {
    cors: {
      origin: entorno.frontendUrl,

      credentials: true,
    },
  });

  /*
   * ============================================================
   * AUTENTICACIÓN DEL SOCKET
   * ============================================================
   *
   * El socket utiliza el mismo JWT que nuestra API REST.
   *
   * No confiamos únicamente en los datos que el cliente
   * mande durante el handshake.
   *
   * Validamos:
   *
   * - JWT
   * - usuario existente
   * - usuario activo
   */
  io.use(async (socket, siguiente) => {
    try {
      const token = obtenerTokenSocket(socket);

      if (!token) {
        return siguiente(new Error("AUTENTICACION_REQUERIDA"));
      }

      const payload = jwt.verify(token, entorno.jwtSecret);

      const usuarioId = Number(payload.sub);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return siguiente(new Error("TOKEN_INVALIDO"));
      }

      const usuario = await prisma.usuario.findUnique({
        where: {
          id: usuarioId,
        },

        select: {
          id: true,

          restauranteId: true,

          nombre: true,

          correo: true,

          rol: true,

          activo: true,
        },
      });

      if (!usuario || !usuario.activo) {
        return siguiente(new Error("USUARIO_NO_DISPONIBLE"));
      }

      /*
       * Guardamos la identidad autenticada
       * dentro del socket.
       */
      socket.data.usuario = {
        id: usuario.id,

        restauranteId: usuario.restauranteId,

        nombre: usuario.nombre,

        correo: usuario.correo,

        rol: usuario.rol,
      };

      return siguiente();
    } catch (error) {
      if (error?.name === "TokenExpiredError") {
        return siguiente(new Error("TOKEN_EXPIRADO"));
      }

      return siguiente(new Error("TOKEN_INVALIDO"));
    }
  });

  /*
   * ============================================================
   * CONEXIONES
   * ============================================================
   */
  io.on("connection", (socket) => {
    const usuario = socket.data.usuario;

    /*
     * Cada restaurante tiene su propia sala.
     *
     * De esta forma un restaurante nunca recibe
     * cambios en tiempo real de otro restaurante.
     */
    const salaRestaurante = `restaurante:${usuario.restauranteId}`;

    socket.join(salaRestaurante);

    /*
     * También dejamos preparada una sala individual.
     *
     * Será útil posteriormente para notificaciones
     * dirigidas a un solo empleado.
     */
    socket.join(`usuario:${usuario.id}`);

    console.log(
      `Socket conectado: ${socket.id} | Usuario: ${usuario.id} | Restaurante: ${usuario.restauranteId}`,
    );

    socket.emit("smarttable:conectado", {
      mensaje: "Conectado a SmartTable en tiempo real.",

      usuario: {
        id: usuario.id,

        rol: usuario.rol,
      },
    });

    socket.on("disconnect", (motivo) => {
      console.log(`Socket desconectado: ${socket.id} | ${motivo}`);
    });
  });

  return io;
}
