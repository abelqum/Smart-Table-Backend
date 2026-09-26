import { z } from "zod";

export const esquemaLogin = z.object({
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresa un correo electrónico válido."),

  password: z.string().min(1, "La contraseña es obligatoria."),
});
