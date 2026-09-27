import type { ProveedorDto, ProveedorFormValues, ProveedorInput } from "@/modules/providers/api/proveedor.dto";

export type ProveedorField = keyof ProveedorFormValues;
export type ProveedorFieldErrors = Partial<Record<ProveedorField, string>>;

export function toProveedorInput(provider: ProveedorDto): ProveedorFormValues {
  return {
    nombres: provider.nombres,
    apellido: provider.apellido,
    tipoDocumento: provider.tipoDocumento as ProveedorFormValues["tipoDocumento"],
    nmrDocumento: String(provider.nmrDocumento),
    identidadDocUrl: provider.identidadDocUrl,
    zona: provider.zona,
    telefono: String(provider.telefono),
    email: provider.email,
    codigoLugarProduccion: String(provider.codigoLugarProduccion),
  };
}

export function toProveedorPayload(values: ProveedorFormValues): ProveedorInput {
  return {
    nombres: values.nombres.trim(),
    apellido: values.apellido.trim(),
    tipoDocumento: values.tipoDocumento as ProveedorInput["tipoDocumento"],
    nmrDocumento: Number(values.nmrDocumento.trim()),
    identidadDocUrl: values.identidadDocUrl.trim(),
    zona: values.zona.trim(),
    telefono: Number(values.telefono.trim()),
    email: values.email.trim(),
    codigoLugarProduccion: Number(values.codigoLugarProduccion.trim()),
  };
}

export function validateProveedorInput(values: ProveedorFormValues): ProveedorFieldErrors {
  const errors: ProveedorFieldErrors = {};
  const required: ProveedorField[] = [
    "nombres", "apellido", "tipoDocumento", "nmrDocumento", "identidadDocUrl", "zona", "telefono", "email", "codigoLugarProduccion",
  ];
  for (const field of required) {
    if (!String(values[field] ?? "").trim()) errors[field] = "Este campo es obligatorio.";
  }

  if (!errors.nombres && values.nombres.trim().length > 150) errors.nombres = "Usa hasta 150 caracteres.";
  if (!errors.apellido && values.apellido.trim().length > 150) errors.apellido = "Usa hasta 150 caracteres.";
  if (!errors.tipoDocumento && !["DNI", "Pasaporte", "Carnet de extranjeria"].includes(values.tipoDocumento)) {
    errors.tipoDocumento = "Selecciona un tipo de documento válido.";
  }
  for (const field of ["nmrDocumento", "telefono", "codigoLugarProduccion"] as const) {
    const value = Number(values[field].trim());
    if (!errors[field] && (!/^[1-9]\d*$/.test(values[field].trim()) || !Number.isSafeInteger(value) || value > 2147483647)) {
      errors[field] = "Ingresa un número entero válido mayor que cero.";
    }
  }
  if (!errors.identidadDocUrl) {
    try {
      const url = new URL(values.identidadDocUrl.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported URL protocol");
    } catch {
      errors.identidadDocUrl = "Ingresa una URL válida que comience con http:// o https://.";
    }
  }
  if (!errors.zona && !values.zona.trim()) errors.zona = "Este campo es obligatorio.";
  if (!errors.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.trim().length > 320)) {
    errors.email = "Ingresa un correo electrónico válido de hasta 320 caracteres.";
  }
  return errors;
}
