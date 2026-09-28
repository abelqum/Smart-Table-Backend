import { prisma } from "../config/prisma.js";

export async function obtenerEventos(restauranteId) {
  const eventos = await prisma.evento.findMany({
    where: {
      restauranteId,
    },

    include: {
      mesa: {
        select: {
          numero: true,
        },
      },

      usuario: {
        select: {
          nombre: true,
        },
      },
    },

    orderBy: {
      fechaHora: "desc",
    },

    take: 200,
  });

  return eventos.map((evento) => ({
    id: evento.id,

    mesaId: evento.mesaId,

    mesaNumero: evento.mesa?.numero ?? null,

    tipo: evento.tipo,

    descripcion: evento.descripcion,

    usuario: evento.usuario?.nombre ?? "Sistema",

    origen: evento.origen,

    fechaHora: evento.fechaHora,
  }));
}
