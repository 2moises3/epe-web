import { apiClient } from "@/shared/api/client";
import type { CertificadoCampanaDto } from "@/modules/campaigns/api/certificado-campana.dto";
import { toCertificadoCampana, type CertificadoCampana } from "@/modules/campaigns/api/certificado-campana.mapper";

export async function getCertificadosCampana(campaniaId: number): Promise<CertificadoCampana[]> {
  const { data } = await apiClient.get<CertificadoCampanaDto[]>(`/campanas/${campaniaId}/certificados`);
  return data.map(toCertificadoCampana);
}

export async function deleteCertificadoCampana(campaniaId: number, certificadoId: number): Promise<void> {
  await apiClient.delete(`/campanas/${campaniaId}/certificados/${certificadoId}`);
}
