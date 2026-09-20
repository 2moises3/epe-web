import type { ClienteNegocioDto, TipoCliente } from "@/modules/clients/api/cliente-negocio.dto";

export interface ClienteNegocio {
  clienteNegocioId: number;
  nombreEmpresa: string;
  nombreContacto: string;
  telefono: string;
  ruc: string;
  correoCorporativo: string;
  ubicacion: string;
  tipoCliente: TipoCliente;
  createdAt: string;
  updatedAt: string;
}

export function toClienteNegocio(dto: ClienteNegocioDto): ClienteNegocio {
  return { ...dto };
}
