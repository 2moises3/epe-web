import type { ClienteNegocioDto } from "@/modules/clients/api/cliente-negocio.dto";

export interface ClienteNegocioCampanaDto {
  clienteNegocioCampanaId: number;
  clienteNegocio?: ClienteNegocioDto;
  clienteNegocioId: number;
  campaniaId: number;
  documentoUrl: string;
  fechaRegistro: string;
  fichaTecnicaUrl: string;
  cantidadKg: number;
  kilosAcordados: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteNegocioCampanaDto {
  clienteNegocioId: number;
  documentoUrl: string;
  fechaRegistro: string;
  fichaTecnicaUrl: string;
  cantidadKg: number;
  kilosAcordados: number;
}

export interface UpdateClienteNegocioCampanaDto {
  documentoUrl?: string;
  fechaRegistro?: string;
  fichaTecnicaUrl?: string;
  cantidadKg?: number;
  kilosAcordados?: number;
}
