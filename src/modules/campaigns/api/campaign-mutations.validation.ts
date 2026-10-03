import { isURL } from "validator";
import type { CreateClienteNegocioCampanaDto, UpdateClienteNegocioCampanaDto } from "@/modules/campaigns/api/cliente-negocio-campana.dto";
import type {
  CreateCertificadoCampanaDto,
  EstadoCertificadoCampana,
  UpdateCertificadoCampanaDto,
} from "@/modules/campaigns/api/certificado-campana.dto";

export interface CampaignClientUpdateValues {
  documentoUrl: string;
  fechaRegistro: string;
  fichaTecnicaUrl: string;
  cantidadKg: string;
  kilosAcordados: string;
}

export type CampaignClientFieldErrors = Partial<Record<keyof CampaignClientUpdateValues, string>>;

export interface CampaignCertificateValues {
  nombre: string;
  documentoUrl: string;
  reciboUrl: string;
  costo: string;
  fechaVencimiento: string;
  estado: string;
}

export type CampaignCertificateFieldErrors = Partial<Record<keyof CampaignCertificateValues, string>>;

export function createCampaignMutationGuard() {
  let inFlight = false;
  return {
    get isInFlight() { return inFlight; },
    acquire() {
      if (inFlight) return false;
      inFlight = true;
      return true;
    },
    release() { inFlight = false; },
  };
}

function validCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validUrl(value: string): boolean {
  return isURL(value.trim(), { require_protocol: true });
}

