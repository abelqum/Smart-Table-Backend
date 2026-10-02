import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

const ZONA_HORARIA = "America/Mexico_City";

function obtenerFechaOperacion() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,

    year: "numeric",

    month: "2-digit",

    day: "2-digit",
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return new Date(
    `${valores.year}-${valores.month}-${valores.day}T00:00:00.000Z`,
  );
}

function convertirTurno(turno) {
  return {
    id: turno.id,

    numero: turno.numero,

    nombre: turno.nombre,

    personas: turno.personas,

    estado: turno.estado,

    fechaHoraLlegada: turno.fechaHoraLlegada,

    llamadoEn: turno.llamadoEn,

    pisoPreferidoId: turno.pisoPreferidoId,

    pisoPreferido: turno.pisoPreferido
      ? {
          id: turno.pisoPreferido.id,

          nombre: turno.pisoPreferido.nombre,
        }
      : null,
  };
}

async function comprobarPisoPreferido(
  clientePrisma,
  restauranteId,
  pisoPreferidoId,
) {
  if (pisoPreferidoId === null || pisoPreferidoId === undefined) {
    return null;
  }

  const piso = await clientePrisma.piso.findFirst({
    where: {
      id: pisoPreferidoId,

      restauranteId,

      activo: true,
    },
  });

  if (!piso) {
    throw crearErrorHttp("La zona o piso seleccionado no existe.", 404);
  }

  return piso;
}

export async function obtenerTurnos(restauranteId) {
  const turnos = await prisma.turno.findMany({
    where: {
      restauranteId,

      /*
       * Ésta es la lista de espera.
       *
       * SEATED, COMPLETED y CANCELLED
       * ya no pertenecen aquí.
       */
      estado: "WAITING",
    },

    include: {
      pisoPreferido: {
        select: {
          id: true,

          nombre: true,
        },
      },
    },

    orderBy: {
      fechaHoraLlegada: "asc",
    },
  });

  return turnos.map(convertirTurno);
}

export async function obtenerTurnoActual(restauranteId) {
  const turno = await prisma.turno.findFirst({
    where: {
      restauranteId,

      estado: "WAITING",

      llamadoEn: {
        not: null,
      },
    },

    include: {
      pisoPreferido: {
        select: {
          id: true,

          nombre: true,
        },
      },
    },

    orderBy: {
      llamadoEn: "desc",
    },
  });

  if (!turno) {
    return null;
  }

  return convertirTurno(turno);
}

export async function obtenerTurnosParaMesa(restauranteId, mesaId, rolUsuario) {
  const mesa = await prisma.mesa.findFirst({
    where: {
      id: mesaId,

      restauranteId,

      activa: true,
    },

    include: {
      piso: {
        select: {
          id: true,

          nombre: true,
        },
      },
    },
  });

  if (!mesa) {
    throw crearErrorHttp("Mesa no encontrada.", 404);
  }
  if (mesa.estado !== "AVAILABLE") {
    return {
      mesa: {
        id: mesa.id,

        numero: mesa.numero,

        capacidad: mesa.capacidad,

        estado: mesa.estado,

        piso: {
          id: mesa.piso.id,

          nombre: mesa.piso.nombre,
        },
      },

      turnos: [],
    };
  }

  let turnos = await prisma.turno.findMany({
    where: {
      restauranteId,

      estado: "WAITING",
    },

    include: {
      pisoPreferido: {
        select: {
          id: true,

          nombre: true,
        },
      },
    },

    orderBy: {
      fechaHoraLlegada: "asc",
    },
  });

  /*
   * El mesero puede realizar asignaciones normales,
   * pero nunca exceder la capacidad.
   */
  if (rolUsuario === "WAITER") {
    turnos = turnos.filter((turno) => turno.personas <= mesa.capacidad);
  }

  /*
   * Orden:
   *
   * 1. Preferencia exacta por esta zona.
   * 2. Sin preferencia.
   * 3. Preferencia por otra zona.
   *
   * Dentro de cada grupo conservamos
   * el orden de llegada.
   */
  turnos.sort((turnoA, turnoB) => {
    function prioridad(turno) {
      if (turno.pisoPreferidoId === mesa.pisoId) {
        return 0;
      }

      if (turno.pisoPreferidoId === null) {
        return 1;
      }

      return 2;
    }

    const diferencia = prioridad(turnoA) - prioridad(turnoB);

    if (diferencia !== 0) {
      return diferencia;
    }

    return (
      new Date(turnoA.fechaHoraLlegada) - new Date(turnoB.fechaHoraLlegada)
    );
  });

  return {
    mesa: {
      id: mesa.id,

      numero: mesa.numero,

      capacidad: mesa.capacidad,

      estado: mesa.estado,

      piso: {
        id: mesa.piso.id,

        nombre: mesa.piso.nombre,
      },
    },

    turnos: turnos.map((turno) => ({
      ...convertirTurno(turno),

      cabeEnMesa: turno.personas <= mesa.capacidad,

      coincidePreferencia: turno.pisoPreferidoId === mesa.pisoId,
    })),
  };
}

