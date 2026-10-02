import "dotenv/config";

import bcrypt from "bcrypt";

import { createHash } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const ZONA_HORARIA = "America/Mexico_City";

function obtenerHashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

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

function minutosAtras(minutos) {
  return new Date(Date.now() - minutos * 60 * 1000);
}

async function main() {
  console.log("Preparando datos iniciales de SmartTable...");

  /*
   * El seed es únicamente para desarrollo.
   * Lo hacemos reproducible para poder repetir
   * las pruebas del Prototipo 2.
   */
  await prisma.evento.deleteMany();

  await prisma.sesionMesa.deleteMany();

  await prisma.etiquetaNfc.deleteMany();

  await prisma.turno.deleteMany();

  await prisma.mesa.deleteMany();

  await prisma.piso.deleteMany();

  await prisma.usuario.deleteMany();

  await prisma.restaurante.deleteMany();

  /*
   * ============================================================
   * RESTAURANTE
   * ============================================================
   */

  const restaurante = await prisma.restaurante.create({
    data: {
      nombre: "Restaurante Demo",

      slug: "restaurante-demo",

      telefono: "55 1234 5678",

      direccion: "Ciudad de México",
    },
  });

  /*
   * ============================================================
   * USUARIOS
   * ============================================================
   */

  const passwordHash = await bcrypt.hash("123456", 12);

  const administrador = await prisma.usuario.create({
    data: {
      restauranteId: restaurante.id,

      nombre: "Administrador SmartTable",

      correo: "admin@smarttable.com",

      passwordHash,

      rol: "ADMIN",
    },
  });

  await prisma.usuario.createMany({
    data: [
      {
        restauranteId: restaurante.id,

        nombre: "Hostess Demo",

        correo: "hostess@smarttable.com",

        passwordHash,

        rol: "HOSTESS",
      },

      {
        restauranteId: restaurante.id,

        nombre: "Mesero Demo",

        correo: "mesero@smarttable.com",

        passwordHash,

        rol: "WAITER",
      },

      {
        restauranteId: restaurante.id,

        nombre: "Personal de Limpieza",

        correo: "limpieza@smarttable.com",

        passwordHash,

        rol: "CLEANING",
      },
    ],
  });

  /*
   * ============================================================
   * PISOS / ZONAS
   * ============================================================
   */

  const plantaBaja = await prisma.piso.create({
    data: {
      restauranteId: restaurante.id,

      nombre: "Planta baja",

      orden: 1,
    },
  });

  const terraza = await prisma.piso.create({
    data: {
      restauranteId: restaurante.id,

      nombre: "Terraza",

      orden: 2,
    },
  });

  /*
   * ============================================================
   * MESAS
   * ============================================================
   */

  const mesas = [];

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: plantaBaja.id,

        numero: "01",

        capacidad: 4,

        estado: "OCCUPIED",

        posicionX: 90,

        posicionY: 90,

        forma: "RECTANGLE",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: plantaBaja.id,

        numero: "02",

        capacidad: 4,

        estado: "AVAILABLE",

        posicionX: 300,

        posicionY: 90,

        forma: "RECTANGLE",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: plantaBaja.id,

        numero: "03",

        capacidad: 2,

        estado: "DIRTY",

        posicionX: 520,

        posicionY: 90,

        forma: "ROUND",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: plantaBaja.id,

        numero: "04",

        capacidad: 6,

        estado: "CLEANING",

        posicionX: 730,

        posicionY: 90,

        forma: "RECTANGLE",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: plantaBaja.id,

        numero: "05",

        capacidad: 4,

        estado: "AVAILABLE",

        posicionX: 170,

        posicionY: 310,

        forma: "ROUND",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: terraza.id,

        numero: "06",

        capacidad: 4,

        estado: "AVAILABLE",

        posicionX: 100,

        posicionY: 110,

        forma: "ROUND",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: terraza.id,

        numero: "07",

        capacidad: 2,

        estado: "AVAILABLE",

        posicionX: 320,

        posicionY: 110,

        forma: "ROUND",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: terraza.id,

        numero: "08",

        capacidad: 6,

        estado: "AVAILABLE",

        posicionX: 530,

        posicionY: 110,

        forma: "RECTANGLE",
      },
    }),
  );

  mesas.push(
    await prisma.mesa.create({
      data: {
        restauranteId: restaurante.id,

        pisoId: terraza.id,

        numero: "09",

        capacidad: 4,

        estado: "AVAILABLE",

        posicionX: 750,

        posicionY: 110,

        forma: "RECTANGLE",
      },
    }),
  );

  /*
   * ============================================================
   * TURNOS
   * ============================================================
   */

  const fechaOperacion = obtenerFechaOperacion();

  const turno1 = await prisma.turno.create({
    data: {
      restauranteId: restaurante.id,

      numero: 1,

      fechaOperacion,

      nombre: "Carlos",

      personas: 2,

      pisoPreferidoId: plantaBaja.id,

      estado: "WAITING",

      fechaHoraLlegada: minutosAtras(30),

      /*
       * Dejamos uno llamado para probar
       * el módulo Turno actual.
       */
      llamadoEn: minutosAtras(2),
    },
  });

  const turno2 = await prisma.turno.create({
    data: {
      restauranteId: restaurante.id,

      numero: 2,

      fechaOperacion,

      nombre: "Fernanda",

      personas: 4,

      pisoPreferidoId: terraza.id,

      estado: "WAITING",

      fechaHoraLlegada: minutosAtras(25),
    },
  });

  const turno3 = await prisma.turno.create({
    data: {
      restauranteId: restaurante.id,

      numero: 3,

      fechaOperacion,

      nombre: "Luis",

      personas: 5,

      pisoPreferidoId: null,

      estado: "WAITING",

      fechaHoraLlegada: minutosAtras(20),
    },
  });

  /*
   * Turno #4 ya fue sentado en Mesa 01.
   *
   * Sirve para tener una mesa OCCUPIED
   * completamente consistente con SesionMesa.
   */
  const turno4 = await prisma.turno.create({
    data: {
      restauranteId: restaurante.id,

      numero: 4,

      fechaOperacion,

      nombre: "Mariana",

      personas: 4,

      pisoPreferidoId: plantaBaja.id,

      estado: "SEATED",

      fechaHoraLlegada: minutosAtras(18),

      sentadoEn: minutosAtras(15),
    },
  });

  /*
   * Turno #5 ya terminó.
   * Su mesa permanece DIRTY.
   */
  const turno5 = await prisma.turno.create({
    data: {
      restauranteId: restaurante.id,

      numero: 5,

      fechaOperacion,

      nombre: "Roberto",

      personas: 2,

      estado: "COMPLETED",

      fechaHoraLlegada: minutosAtras(16),

      sentadoEn: minutosAtras(12),

      completadoEn: minutosAtras(4),
    },
  });

  /*
   * Turno #6 terminó y su mesa ya está
   * en proceso de limpieza.
   */
  const turno6 = await prisma.turno.create({
    data: {
      restauranteId: restaurante.id,

      numero: 6,

      fechaOperacion,

      nombre: "Andrea",

      personas: 4,

      estado: "COMPLETED",

      fechaHoraLlegada: minutosAtras(14),

      sentadoEn: minutosAtras(10),

      completadoEn: minutosAtras(3),
    },
  });

  /*
   * ============================================================
   * SESIONES DE MESA
   * ============================================================
   */

  await prisma.sesionMesa.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[0].id,

      turnoId: turno4.id,

      asignadoPorId: administrador.id,

      capacidadOriginal: mesas[0].capacidad,

      personasTurno: turno4.personas,

      excedeCapacidad: false,

      personasExtra: 0,

      excepcionCapacidadAutorizada: false,

      inicio: turno4.sentadoEn,
    },
  });

  await prisma.sesionMesa.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[2].id,

      turnoId: turno5.id,

      asignadoPorId: administrador.id,

      cerradoPorId: administrador.id,

      capacidadOriginal: mesas[2].capacidad,

      personasTurno: turno5.personas,

      excedeCapacidad: false,

      personasExtra: 0,

      excepcionCapacidadAutorizada: false,

      inicio: turno5.sentadoEn,

      fin: turno5.completadoEn,
    },
  });

  await prisma.sesionMesa.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[3].id,

      turnoId: turno6.id,

      asignadoPorId: administrador.id,

      cerradoPorId: administrador.id,

      capacidadOriginal: mesas[3].capacidad,

      personasTurno: turno6.personas,

      excedeCapacidad: false,

      personasExtra: 0,

      excepcionCapacidadAutorizada: false,

      inicio: turno6.sentadoEn,

      fin: turno6.completadoEn,
    },
  });

  /*
   * ============================================================
   * EVENTOS
   * ============================================================
   */

  for (const turno of [turno1, turno2, turno3]) {
    await prisma.evento.create({
      data: {
        restauranteId: restaurante.id,

        turnoId: turno.id,

        usuarioId: administrador.id,

        tipo: "WAITLIST_CREATED",

        descripcion: `Turno #${turno.numero} agregado a la lista de espera.`,

        origen: "WEB",
      },
    });
  }

  await prisma.evento.create({
    data: {
      restauranteId: restaurante.id,

      turnoId: turno1.id,

      usuarioId: administrador.id,

      tipo: "WAITLIST_CALLED",

      descripcion: `Turno #${turno1.numero} llamado.`,

      origen: "WEB",
    },
  });

  await prisma.evento.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[0].id,

      turnoId: turno4.id,

      usuarioId: administrador.id,

      tipo: "TABLE_ASSIGNED",

      descripcion: `Turno #${turno4.numero} confirmado en la mesa ${mesas[0].numero}.`,

      origen: "WEB",
    },
  });

  await prisma.evento.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[2].id,

      turnoId: turno5.id,

      usuarioId: administrador.id,

      tipo: "CUSTOMERS_LEFT",

      descripcion: `Los clientes se retiraron de la mesa ${mesas[2].numero}.`,

      origen: "WEB",
    },
  });

  await prisma.evento.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[3].id,

      turnoId: turno6.id,

      usuarioId: administrador.id,

      tipo: "CUSTOMERS_LEFT",

      descripcion: `Los clientes se retiraron de la mesa ${mesas[3].numero}.`,

      origen: "WEB",
    },
  });

  await prisma.evento.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[3].id,

      usuarioId: administrador.id,

      tipo: "CLEANING_STARTED",

      descripcion: `Se inició la limpieza de la mesa ${mesas[3].numero}.`,

      origen: "WEB",
    },
  });

  /*
   * ============================================================
   * NFC DE DESARROLLO
   * ============================================================
   */

  const tokenNfcMesa01 = "7fb1d324b16d49c39a8074d410f5345a";

  await prisma.etiquetaNfc.create({
    data: {
      restauranteId: restaurante.id,

      mesaId: mesas[0].id,

      tipo: "TABLE_OPERATION",

      tokenHash: obtenerHashToken(tokenNfcMesa01),
    },
  });

  console.log("");
  console.log("Seed completado.");

  console.log("");
  console.log("Credenciales:");

  console.log("admin@smarttable.com / 123456");

  console.log("hostess@smarttable.com / 123456");

  console.log("mesero@smarttable.com / 123456");

  console.log("limpieza@smarttable.com / 123456");

  console.log("");
  console.log("Lista de espera inicial: Turnos #1, #2 y #3");

  console.log("Turno actual llamado: #1");

  console.log("");
  console.log("NFC demo Mesa 01:");

  console.log(`Contenido NDEF: v=1;t=${tokenNfcMesa01}`);

  console.log("");
}

main()
  .catch((error) => {
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
