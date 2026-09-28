import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

const incluirSesionActiva = {
  sesiones: {
    where: {
      fin: null,
    },

    orderBy: {
      inicio: "desc",
    },

    take: 1,

    include: {
      turno: true,
    },
  },
};

function convertirMesa(mesa) {
  const sesionActiva = mesa.sesiones?.[0] ?? null;

  return {
    id: mesa.id,

    numero: mesa.numero,

    capacidad: mesa.capacidad,

    estado: mesa.estado,

    pisoId: mesa.pisoId,

    posicionX: mesa.posicionX,

    posicionY: mesa.posicionY,

    forma: mesa.forma,

    turnoAsignado: sesionActiva
      ? {
          id: sesionActiva.turno.id,

          turno: sesionActiva.turno.codigo,

          codigo: sesionActiva.turno.codigo,

          nombre: sesionActiva.turno.nombre,

          personas: sesionActiva.turno.personas,

          excedeCapacidad: sesionActiva.excedeCapacidad,

          personasExtra: sesionActiva.personasExtra,

          asignacionManual: sesionActiva.asignacionManual,
        }
      : null,
  };
}

async function comprobarPiso(clientePrisma, restauranteId, pisoId) {
  const piso = await clientePrisma.piso.findFirst({
    where: {
      id: pisoId,

      restauranteId,

      activo: true,
    },
  });

  if (!piso) {
    throw crearErrorHttp("El piso seleccionado no existe.", 404);
  }

  return piso;
}

export async function obtenerMesas(restauranteId) {
  const mesas = await prisma.mesa.findMany({
    where: {
      restauranteId,
      activa: true,
    },

    include: incluirSesionActiva,

    orderBy: {
      numero: "asc",
    },
  });

  return mesas.map(convertirMesa);
}

export async function obtenerMesa(restauranteId, mesaId) {
  const mesa = await prisma.mesa.findFirst({
    where: {
      id: mesaId,

      restauranteId,

      activa: true,
    },

    include: incluirSesionActiva,
  });

  if (!mesa) {
    throw crearErrorHttp("Mesa no encontrada.", 404);
  }

  return convertirMesa(mesa);
}

export async function crearMesa(restauranteId, datos) {
  await comprobarPiso(prisma, restauranteId, datos.pisoId);

  const mesa = await prisma.mesa.create({
    data: {
      restauranteId,

      pisoId: datos.pisoId,

      numero: datos.numero,

      capacidad: datos.capacidad,

      posicionX: datos.posicionX ?? 0,

      posicionY: datos.posicionY ?? 0,

      forma: datos.forma ?? "RECTANGLE",
    },

    include: incluirSesionActiva,
  });

  return convertirMesa(mesa);
}

export async function actualizarMesa(restauranteId, mesaId, datos) {
  const mesaActual = await prisma.mesa.findFirst({
    where: {
      id: mesaId,

      restauranteId,

      activa: true,
    },
  });

  if (!mesaActual) {
    throw crearErrorHttp("Mesa no encontrada.", 404);
  }

  if (datos.pisoId) {
    await comprobarPiso(prisma, restauranteId, datos.pisoId);
  }

  const mesa = await prisma.mesa.update({
    where: {
      id: mesaActual.id,
    },

    data: datos,

    include: incluirSesionActiva,
  });

  return convertirMesa(mesa);
}

export async function eliminarMesa(restauranteId, mesaId) {
  const mesa = await prisma.mesa.findFirst({
    where: {
      id: mesaId,

      restauranteId,
    },

    include: {
      _count: {
        select: {
          sesiones: true,
        },
      },
    },
  });

  if (!mesa) {
    throw crearErrorHttp("Mesa no encontrada.", 404);
  }

  if (mesa._count.sesiones > 0) {
    throw crearErrorHttp(
      "No puedes eliminar una mesa que ya tiene historial operativo.",
      409,
    );
  }

  await prisma.mesa.delete({
    where: {
      id: mesa.id,
    },
  });

  return {
    mensaje: "Mesa eliminada correctamente.",
  };
}

