export interface ProveedorDto {
  proveedorId: number;
  nombres: string;
  apellido: string;
  tipoDocumento: string;
  nmrDocumento: number;
  identidadDocUrl: string;
  zona: string;
  telefono: number;
  email: string;
  codigoLugarProduccion: number;
}

export type TipoDocumentoProveedor = "DNI" | "Pasaporte" | "Carnet de extranjeria";

export interface ProveedorInput {
  nombres: string;
  apellido: string;
  tipoDocumento: TipoDocumentoProveedor;
  nmrDocumento: number;
  identidadDocUrl: string;
  zona: string;
  telefono: number;
  email: string;
  codigoLugarProduccion: number;
}

export type ProveedorFormValues = Omit<ProveedorInput, "tipoDocumento" | "nmrDocumento" | "telefono" | "codigoLugarProduccion"> & {
  tipoDocumento: TipoDocumentoProveedor | "";
  nmrDocumento: string;
  telefono: string;
  codigoLugarProduccion: string;
};
