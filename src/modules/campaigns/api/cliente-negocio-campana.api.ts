import { apiClient } from "@/shared/api/client";
import type {
  ClienteNegocioCampanaDto,
  CreateClienteNegocioCampanaDto,
} from "@/modules/campaigns/api/cliente-negocio-campana.dto";
import { toClienteNegocioCampana, type ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";

export async function getClientesNegocioCampana(campaniaId: number): Promise<ClienteNegocioCampana[]> {
  const { data } = await apiClient.get<ClienteNegocioCampanaDto[]>(`/campanas/${campaniaId}/clientes-negocio`);
  return data.map(toClienteNegocioCampana);
}

export async function createClienteNegocioCampana(
  campaniaId: number,
  input: CreateClienteNegocioCampanaDto,
): Promise<ClienteNegocioCampana> {
  const { data } = await apiClient.post<ClienteNegocioCampanaDto>(`/campanas/${campaniaId}/clientes-negocio`, input);
  return toClienteNegocioCampana(data);
}

export async function deleteClienteNegocioCampana(campaniaId: number, clienteNegocioCampanaId: number): Promise<void> {
  await apiClient.delete(`/campanas/${campaniaId}/clientes-negocio/${clienteNegocioCampanaId}`);
}
