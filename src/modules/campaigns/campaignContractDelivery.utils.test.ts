import { describe, expect, it } from "vitest";
import { EMPTY_CONTRACT_DELIVERY, validateContractDelivery } from "@/modules/campaigns/campaignContractDelivery.utils";

describe("contract delivery validation", () => {
    it("requires date, kilos and destination", () => {
        expect(validateContractDelivery(EMPTY_CONTRACT_DELIVERY)).toMatchObject({ fecha: expect.any(String), kilosProgramados: expect.any(String), destino: expect.any(String) });
    });

    it("accepts a complete delivery", () => {
        expect(validateContractDelivery({ fecha: "2026-10-20", kilosProgramados: "1500.5", destino: "Puerto del Callao", observaciones: "Frío controlado" })).toEqual({});
    });
});
