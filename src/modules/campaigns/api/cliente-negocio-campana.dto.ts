import type { ClienteNegocioDto } from "@/modules/clients/api/cliente-negocio.dto";

export interface ClienteNegocioCampanaDto {
  clienteNegocioCampanaId: number;
  clienteNegocio?: ClienteNegocioDto;
  clienteNegocioId: number;
  campaniaId: number;
  documentoUrl: string;
  cantidadKg: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteNegocioCampanaDto {
  clienteNegocioId: number;
  documentoUrl: string;
  cantidadKg: number;
}
