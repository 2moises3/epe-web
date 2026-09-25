import { apiClient } from "@/shared/api/client";
import type { ClienteNegocioDto } from "@/modules/clients/api/cliente-negocio.dto";
import { toClienteNegocio, type ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

export async function getClientesNegocio(): Promise<ClienteNegocio[]> {
  const { data } = await apiClient.get<ClienteNegocioDto[]>("/clientes-negocio");
  return data.map(toClienteNegocio);
}
