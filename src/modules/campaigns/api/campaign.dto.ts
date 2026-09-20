export interface FrutaDto {
  frutaId: number;
  name: string;
}

export interface FrutaDerivadaDto {
  frutaDerivadaId: number;
  name: string;
  frutaId: number;
  createdAt: string;
  updatedAt: string;
}

export type CampanaEstado = "planificacion" | "en proceso" | "terminado";

export interface CampanaDto {
  campaniaId: number;
  nombre: string;
  frutaId: number;
  fruta?: FrutaDto;
  fechaInicio: string;
  fechaFin: string;
  estado: CampanaEstado;
  requerimientoComercial: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampanaDto {
  nombre: string;
  frutaId: number;
  fechaInicio: string;
  fechaFin: string;
  estado: CampanaEstado;
  requerimientoComercial: string;
}

export type UpdateCampanaDto = Partial<CreateCampanaDto>;
