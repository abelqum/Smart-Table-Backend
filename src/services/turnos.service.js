import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

function convertirTurno(turno) {
  return {
    id: turno.id,

    turno: turno.codigo,

    codigo: turno.codigo,

    nombre: turno.nombre,

    personas: turno.personas,

    fechaHoraLlegada: turno.fechaHoraLlegada,

    estado: turno.estado,
  };
}

async function generarCodigoTurno(tx, restauranteId) {
  const ultimoTurno = await tx.turno.findFirst({
    where: {
      restauranteId,
    },

    orderBy: {
      id: "desc",
    },

    select: {
      codigo: true,
    },
  });

  let siguienteNumero = 1;

  if (ultimoTurno) {
    const coincidencia = ultimoTurno.codigo.match(/(\d+)$/);

    if (coincidencia) {
      siguienteNumero = Number(coincidencia[1]) + 1;
    }
  }

  return `A${String(siguienteNumero).padStart(3, "0")}`;
}

export async function obtenerTurnos(restauranteId) {
  const turnos = await prisma.turno.findMany({
    where: {
      restauranteId,
    },

    orderBy: {
      fechaHoraLlegada: "asc",
    },
  });

  return turnos.map(convertirTurno);
}

export async function crearTurno(restauranteId, usuarioId, datos) {
  return prisma.$transaction(async (tx) => {
    const codigo = await generarCodigoTurno(tx, restauranteId);

    const turno = await tx.turno.create({
      data: {
        restauranteId,

        codigo,

        nombre: datos.nombre,

        personas: datos.personas,
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        turnoId: turno.id,

        usuarioId,

        tipo: "WAITLIST_CREATED",

        descripcion: `Turno ${turno.codigo} agregado a la lista de espera.`,

        origen: "WEB",
      },
    });

    return convertirTurno(turno);
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
    });

    await tx.evento.create({
      data: {
        restauranteId,

        turnoId: turno.id,

        usuarioId,

        tipo: "WAITLIST_CANCELLED",

        descripcion: `Turno ${turno.codigo} cancelado.`,

        origen: "WEB",
      },
    });

    return convertirTurno(turnoActualizado);
  });
}
