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
    documentoArchivoId: number;
}

export interface CertificadoProveedorInput {
    fechaRevisionSenasa: string;
    nombre: string;
    documentoArchivoId: number;
}

export interface CertificadoProveedorMetadataInput {
    fechaRevisionSenasa: string;
    nombre: string;
}

export interface CertificadoDocumentoUploadResponse {
    archivoId: number;
    estado: "PENDIENTE";
    uploadUrl: string;
    method: string;
    headers: Record<string, string>;
    expiresInSeconds: number;
}

export interface CertificadoDocumentoConfirmationResponse {
    archivoId: number;
    estado: "DISPONIBLE" | "PENDIENTE" | "RECHAZADO";
}

export interface CertificadoDocumentoDownloadResponse {
    archivoId: number;
    downloadUrl: string;
    expiresInSeconds: number;
}

export type ExamenProveedorValues = Omit<ExamenProveedorInput, "resultado"> & { resultado: string };
export type CertificadoProveedorValues = CertificadoProveedorMetadataInput;
