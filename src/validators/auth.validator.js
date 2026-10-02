import { z } from "zod";

export const esquemaLogin = z.object({
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresa un correo electrónico válido."),

  contrasena: z.string().min(1, "La contraseña es obligatoria."),
});

export const esquemaActualizarMiPerfil = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre debe contener al menos 2 caracteres.")
      .max(100)
      .optional(),

    correo: z
      .string()
      .trim()
      .toLowerCase()
      .email("Ingresa un correo electrónico válido.")
      .optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Debes enviar al menos un dato para actualizar.",
  });

export const esquemaCambiarContrasena = z
  .object({
    contrasenaActual: z.string().min(1, "La contraseña actual es obligatoria."),

    nuevaContrasena: z
      .string()
      .min(6, "La nueva contraseña debe contener al menos 6 caracteres.")
      .max(100),

    confirmarContrasena: z.string().min(1, "Confirma la nueva contraseña."),
  })
  .refine((datos) => datos.nuevaContrasena === datos.confirmarContrasena, {
    message: "Las nuevas contraseñas no coinciden.",

    path: ["confirmarContrasena"],
  })
  .refine((datos) => datos.contrasenaActual !== datos.nuevaContrasena, {
    message: "La nueva contraseña debe ser diferente a la actual.",

    path: ["nuevaContrasena"],
  });
