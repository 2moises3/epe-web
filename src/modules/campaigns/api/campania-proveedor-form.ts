import type {
  CreateCampaniaProveedorDto,
  TipoProveedorCampania,
} from "@/modules/campaigns/api/campania-proveedor.dto";

export interface CampaniaProveedorDraft {
  proveedorId: number;
  tipoProveedor: TipoProveedorCampania;
  cantidadProveedor: string;
  mtdCeratitis: string;
  departamento: string;
  provincia: string;
  distrito: string;
  latitud: string;
  longitud: string;
  densidadPlantacion: string;
  distanciamiento: string;
  frecuenciaRiego: string;
  haTotalFinca: string;
  haCultivo: string;
  nombreAplicacion: string;
  aplicacionesAlAno: string;
}

export type CampaniaProveedorDraftErrors = Partial<
  Record<keyof CampaniaProveedorDraft, string>
>;

const fincaTextFields = [
  ["departamento", "El departamento es obligatorio.", 100],
  ["provincia", "La provincia es obligatoria.", 100],
  ["distrito", "El distrito es obligatorio.", 100],
  ["nombreAplicacion", "El nombre de aplicación es obligatorio.", 255],
] as const;

const fincaDecimalFields = [
  ["densidadPlantacion", "La densidad debe ser un número no negativo con hasta 3 decimales.", 3],
  ["distanciamiento", "El distanciamiento debe ser un número no negativo con hasta 3 decimales.", 3],
] as const;

const fincaIntegerFields = [
  ["frecuenciaRiego", "La frecuencia de riego debe ser un entero no negativo."],
  ["haTotalFinca", "Las hectáreas totales deben ser un entero no negativo."],
  ["haCultivo", "Las hectáreas de cultivo deben ser un entero no negativo."],
  ["aplicacionesAlAno", "Las aplicaciones al año deben ser un entero no negativo."],
] as const;

function parseNonNegative(value: string, decimalPlaces: number): number | null {
  const trimmed = value.trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const fraction = trimmed.split(".")[1] ?? "";
  if (fraction.length > decimalPlaces) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCoordinate(value: string, maximum: number, minimum: number): number | null {
  const trimmed = value.trim();
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const fraction = trimmed.split(".")[1] ?? "";
  if (fraction.length > 7) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

export function getCampaniaProveedorDraftErrors(
  draft: CampaniaProveedorDraft,
): CampaniaProveedorDraftErrors {
  const errors: CampaniaProveedorDraftErrors = {};
  const quantity = parseNonNegative(draft.cantidadProveedor, 3);
  const mtd = parseNonNegative(draft.mtdCeratitis, 3);

  if (quantity === null) {
    errors.cantidadProveedor = "La cantidad debe ser un número no negativo con hasta 3 decimales.";
  }
  if (mtd === null) {
    errors.mtdCeratitis = "El MTD debe ser un número no negativo con hasta 3 decimales.";
  }

  if (draft.tipoProveedor === "acopio") return errors;

  for (const [field, message, maxLength] of fincaTextFields) {
    const value = draft[field].trim();
    if (!value) errors[field] = message;
    else if (value.length > maxLength) {
      errors[field] = `El valor no debe superar los ${maxLength} caracteres.`;
    }
  }

  const latitude = parseCoordinate(draft.latitud, 90, -90);
  if (latitude === null) {
    errors.latitud = "La latitud debe estar entre -90 y 90 y tener hasta 7 decimales.";
  }
  const longitude = parseCoordinate(draft.longitud, 180, -180);
  if (longitude === null) {
    errors.longitud = "La longitud debe estar entre -180 y 180 y tener hasta 7 decimales.";
  }

  for (const [field, message, decimalPlaces] of fincaDecimalFields) {
    if (parseNonNegative(draft[field], decimalPlaces) === null) {
      errors[field] = message;
    }
  }
  for (const [field, message] of fincaIntegerFields) {
    const value = draft[field].trim();
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
      errors[field] = message;
    }
  }

  return errors;
}

export function toCreateCampaniaProveedorInput(
  campaniaId: number,
  draft: CampaniaProveedorDraft,
): CreateCampaniaProveedorDto {
  const base = {
    campaniaId,
    proveedorId: draft.proveedorId,
    tipoProveedor: draft.tipoProveedor,
    cantidadProveedor: Number(draft.cantidadProveedor),
    mtdCeratitis: Number(draft.mtdCeratitis),
  };

  if (draft.tipoProveedor === "acopio") return base;

  return {
    ...base,
    departamento: draft.departamento.trim(),
    provincia: draft.provincia.trim(),
    distrito: draft.distrito.trim(),
    latitud: Number(draft.latitud),
    longitud: Number(draft.longitud),
    densidadPlantacion: Number(draft.densidadPlantacion),
    distanciamiento: Number(draft.distanciamiento),
    frecuenciaRiego: Number(draft.frecuenciaRiego),
    haTotalFinca: Number(draft.haTotalFinca),
    haCultivo: Number(draft.haCultivo),
    nombreAplicacion: draft.nombreAplicacion.trim(),
    aplicacionesAlAno: Number(draft.aplicacionesAlAno),
  };
}
