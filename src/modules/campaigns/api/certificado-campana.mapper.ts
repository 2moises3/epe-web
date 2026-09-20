import type {
  CertificadoCampanaDto,
  CreateCertificadoCampanaDto,
  EstadoCertificadoCampana,
} from "@/modules/campaigns/api/certificado-campana.dto";
import { parseFecha, formatFecha } from "@/modules/campaigns/api/fecha.util";

export interface CertificadoCampana {
  certificadoId: number;
  nombre: string;
  documentoUrl: string;
  fechaVencimiento: Date;
  campaniaId: number;
  estado: EstadoCertificadoCampana;
}

export interface CertificadoCampanaFormInput {
  nombre: string;
  documentoUrl: string;
  fechaVencimiento: Date;
  estado: EstadoCertificadoCampana;
}

export function toCertificadoCampana(dto: CertificadoCampanaDto): CertificadoCampana {
  const { documentUrl, fechaVencimiento, ...rest } = dto;
  return {
    ...rest,
    documentoUrl: documentUrl,
    fechaVencimiento: parseFecha(fechaVencimiento),
  };
}

export function toCreateCertificadoCampanaDto(
  input: CertificadoCampanaFormInput,
): CreateCertificadoCampanaDto {
  const { documentoUrl, fechaVencimiento, ...rest } = input;
  return {
    ...rest,
    documentUrl: documentoUrl,
    fechaVencimiento: formatFecha(fechaVencimiento),
  };
}
