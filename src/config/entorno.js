import "dotenv/config";

import { z } from "zod";

const esquemaEntorno = z.object({
  PORT: z.coerce.number().int().positive().default(4000),

  FRONTEND_URL: z.string().url(),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET debe contener al menos 32 caracteres."),

  DATABASE_URL: z
    .string()
    .regex(
      /^postgres(ql)?:\/\//,
      "DATABASE_URL debe ser una URL válida de PostgreSQL.",
    ),
});

const resultado = esquemaEntorno.safeParse(process.env);

if (!resultado.success) {
  console.error("Variables de entorno inválidas:");

  console.error(resultado.error.flatten().fieldErrors);

  throw new Error("No fue posible iniciar SmartTable Backend.");
}

export const entorno = {
  puerto: resultado.data.PORT,

  frontendUrl: resultado.data.FRONTEND_URL,

  jwtSecret: resultado.data.JWT_SECRET,

  databaseUrl: resultado.data.DATABASE_URL,
};
