import type { ClienteNegocioCampanaDto } from "@/modules/campaigns/api/cliente-negocio-campana.dto";
import { toClienteNegocio, type ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

export interface ClienteNegocioCampana {
  clienteNegocioCampanaId: number;
  clienteNegocio?: ClienteNegocio;
  clienteNegocioId: number;
  campaniaId: number;
  documentoUrl: string;
  cantidadKg: number;
  createdAt: string;
  updatedAt: string;
}

export function toClienteNegocioCampana(dto: ClienteNegocioCampanaDto): ClienteNegocioCampana {
  return {
    ...dto,
    clienteNegocio: dto.clienteNegocio ? toClienteNegocio(dto.clienteNegocio) : undefined,
  };
}
