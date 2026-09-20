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

export interface ContratoClienteNegocioDto {
  clienteNegocioCampanaId: number;
  documentoUrl: string;
  fichaTecnicaUrl: string;
  kilosAcordados: number;
  campaniaId: number;
  nombreCampania: string;
  fechaRegistro: string;
}

export interface ContratosClienteNegocioDto {
  clienteNegocio: ClienteNegocioDto;
  contratos: ContratoClienteNegocioDto[];
}
