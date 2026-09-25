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
  cantidadProveedor: string;
  mtdCeratitis: string;
  frutaConvencionalEstimado?: number | null;
  tipoProveedor: TipoProveedorCampania;
}

export type UpdateCampaniaProveedorDto = Partial<
  Omit<CreateCampaniaProveedorDto, "campaniaId" | "proveedorId">
>;