function parseNonNegative(value: string, maxDecimals: number): number | null {
  const trimmed = value.trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  if ((trimmed.split(".")[1] ?? "").length > maxDecimals) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

const clientUpdateFields = [
  "documentoUrl",
  "fechaRegistro",
  "fichaTecnicaUrl",
  "cantidadKg",
  "kilosAcordados",
] as const;

export function validateCampaignClientUpdate(
  values: CampaignClientUpdateValues,
  original?: CampaignClientUpdateValues,
): CampaignClientFieldErrors {
  const errors: CampaignClientFieldErrors = {};
  for (const field of clientUpdateFields) {
    if (original?.[field].trim() && !values[field].trim()) {
      errors[field] = "No se puede vaciar un campo que ya tenía valor.";
    }
  }
  if (!errors.documentoUrl && values.documentoUrl.trim() && !validUrl(values.documentoUrl)) errors.documentoUrl = "Ingresa una URL válida con http:// o https://.";
  if (!errors.fechaRegistro && values.fechaRegistro.trim() && !validCalendarDate(values.fechaRegistro)) errors.fechaRegistro = "Ingresa una fecha válida.";
  if (!errors.fichaTecnicaUrl && values.fichaTecnicaUrl.trim() && !validUrl(values.fichaTecnicaUrl)) errors.fichaTecnicaUrl = "Ingresa una URL válida con http:// o https://.";
  if (!errors.cantidadKg && values.cantidadKg.trim() && parseNonNegative(values.cantidadKg, 3) === null) errors.cantidadKg = "Ingresa un número no negativo con hasta 3 decimales.";
  if (!errors.kilosAcordados && values.kilosAcordados.trim() && parseNonNegative(values.kilosAcordados, 3) === null) errors.kilosAcordados = "Ingresa un número no negativo con hasta 3 decimales.";
  return errors;
}

export function toCampaignClientUpdatePayload(values: CampaignClientUpdateValues): UpdateClienteNegocioCampanaDto {
  const payload: UpdateClienteNegocioCampanaDto = {};
  if (values.documentoUrl.trim()) payload.documentoUrl = values.documentoUrl.trim();
  if (values.fechaRegistro.trim()) payload.fechaRegistro = values.fechaRegistro;
  if (values.fichaTecnicaUrl.trim()) payload.fichaTecnicaUrl = values.fichaTecnicaUrl.trim();
  if (values.cantidadKg.trim()) payload.cantidadKg = Number(values.cantidadKg.trim());
  if (values.kilosAcordados.trim()) payload.kilosAcordados = Number(values.kilosAcordados.trim());
  return payload;
}

export interface CampaignClientCreateValues extends CampaignClientUpdateValues {
  clienteNegocioId: string;
}

export type CampaignClientCreateErrors = Partial<Record<keyof CampaignClientCreateValues, string>>;

/** El alta del vínculo exige todos los campos del DTO de creación del backend. */
export function validateCampaignClientCreate(values: CampaignClientCreateValues): CampaignClientCreateErrors {
  const errors: CampaignClientCreateErrors = {};
  if (!/^\d+$/.test(values.clienteNegocioId.trim()) || Number(values.clienteNegocioId) <= 0) errors.clienteNegocioId = "Selecciona un cliente.";
  if (!validUrl(values.documentoUrl)) errors.documentoUrl = "Ingresa una URL válida con http:// o https://.";
  if (!validCalendarDate(values.fechaRegistro)) errors.fechaRegistro = "Ingresa una fecha válida.";
  if (!validUrl(values.fichaTecnicaUrl)) errors.fichaTecnicaUrl = "Ingresa una URL válida con http:// o https://.";
  if (parseNonNegative(values.cantidadKg, 3) === null) errors.cantidadKg = "Ingresa un número no negativo con hasta 3 decimales.";
  if (parseNonNegative(values.kilosAcordados, 3) === null) errors.kilosAcordados = "Ingresa un número no negativo con hasta 3 decimales.";
  return errors;
}

export function toCampaignClientCreatePayload(values: CampaignClientCreateValues): CreateClienteNegocioCampanaDto {
  return {
    clienteNegocioId: Number(values.clienteNegocioId),
    documentoUrl: values.documentoUrl.trim(),
    fechaRegistro: values.fechaRegistro,
    fichaTecnicaUrl: values.fichaTecnicaUrl.trim(),
    cantidadKg: Number(values.cantidadKg.trim()),
    kilosAcordados: Number(values.kilosAcordados.trim()),
  };
}

export function hasCampaignClientChanges(
  values: CampaignClientUpdateValues,
  original: CampaignClientUpdateValues,
): boolean {
  return JSON.stringify(toCampaignClientUpdatePayload(values)) !== JSON.stringify(toCampaignClientUpdatePayload(original));
}

export function validateCampaignCertificate(
  values: CampaignCertificateValues,
  partial = false,
  original?: CampaignCertificateValues,
): CampaignCertificateFieldErrors {
  const errors: CampaignCertificateFieldErrors = {};
  const name = values.nombre.trim();
  const fields = ["nombre", "documentoUrl", "reciboUrl", "costo", "fechaVencimiento", "estado"] as const;
  for (const field of fields) {
    if (original?.[field].trim() && !values[field].trim()) {
      errors[field] = "No se puede vaciar un campo que ya tenía valor.";
    }
  }
  if (!errors.nombre && !name && !partial) errors.nombre = "Este campo es obligatorio.";
  else if (!errors.nombre && name.length > 255) errors.nombre = "Usa hasta 255 caracteres.";
  if (!errors.documentoUrl && (!partial || values.documentoUrl.trim()) && !validUrl(values.documentoUrl)) errors.documentoUrl = "Ingresa una URL válida con http:// o https://.";
  if (!errors.reciboUrl && (!partial || values.reciboUrl.trim()) && !validUrl(values.reciboUrl)) errors.reciboUrl = "Ingresa una URL válida con http:// o https://.";
  if (!errors.costo && (!partial || values.costo.trim()) && parseNonNegative(values.costo, 2) === null) errors.costo = "Ingresa un monto no negativo con hasta 2 decimales.";
  if (!errors.fechaVencimiento && (!partial || values.fechaVencimiento.trim()) && !validCalendarDate(values.fechaVencimiento)) errors.fechaVencimiento = "Ingresa una fecha válida.";
  if (!errors.estado && (!partial || values.estado) && !( ["vigente", "por vencer", "vencida"] as string[]).includes(values.estado)) {
    errors.estado = "Selecciona un estado válido.";
  }
  return errors;
}

export function toCampaignCertificatePayload(values: CampaignCertificateValues): CreateCertificadoCampanaDto {
  return {
    nombre: values.nombre.trim(),
    documentUrl: values.documentoUrl.trim(),
    reciboUrl: values.reciboUrl.trim(),
    costo: Number(values.costo.trim()),
    fechaVencimiento: values.fechaVencimiento,
    estado: values.estado as EstadoCertificadoCampana,
  };
}

export function toCampaignCertificateUpdatePayload(values: CampaignCertificateValues): UpdateCertificadoCampanaDto {
  const payload: UpdateCertificadoCampanaDto = {};
  const name = values.nombre.trim();
  if (name) payload.nombre = name;
  const documentUrl = values.documentoUrl.trim();
  if (documentUrl) payload.documentUrl = documentUrl;
  const receiptUrl = values.reciboUrl.trim();
  if (receiptUrl) payload.reciboUrl = receiptUrl;
  if (values.costo.trim()) payload.costo = Number(values.costo.trim());
  if (values.fechaVencimiento.trim()) payload.fechaVencimiento = values.fechaVencimiento;
  if (values.estado) payload.estado = values.estado as EstadoCertificadoCampana;
  return payload;
}

export function hasCampaignCertificateChanges(
  values: CampaignCertificateValues,
  original: CampaignCertificateValues,
): boolean {
  return JSON.stringify(toCampaignCertificateUpdatePayload(values)) !== JSON.stringify(toCampaignCertificateUpdatePayload(original));
}
