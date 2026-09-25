import { apiClient } from "@/shared/api/client";
import type { CampanaDto, FrutaDto, FrutaDerivadaDto, UpdateCampanaDto } from "@/modules/campaigns/api/campaign.dto";
import { toCampana, toCreateCampanaDto, type Campana, type CampaignFormInput } from "@/modules/campaigns/api/campaign.mapper";
import { formatFecha } from "@/modules/campaigns/api/fecha.util";

export async function getFrutas(): Promise<FrutaDto[]> {
  const { data } = await apiClient.get<FrutaDto[]>("/frutas");
  return data;
}

export async function getFrutaDerivadas(frutaId: number): Promise<FrutaDerivadaDto[]> {
  const { data } = await apiClient.get<FrutaDerivadaDto[]>(`/frutas/${frutaId}/derivadas`);
  return data;
}

export async function getCampanas(): Promise<Campana[]> {
  const { data } = await apiClient.get<CampanaDto[]>("/campanas");
  return data.map(toCampana);
}

export async function getCampana(id: number): Promise<Campana> {
  const { data } = await apiClient.get<CampanaDto>(`/campanas/${id}`);
  return toCampana(data);
}

export async function createCampana(input: CampaignFormInput): Promise<Campana> {
  const { data } = await apiClient.post<CampanaDto>("/campanas", toCreateCampanaDto(input));
  return toCampana(data);
}

export async function updateCampana(id: number, input: Partial<CampaignFormInput>): Promise<Campana> {
  const dto: UpdateCampanaDto = {
    ...input,
    fechaInicio: input.fechaInicio ? formatFecha(input.fechaInicio) : undefined,
    fechaFin: input.fechaFin ? formatFecha(input.fechaFin) : undefined,
  };
  const { data } = await apiClient.patch<CampanaDto>(`/campanas/${id}`, dto);
  return toCampana(data);
}

export async function deleteCampana(id: number): Promise<void> {
  await apiClient.delete(`/campanas/${id}`);
}
