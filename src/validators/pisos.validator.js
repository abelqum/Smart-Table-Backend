import { z } from "zod";

export const esquemaCrearPiso = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre del piso es obligatorio.")
    .max(80),

  orden: z.coerce.number().int().min(1).optional(),
});

export const esquemaActualizarPiso = z
  .object({
    nombre: z.string().trim().min(1).max(80).optional(),

    orden: z.coerce.number().int().min(1).optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Debes enviar al menos un dato para actualizar.",
  });
