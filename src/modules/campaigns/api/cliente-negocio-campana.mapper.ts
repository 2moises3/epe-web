import type { ClienteNegocioCampanaDto } from "@/modules/campaigns/api/cliente-negocio-campana.dto";
import { toClienteNegocio, type ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";

export interface ClienteNegocioCampana {
  clienteNegocioCampanaId: number;
  clienteNegocio?: ClienteNegocio;
  clienteNegocioId: number;
  campaniaId: number;
  documentoUrl: string;
  fechaRegistro: Date;
  fichaTecnicaUrl: string;
  cantidadKg: number;
  kilosAcordados: number;
  createdAt: string;
  updatedAt: string;
}

export function toClienteNegocioCampana(dto: ClienteNegocioCampanaDto): ClienteNegocioCampana {
  return {
    ...dto,
    fechaRegistro: parseFecha(dto.fechaRegistro),
    clienteNegocio: dto.clienteNegocio ? toClienteNegocio(dto.clienteNegocio) : undefined,
  };
}
