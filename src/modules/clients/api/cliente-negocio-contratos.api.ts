import { apiClient } from "@/shared/api/client";
import type { ContratosClienteNegocioResponseDto } from "@/modules/clients/api/cliente-negocio-contratos.dto";

export async function getClienteNegocioContratos(clienteNegocioId: number): Promise<ContratosClienteNegocioResponseDto> {
  const { data } = await apiClient.get<ContratosClienteNegocioResponseDto>(`/clientes-negocio/${clienteNegocioId}/contratos`);
  return data;
}
