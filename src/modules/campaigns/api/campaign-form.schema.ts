import { z } from "zod";

export const campaignFormSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre de la campaña."),
  frutaId: z.number().int().positive("Selecciona una fruta."),
  fechaInicio: z.string().min(1, "Selecciona la fecha de inicio."),
  fechaFin: z.string().min(1, "Selecciona la fecha de fin."),
  estado: z.enum(["planificacion", "en proceso", "terminado"]),
  requerimientoComercial: z.string().trim().min(1, "Ingresa los requerimientos comerciales.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Ingresa una cantidad mayor que cero."),
}).refine((value) => new Date(value.fechaFin) >= new Date(value.fechaInicio), {
  path: ["fechaFin"], message: "La fecha de fin debe ser posterior o igual a la fecha de inicio.",
});

export const linkClientSchema = z.object({
  clienteNegocioId: z.number().int().positive("Selecciona un cliente."),
  cantidadKg: z.number().positive("Ingresa una cantidad mayor que cero."),
  documentoUrl: z.string().url("Ingresa una URL válida (https://...)."),
});

export const linkProviderSchema = z.object({
  proveedorId: z.number().int().positive("Selecciona un proveedor."),
  cantidad: z.string().trim().min(1, "Ingresa la cantidad estimada.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Ingresa una cantidad válida."),
});
