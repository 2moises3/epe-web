import type {
  CreateCampaniaProveedorDto,
  TipoProveedorCampania,
} from "@/modules/campaigns/api/campania-proveedor.dto";

export interface CampaniaProveedorDraft {
  proveedorId: number;
  tipoProveedor: TipoProveedorCampania;
  cantidadProveedor: string;
  mtdCeratitis: string;
}

export type CampaniaProveedorDraftErrors = Partial<
  Record<keyof CampaniaProveedorDraft, string>
>;

function parseNonNegative(value: string, decimalPlaces: number): number | null {
  const trimmed = value.trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const fraction = trimmed.split(".")[1] ?? "";
  if (fraction.length > decimalPlaces) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
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
  } else if (mtd > 0.05) {
    errors.mtdCeratitis = "El MTD Ceratitis no puede superar el valor de 0.05.";
  }

  return errors;
}

export function toCreateCampaniaProveedorInput(
  campaniaId: number,
  draft: CampaniaProveedorDraft,
): CreateCampaniaProveedorDto {
  const payload: CreateCampaniaProveedorDto = {
    campaniaId,
    proveedorId: draft.proveedorId,
    tipoProveedor: draft.tipoProveedor,
    cantidadProveedor: Number(draft.cantidadProveedor),
    mtdCeratitis: Number(draft.mtdCeratitis),
  };

  // TODO(api): El diseño actual eliminó estos campos del modal porque vienen de gestión.
  // Sin embargo, el backend los sigue requiriendo para tipo "productor". 
  // Inyectamos datos por defecto para permitir la prueba en local hasta que se actualice el endpoint.
  if (draft.tipoProveedor === "productor") {
    Object.assign(payload, {
      departamento: "-",
      provincia: "-",
      distrito: "-",
      latitud: 0,
      longitud: 0,
      densidadPlantacion: 0,
      distanciamiento: 0,
      frecuenciaRiego: 0,
      haTotalFinca: 0,
      haCultivo: 0,
      nombreAplicacion: "-",
      aplicacionesAlAno: 0,
    });
  }

  return payload;
}

export function toUpdateCampaniaProveedorInput(
  draft: CampaniaProveedorDraft,
): import("@/modules/campaigns/api/campania-proveedor.dto").UpdateCampaniaProveedorDto {
  return {
    tipoProveedor: draft.tipoProveedor,
    cantidadProveedor: Number(draft.cantidadProveedor),
    mtdCeratitis: Number(draft.mtdCeratitis),
  };
}
