import { z } from "zod";

const estadosMesa = ["AVAILABLE", "OCCUPIED", "DIRTY", "CLEANING", "BLOCKED"];

const formasMesa = ["RECTANGLE", "ROUND"];

export const esquemaCrearMesa = z.object({
  numero: z.string().trim().min(1, "El número de mesa es obligatorio.").max(20),

  capacidad: z.coerce
    .number()
    .int()
    .min(1, "La capacidad debe ser al menos 1.")
    .max(50),

  pisoId: z.coerce.number().int().positive(),

  posicionX: z.coerce.number().int().min(0).optional(),

  posicionY: z.coerce.number().int().min(0).optional(),

  forma: z.enum(formasMesa).optional(),
});

export const esquemaActualizarMesa = z
  .object({
    numero: z.string().trim().min(1).max(20).optional(),

    capacidad: z.coerce.number().int().min(1).max(50).optional(),

    pisoId: z.coerce.number().int().positive().optional(),

    posicionX: z.coerce.number().int().min(0).optional(),

    posicionY: z.coerce.number().int().min(0).optional(),

    forma: z.enum(formasMesa).optional(),

    estado: z.enum(estadosMesa).optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Debes enviar al menos un dato para actualizar.",
  });

export const esquemaAsignarMesa = z.object({
  turnoId: z.coerce.number().int().positive(),

  permitirExcesoCapacidad: z.boolean().optional().default(false),
});
