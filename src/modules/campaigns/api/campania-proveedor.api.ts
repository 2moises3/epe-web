import { apiClient } from "@/shared/api/client";
import type {
  CampaniaProveedorDto,
  CreateCampaniaProveedorDto,
  UpdateCampaniaProveedorDto,
} from "@/modules/campaigns/api/campania-proveedor.dto";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";

export async function getCampaniaProveedoresByCampania(campaniaId: number): Promise<CampaniaProveedor[]> {
  const { data } = await apiClient.get<CampaniaProveedorDto[]>(`/campanias-proveedores/campania/${campaniaId}`);
  return data;
}

export async function createCampaniaProveedor(input: CreateCampaniaProveedorDto): Promise<CampaniaProveedor> {
  const { data } = await apiClient.post<CampaniaProveedorDto>("/campanias-proveedores", input);
  return data;
}

export async function updateCampaniaProveedor(cxpId: number, input: UpdateCampaniaProveedorDto): Promise<CampaniaProveedor> {
  const { data } = await apiClient.patch<CampaniaProveedorDto>(`/campanias-proveedores/${cxpId}`, input);
  return data;
}

export async function deleteCampaniaProveedor(cxpId: number): Promise<void> {
  await apiClient.delete(`/campanias-proveedores/${cxpId}`);
}