export async function crearTurno(restauranteId, usuarioId, datos) {
  return prisma.$transaction(async (tx) => {
    await comprobarPisoPreferido(tx, restauranteId, datos.pisoPreferidoId);

    const fechaOperacion = obtenerFechaOperacion();

    const resultado = await tx.turno.aggregate({
      where: {
        restauranteId,

        fechaOperacion,
      },

      _max: {
        numero: true,
      },
    });

    const numero = (resultado._max.numero ?? 0) + 1;

    const turno = await tx.turno.create({
      data: {
        restauranteId,

        numero,

        fechaOperacion,

        nombre: datos.nombre,

        personas: datos.personas,

        pisoPreferidoId: datos.pisoPreferidoId ?? null,
      },

      include: {
        pisoPreferido: {
          select: {
            id: true,

            nombre: true,
          },
        },
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        turnoId: turno.id,

        usuarioId,

        tipo: "WAITLIST_CREATED",

        descripcion: `Turno #${turno.numero} agregado a la lista de espera.`,

        origen: "WEB",

        metadata: {
          personas: turno.personas,

          pisoPreferidoId: turno.pisoPreferidoId,
        },
      },
    });

    return convertirTurno(turno);
  });
}

export async function actualizarTurno(
  restauranteId,
  usuarioId,
  turnoId,
  datos,
) {
  return prisma.$transaction(async (tx) => {
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
      throw crearErrorHttp(
        "Sólo se pueden editar turnos que continúan en espera.",
        409,
      );
    }

    if (Object.prototype.hasOwnProperty.call(datos, "pisoPreferidoId")) {
      await comprobarPisoPreferido(tx, restauranteId, datos.pisoPreferidoId);
    }

    const turnoActualizado = await tx.turno.update({
      where: {
        id: turno.id,
      },

      data: datos,

      include: {
        pisoPreferido: {
          select: {
            id: true,

            nombre: true,
          },
        },
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        turnoId: turno.id,

        usuarioId,

        tipo: "WAITLIST_UPDATED",

        descripcion: `Turno #${turno.numero} actualizado.`,

        origen: "WEB",
      },
    });

    return convertirTurno(turnoActualizado);
  });
}

export async function llamarTurno(restauranteId, usuarioId, turnoId) {
  return prisma.$transaction(async (tx) => {
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
      throw crearErrorHttp(
        "Sólo se pueden llamar turnos que continúan en espera.",
        409,
      );
    }

    /*
     * Sólo puede existir UN turno actual.
     *
     * Si previamente se había llamado a otro
     * cliente y ahora llamamos uno nuevo,
     * dejamos de considerarlo el turno actual.
     */
    await tx.turno.updateMany({
      where: {
        restauranteId,

        estado: "WAITING",

        llamadoEn: {
          not: null,
        },

        id: {
          not: turno.id,
        },
      },

      data: {
        llamadoEn: null,
      },
    });

    const turnoActualizado = await tx.turno.update({
      where: {
        id: turno.id,
      },

      data: {
        llamadoEn: new Date(),
      },

      include: {
        pisoPreferido: {
          select: {
            id: true,

            nombre: true,
          },
        },
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        turnoId: turno.id,

        usuarioId,

        tipo: "WAITLIST_CALLED",

        descripcion: `Turno #${turno.numero} llamado.`,

        origen: "WEB",
      },
    });

    return convertirTurno(turnoActualizado);
  });
}

export async function cancelarTurno(restauranteId, usuarioId, turnoId) {
  return prisma.$transaction(async (tx) => {
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
      throw crearErrorHttp(
        "Sólo se pueden cancelar turnos que todavía están en espera.",
        409,
      );
    }

    const turnoActualizado = await tx.turno.update({
      where: {
        id: turno.id,
      },

      data: {
        estado: "CANCELLED",

        canceladoEn: new Date(),
      },

      include: {
        pisoPreferido: {
          select: {
            id: true,

            nombre: true,
          },
        },
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        turnoId: turno.id,

        usuarioId,

        tipo: "WAITLIST_CANCELLED",

        descripcion: `Turno #${turno.numero} cancelado.`,

        origen: "WEB",
      },
    });

    return convertirTurno(turnoActualizado);
  });
}
