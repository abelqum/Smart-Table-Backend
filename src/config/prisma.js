import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.ts";

import { entorno } from "./entorno.js";

const adapter = new PrismaPg({
  connectionString: entorno.databaseUrl,
});

export const prisma = new PrismaClient({
  adapter,
});
