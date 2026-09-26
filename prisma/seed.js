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

function obtenerHashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function main() {
  console.log("Preparando datos iniciales de SmartTable...");

  /*
   * El seed es para desarrollo.
   * Reiniciamos los datos para que sea reproducible.
   */
  await prisma.evento.deleteMany();

  await prisma.sesionMesa.deleteMany();

  await prisma.etiquetaNfc.deleteMany();

  await prisma.turno.deleteMany();

  await prisma.mesa.deleteMany();

  await prisma.piso.deleteMany();

  await prisma.usuario.deleteMany();

  await prisma.restaurante.deleteMany();

  const restaurante = await prisma.restaurante.create({
    data: {
      nombre: "Restaurante Demo",

      slug: "restaurante-demo",
    },
  });

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

  const turnos = await Promise.all([
    prisma.turno.create({
      data: {
        restauranteId: restaurante.id,

        codigo: "A021",

        nombre: "Carlos",

        personas: 2,

        estado: "WAITING",
      },
    }),

    prisma.turno.create({
      data: {
        restauranteId: restaurante.id,

        codigo: "A022",

        nombre: "Fernanda",

        personas: 4,

        estado: "WAITING",
      },
    }),

    prisma.turno.create({
      data: {
        restauranteId: restaurante.id,

        codigo: "A023",

        nombre: "Luis",

        personas: 5,

        estado: "WAITING",
      },
    }),
  ]);

  for (const turno of turnos) {
    await prisma.evento.create({
      data: {
        restauranteId: restaurante.id,

        turnoId: turno.id,

        usuarioId: administrador.id,

        tipo: "WAITLIST_CREATED",

        descripcion: `Turno ${turno.codigo} agregado a la lista de espera.`,

        origen: "WEB",
      },
    });
  }

  /*
   * Token de desarrollo.
   *
   * Lo guardamos sólo como hash en PostgreSQL.
   * El valor en texto plano representa lo que
   * posteriormente escribiremos en una NTAG213.
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
  console.log("Usuario administrador:");

  console.log("admin@smarttable.com / 123456");

  console.log("");
  console.log("NFC demo Mesa 01:");

  console.log(`Token: ${tokenNfcMesa01}`);

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
