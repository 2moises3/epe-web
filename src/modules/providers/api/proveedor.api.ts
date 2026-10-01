import { apiClient } from "@/shared/api/client";
import type { ProveedorDto, ProveedorInput } from "@/modules/providers/api/proveedor.dto";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";

export async function getProveedores(): Promise<Proveedor[]> {
  const { data } = await apiClient.get<ProveedorDto[]>("/proveedores");
  if (!Array.isArray(data)) {
    throw new Error("Invalid response format: expected an array");
  }
  return data;
}

export async function getProveedor(proveedorId: number): Promise<Proveedor> {
  const { data } = await apiClient.get<ProveedorDto>(`/proveedores/${proveedorId}`);
  return data;
}

export async function createProveedor(input: ProveedorInput): Promise<Proveedor> {
  const { data } = await apiClient.post<ProveedorDto>("/proveedores", input);
  return data;
}

export async function updateProveedor(proveedorId: number, input: ProveedorInput): Promise<Proveedor> {
  const { data } = await apiClient.patch<ProveedorDto>(`/proveedores/${proveedorId}`, input);
  return data;
}

export async function deleteProveedor(proveedorId: number): Promise<void> {
  await apiClient.delete(`/proveedores/${proveedorId}`);
}
