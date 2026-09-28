import { z } from "zod";

export const esquemaActualizarRestaurante = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre debe contener al menos 2 caracteres.")
      .max(100)
      .optional(),

    menuUrl: z
      .union([
        z.string().trim().url("La URL del menú no es válida."),

        z.literal(""),

        z.null(),
      ])
      .optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Debes enviar al menos un dato para actualizar.",
  });
