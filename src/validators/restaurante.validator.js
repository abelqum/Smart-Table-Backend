import { z } from "zod";

export const esquemaActualizarRestaurante = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre debe contener al menos 2 caracteres.")
      .max(100)
      .optional(),

    telefono: z
      .union([
        z
          .string()
          .trim()
          .max(30, "El teléfono no puede superar los 30 caracteres."),

        z.null(),
      ])
      .optional(),

    direccion: z
      .union([
        z
          .string()
          .trim()
          .max(255, "La dirección no puede superar los 255 caracteres."),

        z.null(),
      ])
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