export async function asignarTurnoAMesa(
  restauranteId,
  usuarioId,
  mesaId,
  { turnoId, permitirExcesoCapacidad },
) {
  return prisma.$transaction(async (tx) => {
    const mesa = await tx.mesa.findFirst({
      where: {
        id: mesaId,

        restauranteId,

        activa: true,
      },
    });

    if (!mesa) {
      throw crearErrorHttp("Mesa no encontrada.", 404);
    }

    if (mesa.estado !== "AVAILABLE") {
      throw crearErrorHttp("La mesa no se encuentra disponible.", 409);
    }

    const turno = await tx.turno.findFirst({
      where: {
        id: turnoId,

        restauranteId,
      },
    });

    if (!turno) {
      throw crearErrorHttp("Turno no encontrado.", 404);
    }

    if (turno.estado !== "WAITING") {
      throw crearErrorHttp("El turno ya no se encuentra en espera.", 409);
    }

    const personasExtra = Math.max(turno.personas - mesa.capacidad, 0);

    const excedeCapacidad = personasExtra > 0;

    if (excedeCapacidad && !permitirExcesoCapacidad) {
      throw crearErrorHttp(
        `El grupo tiene ${turno.personas} personas y la mesa tiene capacidad para ${mesa.capacidad}. La asignación automática no puede exceder la capacidad.`,
        409,
      );
    }

    const ahora = new Date();

    const sesion = await tx.sesionMesa.create({
      data: {
        restauranteId,

        mesaId: mesa.id,

        turnoId: turno.id,

        asignadoPorId: usuarioId,

        capacidadOriginal: mesa.capacidad,

        personasTurno: turno.personas,

        excedeCapacidad,

        personasExtra,

        asignacionManual: excedeCapacidad,
      },
    });

    await tx.mesa.update({
      where: {
        id: mesa.id,
      },

      data: {
        estado: "OCCUPIED",
      },
    });

    await tx.turno.update({
      where: {
        id: turno.id,
      },

      data: {
        estado: "SEATED",

        sentadoEn: ahora,
      },
    });

    const tipoEvento = excedeCapacidad
      ? "TABLE_ASSIGNED_CAPACITY_OVERRIDE"
      : "TABLE_ASSIGNED";

    await tx.evento.create({
      data: {
        restauranteId,

        mesaId: mesa.id,

        turnoId: turno.id,

        usuarioId,

        tipo: tipoEvento,

        descripcion: excedeCapacidad
          ? `Turno ${turno.codigo} asignado manualmente a la mesa ${mesa.numero} excediendo su capacidad por ${personasExtra} persona(s).`
          : `Turno ${turno.codigo} asignado a la mesa ${mesa.numero}.`,

        origen: "WEB",

        metadata: {
          capacidad: mesa.capacidad,

          personas: turno.personas,

          personasExtra,

          sesionMesaId: sesion.id,
        },
      },
    });

    const mesaActualizada = await tx.mesa.findUnique({
      where: {
        id: mesa.id,
      },

      include: incluirSesionActiva,
    });

    return convertirMesa(mesaActualizada);
  });
}

export async function registrarSalidaClientes(
  restauranteId,
  usuarioId,
  mesaId,
) {
  return prisma.$transaction(async (tx) => {
    const mesa = await tx.mesa.findFirst({
      where: {
        id: mesaId,

        restauranteId,
      },
    });

    if (!mesa) {
      throw crearErrorHttp("Mesa no encontrada.", 404);
    }

    if (mesa.estado !== "OCCUPIED") {
      throw crearErrorHttp("La mesa no se encuentra ocupada.", 409);
    }

    const sesion = await tx.sesionMesa.findFirst({
      where: {
        mesaId: mesa.id,

        restauranteId,

        fin: null,
      },

      include: {
        turno: true,
      },

      orderBy: {
        inicio: "desc",
      },
    });

    if (!sesion) {
      throw crearErrorHttp("No existe una sesión activa para esta mesa.", 409);
    }

    const ahora = new Date();

    await tx.sesionMesa.update({
      where: {
        id: sesion.id,
      },

      data: {
        fin: ahora,

        cerradoPorId: usuarioId,
      },
    });

    await tx.turno.update({
      where: {
        id: sesion.turnoId,
      },

      data: {
        estado: "COMPLETED",

        completadoEn: ahora,
      },
    });

    await tx.mesa.update({
      where: {
        id: mesa.id,
      },

      data: {
        estado: "DIRTY",
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        mesaId: mesa.id,

        turnoId: sesion.turnoId,

        usuarioId,

        tipo: "CUSTOMERS_LEFT",

        descripcion: `Los clientes se retiraron de la mesa ${mesa.numero}.`,

        origen: "WEB",
      },
    });

    const mesaActualizada = await tx.mesa.findUnique({
      where: {
        id: mesa.id,
      },

      include: incluirSesionActiva,
    });

    return convertirMesa(mesaActualizada);
  });
}

export async function iniciarLimpiezaMesa(restauranteId, usuarioId, mesaId) {
  return prisma.$transaction(async (tx) => {
    const mesa = await tx.mesa.findFirst({
      where: {
        id: mesaId,

        restauranteId,
      },
    });

    if (!mesa) {
      throw crearErrorHttp("Mesa no encontrada.", 404);
    }

    if (mesa.estado !== "DIRTY") {
      throw crearErrorHttp("La mesa debe estar pendiente de limpieza.", 409);
    }

    await tx.mesa.update({
      where: {
        id: mesa.id,
      },

      data: {
        estado: "CLEANING",
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        mesaId: mesa.id,

        usuarioId,

        tipo: "CLEANING_STARTED",

        descripcion: `Se inició la limpieza de la mesa ${mesa.numero}.`,

        origen: "WEB",
      },
    });

    const mesaActualizada = await tx.mesa.findUnique({
      where: {
        id: mesa.id,
      },

      include: incluirSesionActiva,
    });

    return convertirMesa(mesaActualizada);
  });
}

export async function finalizarLimpiezaMesa(restauranteId, usuarioId, mesaId) {
  return prisma.$transaction(async (tx) => {
    const mesa = await tx.mesa.findFirst({
      where: {
        id: mesaId,

        restauranteId,
      },
    });

    if (!mesa) {
      throw crearErrorHttp("Mesa no encontrada.", 404);
    }

    if (mesa.estado !== "CLEANING") {
      throw crearErrorHttp("La mesa no se encuentra en limpieza.", 409);
    }

    await tx.mesa.update({
      where: {
        id: mesa.id,
      },

      data: {
        estado: "AVAILABLE",
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        mesaId: mesa.id,

        usuarioId,

        tipo: "CLEANING_FINISHED",

        descripcion: `La limpieza de la mesa ${mesa.numero} finalizó y vuelve a estar disponible.`,

        origen: "WEB",
      },
    });

    const mesaActualizada = await tx.mesa.findUnique({
      where: {
        id: mesa.id,
      },

      include: incluirSesionActiva,
    });

    return convertirMesa(mesaActualizada);
  });
}
