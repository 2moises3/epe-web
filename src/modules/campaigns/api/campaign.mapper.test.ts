import { describe, expect, it } from "vitest";
import { toCampana, toCreateCampanaDto } from "@/modules/campaigns/api/campaign.mapper";
import type { CampanaDto } from "@/modules/campaigns/api/campaign.dto";

const baseDto: CampanaDto = {
  campaniaId: 1,
  nombre: "Mango 2026",
  frutaId: 2,
  fruta: { frutaId: 2, name: "Mango" },
  fechaInicio: "2026-06-01",
  fechaFin: "2026-08-31",
  estado: "planificacion",
  requerimientoComercial: 3000.5,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("toCampana", () => {
  it("convierte fechaInicio y fechaFin a Date sin corrimiento de dia", () => {
    const campana = toCampana(baseDto);

    expect(campana.fechaInicio.getFullYear()).toBe(2026);
    expect(campana.fechaInicio.getMonth()).toBe(5);
    expect(campana.fechaInicio.getDate()).toBe(1);

    expect(campana.fechaFin.getFullYear()).toBe(2026);
    expect(campana.fechaFin.getMonth()).toBe(7);
    expect(campana.fechaFin.getDate()).toBe(31);
  });

  it("convierte fechas en formato ISO completo (shape real del backend) a Date valido", () => {
    const campana = toCampana({
      ...baseDto,
      fechaInicio: "2026-06-01T00:00:00.000Z",
      fechaFin: "2026-08-31T00:00:00.000Z",
    });

    expect(campana.fechaInicio.getFullYear()).toBe(2026);
    expect(campana.fechaInicio.getMonth()).toBe(5);
    expect(campana.fechaInicio.getDate()).toBe(1);

    expect(campana.fechaFin.getFullYear()).toBe(2026);
    expect(campana.fechaFin.getMonth()).toBe(7);
    expect(campana.fechaFin.getDate()).toBe(31);
  });

  it("mantiene requerimientoComercial como number", () => {
    const campana = toCampana(baseDto);

    expect(campana.requerimientoComercial).toBe(3000.5);
    expect(typeof campana.requerimientoComercial).toBe("number");
  });
});

describe("toCreateCampanaDto", () => {
  it("formatea fechas Date a 'YYYY-MM-DD' sin corrimiento de dia", () => {
    const dto = toCreateCampanaDto({
      nombre: "Mango 2026",
      frutaId: 2,
      fechaInicio: new Date(2026, 5, 1),
      fechaFin: new Date(2026, 7, 31),
      estado: "planificacion",
      requerimientoComercial: "3000.50",
    });

    expect(dto.fechaInicio).toBe("2026-06-01");
    expect(dto.fechaFin).toBe("2026-08-31");
  });

  it("mantiene requerimientoComercial como string", () => {
    const dto = toCreateCampanaDto({
      nombre: "Mango 2026",
      frutaId: 2,
      fechaInicio: new Date(2026, 5, 1),
      fechaFin: new Date(2026, 7, 31),
      estado: "planificacion",
      requerimientoComercial: "3000.50",
    });

    expect(dto.requerimientoComercial).toBe("3000.50");
    expect(typeof dto.requerimientoComercial).toBe("string");
  });
});
