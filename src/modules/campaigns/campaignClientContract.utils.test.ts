import { describe, expect, it } from "vitest";
import { EMPTY_CAMPAIGN_CLIENT_CONTRACT, validateCampaignClientContract } from "@/modules/campaigns/campaignClientContract.utils";

describe("campaign client contract validation", () => {
    it("requires the commercial conditions and document", () => {
        const errors = validateCampaignClientContract(EMPTY_CAMPAIGN_CLIENT_CONTRACT, null);
        expect(errors).toMatchObject({ precioKg: expect.any(String), cantidadPropuestaKg: expect.any(String), condicionesPago: expect.any(String), condicionesEntrega: expect.any(String), archivo: expect.any(String) });
    });

    it("accepts a complete contract and preserves an existing document during edition", () => {
        const errors = validateCampaignClientContract({ precioKg: "1.25", moneda: "USD", cantidadPropuestaKg: "5000", condicionesPago: "50% adelanto", condicionesEntrega: "FOB Callao", observaciones: "" }, null, true);
        expect(errors).toEqual({});
    });
});
