export type TipoCliente = "exportador" | "industria";

export interface ClienteNegocioDto {
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
