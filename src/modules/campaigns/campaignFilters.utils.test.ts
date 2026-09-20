import { describe, expect, it } from "vitest";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import { filterCampanas } from "@/modules/campaigns/campaignFilters.utils";

const campaign = (overrides: Partial<Campana> = {}): Campana => ({
    campaniaId: 1,
    nombre: "Mango Kent",
    frutaId: 1,
    fechaInicio: new Date(2026, 0, 10),
    fechaFin: new Date(2026, 2, 10),
    estado: "planificacion",
    requerimientoComercial: 100,
    createdAt: "",
    updatedAt: "",
    ...overrides,
});

describe("filterCampanas", () => {
    it("filters by case-insensitive name and inclusive calendar date boundaries", () => {
        const rows = [
            campaign(),
            campaign({ campaniaId: 2, nombre: "Palta", fechaInicio: new Date(2026, 0, 9) }),
            campaign({ campaniaId: 3, nombre: "Mango Ataulfo", fechaFin: new Date(2026, 2, 11) }),
        ];

        expect(filterCampanas(rows, "  MANGO ", "2026-01-10", "2026-03-10").map((row) => row.campaniaId)).toEqual([1]);
    });

    it("returns all campaigns when filters are empty", () => {
        const rows = [campaign(), campaign({ campaniaId: 2 })];
        expect(filterCampanas(rows, "", "", "")).toEqual(rows);
    });

    it("matches fruit names when the API model includes fruit details", () => {
        const rows = [campaign({ fruta: { frutaId: 9, name: "Mango Kent" } as Campana["fruta"] })];
        expect(filterCampanas(rows, "kent", "", "")).toEqual(rows);
    });
});
