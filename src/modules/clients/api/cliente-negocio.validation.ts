import type { ClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.dto";

export type ClienteNegocioFieldErrors = Partial<Record<keyof ClienteNegocioInput, string>>;

export function toClienteNegocioInput(values: ClienteNegocioInput): ClienteNegocioInput {
  return {
    nombreEmpresa: values.nombreEmpresa.trim(),
    nombreContacto: values.nombreContacto.trim(),
    telefono: values.telefono.trim(),
    ruc: values.ruc.trim(),
    correoCorporativo: values.correoCorporativo.trim(),
    ubicacion: values.ubicacion.trim(),
    tipoCliente: values.tipoCliente.trim() as ClienteNegocioInput["tipoCliente"],
  };
}

export function validateClienteNegocioInput(input: ClienteNegocioInput): ClienteNegocioFieldErrors {
  const errors: ClienteNegocioFieldErrors = {};
  const required: Array<keyof ClienteNegocioInput> = [
    "nombreEmpresa",
    "nombreContacto",
    "telefono",
    "ruc",
    "correoCorporativo",
    "ubicacion",
    "tipoCliente",
  ];

  for (const field of required) {
    if (!String(input[field] ?? "").trim()) errors[field] = "Este campo es obligatorio.";
  }

  if (!errors.telefono && !/^\+?\d{7,15}$/.test(input.telefono.trim())) {
    errors.telefono = "Ingresa un teléfono de 7 a 15 dígitos; puede iniciar con +.";
  }
  if (!errors.ruc && !/^\d{11}$/.test(input.ruc.trim())) {
    errors.ruc = "El RUC debe tener exactamente 11 dígitos.";
  }
  if (!errors.correoCorporativo && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.correoCorporativo.trim()) || input.correoCorporativo.length > 320)) {
    errors.correoCorporativo = "Ingresa un correo electrónico válido.";
  }
  if (!["exportador", "industria"].includes(input.tipoCliente)) {
    errors.tipoCliente = "Selecciona un tipo de cliente válido.";
  }
  if (!errors.nombreEmpresa && input.nombreEmpresa.length > 255) errors.nombreEmpresa = "Usa hasta 255 caracteres.";
  if (!errors.nombreContacto && input.nombreContacto.length > 255) errors.nombreContacto = "Usa hasta 255 caracteres.";

  return errors;
}
