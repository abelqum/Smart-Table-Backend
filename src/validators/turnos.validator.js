import { z } from "zod";

const esquemaPisoPreferido = z.preprocess(
  (valor) => {
    if (valor === "" || valor === undefined) {
      return null;
    }

    return valor;
  },

  z.union([z.coerce.number().int().positive(), z.null()]),
);

export const esquemaCrearTurno = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(100),

  personas: z.coerce
    .number()
    .int()
    .min(1, "Debe haber al menos una persona.")
    .max(30, "El grupo no puede superar las 30 personas."),

  pisoPreferidoId: esquemaPisoPreferido.optional(),
});

export const esquemaActualizarTurno = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio.")
      .max(100)
      .optional(),

    personas: z.coerce.number().int().min(1).max(30).optional(),

    pisoPreferidoId: esquemaPisoPreferido.optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Debes enviar al menos un dato para actualizar.",
  });
