import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

export async function obtenerPisos(restauranteId) {
  return prisma.piso.findMany({
    where: {
      restauranteId,
      activo: true,
    },

    select: {
      id: true,
      nombre: true,
      orden: true,
    },

    orderBy: [
      {
        orden: "asc",
      },

      {
        id: "asc",
      },
    ],
  });
}

export async function crearPiso(restauranteId, datos) {
  let orden = datos.orden;

  if (!orden) {
    const ultimoPiso = await prisma.piso.findFirst({
      where: {
        restauranteId,
      },

      orderBy: {
        orden: "desc",
      },

      select: {
        orden: true,
      },
    });

    orden = (ultimoPiso?.orden ?? 0) + 1;
  }

  return prisma.piso.create({
    data: {
      restauranteId,

      nombre: datos.nombre,

      orden,
    },

    select: {
      id: true,
      nombre: true,
      orden: true,
    },
  });
}

export async function actualizarPiso(restauranteId, pisoId, datos) {
  const piso = await prisma.piso.findFirst({
    where: {
      id: pisoId,

      restauranteId,
    },
  });

  if (!piso) {
    throw crearErrorHttp("Piso no encontrado.", 404);
  }

  return prisma.piso.update({
    where: {
      id: piso.id,
    },

    data: datos,

    select: {
      id: true,
      nombre: true,
      orden: true,
    },
  });
}

export async function eliminarPiso(restauranteId, pisoId) {
  const piso = await prisma.piso.findFirst({
    where: {
      id: pisoId,

      restauranteId,
    },

    include: {
      _count: {
        select: {
          mesas: true,
        },
      },
    },
  });

  if (!piso) {
    throw crearErrorHttp("Piso no encontrado.", 404);
  }

  if (piso._count.mesas > 0) {
    throw crearErrorHttp(
      "No puedes eliminar un piso que todavía contiene mesas.",
      409,
    );
  }

  await prisma.piso.delete({
    where: {
      id: piso.id,
    },
  });

  return {
    mensaje: "Piso eliminado correctamente.",
  };
}
