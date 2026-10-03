import type { ProveedorDto } from "@/modules/providers/api/proveedor.dto";

export type TipoProveedorCampania = "acopio" | "productor";

export interface CampaniaProveedorDto {
  cxpId: number;
  campaniaId: number;
  proveedor?: ProveedorDto;
  proveedorId: number;
  cantidadProveedor: number;
  mtdCeratitis: number;
  frutaConvencionalEstimado: number | null;
  tipoProveedor: TipoProveedorCampania;
}

export interface CreateCampaniaProveedorDto {
  campaniaId: number;
  proveedorId: number;
  cantidadProveedor: number;
  mtdCeratitis: number;
  frutaConvencionalEstimado?: number | null;
  tipoProveedor: TipoProveedorCampania;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  latitud?: number;
  longitud?: number;
  densidadPlantacion?: number;
  distanciamiento?: number;
  frecuenciaRiego?: number;
  haTotalFinca?: number;
  haCultivo?: number;
  nombreAplicacion?: string;
  aplicacionesAlAno?: number;
}

export type UpdateCampaniaProveedorDto = Partial<
  Omit<CreateCampaniaProveedorDto, "campaniaId" | "proveedorId">
>;
