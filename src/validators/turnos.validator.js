import { z } from "zod";

export const esquemaCrearTurno = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(100),

  personas: z.coerce
    .number()
    .int()
    .min(1, "Debe haber al menos una persona.")
    .max(30, "El grupo no puede superar las 30 personas."),
});
