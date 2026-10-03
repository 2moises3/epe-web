export interface FrutaDto {
    frutaId: number;
    name: string;
}

export interface ProveedorFrutaDto {
    pxfId: number;
    proveedorId: number;
    frutaId: number;
    fruta: FrutaDto;
}

export type ResultadoExamenProveedor = "positivo" | "negativo";

export interface ExamenProveedorDto {
    examenProveedorId: number;
    proveedorId: number;
    fecha: string;
    tipoExamen: string;
    resultado: ResultadoExamenProveedor;
    origen: string;
    observacion: string;
    documentoUrl: string;
}

export interface ExamenProveedorInput {
    fecha: string;
    tipoExamen: string;
    resultado: ResultadoExamenProveedor;
    origen: string;
    observacion: string;
    documentoUrl: string;
}

export interface CertificadoProveedorDto {
    certificadoProveedorId: number;
    proveedorId: number;
    fechaRevisionSenasa: string;
    nombre: string;
    documentoUrl: string;
}

export interface CertificadoProveedorInput {
    fechaRevisionSenasa: string;
    nombre: string;
    documentoUrl: string;
}

export type ExamenProveedorValues = Omit<ExamenProveedorInput, "resultado"> & { resultado: string };
export type CertificadoProveedorValues = CertificadoProveedorInput;
