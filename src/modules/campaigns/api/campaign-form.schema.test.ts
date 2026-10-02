import { describe, expect, it } from "vitest";
import { campaignFormSchema, linkClientSchema, linkProviderSchema } from "@/modules/campaigns/api/campaign-form.schema";

describe("API-backed campaign form schemas", () => {
  it("rejects campaign date ranges that end before they start", () => {
    const result = campaignFormSchema.safeParse({
      nombre: "Mango", frutaId: 2, fechaInicio: "2026-06-10", fechaFin: "2026-06-01",
      estado: "planificacion", requerimientoComercial: "100",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["fechaFin"]);
  });

  it("validates required client link fields and URL format", () => {
    expect(linkClientSchema.safeParse({ clienteNegocioId: 1, cantidadKg: 0, documentoUrl: "not-a-url" }).success).toBe(false);
  });

  it("requires a selected provider and valid estimated quantity", () => {
    expect(linkProviderSchema.safeParse({ proveedorId: 0, cantidad: "-1" }).success).toBe(false);
  });
});
