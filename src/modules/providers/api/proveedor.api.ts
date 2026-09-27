import { apiClient } from "@/shared/api/client";
import type { ProveedorDto } from "@/modules/providers/api/proveedor.dto";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";

export async function getProveedores(): Promise<Proveedor[]> {
  const { data } = await apiClient.get<ProveedorDto[]>("/proveedores");
  if (!Array.isArray(data)) {
    throw new Error("Invalid response format: expected an array");
  }
  return data;
}

