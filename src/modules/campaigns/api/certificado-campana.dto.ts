export type EstadoCertificadoCampana = "vigente" | "por vencer" | "vencida";

export interface CertificadoCampanaDto {
  certificadoId: number;
  nombre: string;
  documentUrl: string;
  fechaVencimiento: string;
  campaniaId: number;
  estado: EstadoCertificadoCampana;
}

export interface CreateCertificadoCampanaDto {
  nombre: string;
  documentUrl: string;
  fechaVencimiento: string;
  estado: EstadoCertificadoCampana;
}

export type UpdateCertificadoCampanaDto = Partial<CreateCertificadoCampanaDto>;
