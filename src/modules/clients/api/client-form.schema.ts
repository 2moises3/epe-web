import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre del contacto."),
  empresa: z.string().trim().min(1, "Ingresa el nombre de la empresa."),
  telefono: z.string().trim().min(1, "Ingresa el teléfono."),
  ruc: z.string().trim().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos."),
  email: z.string().trim().email("Ingresa un correo válido."),
  ubicacion: z.string().trim().min(1, "Ingresa la ubicación."),
  tipo: z.enum(["exportador", "industria"], { error: "Selecciona el tipo de cliente." }),
});
