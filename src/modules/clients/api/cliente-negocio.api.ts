import { apiClient } from "@/shared/api/client";
import type { ClienteNegocioDto, ClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.dto";
import { toClienteNegocio, type ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

export async function getClientesNegocio(): Promise<ClienteNegocio[]> {
  const { data } = await apiClient.get<ClienteNegocioDto[]>("/clientes-negocio");
  return data.map(toClienteNegocio);
}

export async function createClienteNegocio(input: ClienteNegocioInput): Promise<ClienteNegocio> {
  const { data } = await apiClient.post<ClienteNegocioDto>("/clientes-negocio", input);
  return toClienteNegocio(data);
}

export async function updateClienteNegocio(id: number, input: Partial<ClienteNegocioInput>): Promise<ClienteNegocio> {
  const { data } = await apiClient.patch<ClienteNegocioDto>(`/clientes-negocio/${id}`, input);
  return toClienteNegocio(data);
}

export async function deleteClienteNegocio(id: number): Promise<void> {
  await apiClient.delete(`/clientes-negocio/${id}`);
}
