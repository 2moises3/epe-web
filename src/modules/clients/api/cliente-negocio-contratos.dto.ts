import type { TipoCliente } from "@/modules/clients/api/cliente-negocio.dto";

export interface ClienteContratoResumenDto {
  clienteNegocioId: number;
  nombreEmpresa: string;
  nombreContacto: string;
  telefono: string;
  ruc: string;
  correoCorporativo: string;
  ubicacion: string;
  tipoCliente: TipoCliente;
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

export interface ContratosClienteNegocioResponseDto {
  clienteNegocio: ClienteContratoResumenDto;
  contratos: ContratoClienteNegocioDto[];
}
