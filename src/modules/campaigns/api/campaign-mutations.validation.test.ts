import { describe, expect, it } from "vitest";
import {
  toCampaignClientUpdatePayload,
  createCampaignMutationGuard,
  validateCampaignClientUpdate,
  validateCampaignCertificate,
  toCampaignCertificatePayload,
  toCampaignCertificateUpdatePayload,
  hasCampaignClientChanges,
  hasCampaignCertificateChanges,
  validateCampaignClientCreate,
  toCampaignClientCreatePayload,
} from "@/modules/campaigns/api/campaign-mutations.validation";

describe("campaign client relation editing", () => {
  it("projects only PATCH-writable fields and converts numeric fields", () => {
    expect(toCampaignClientUpdatePayload({
      documentoUrl: " https://example.com/requirements.pdf ",
      fechaRegistro: "2026-06-21",
      fichaTecnicaUrl: "https://example.com/technical.pdf",
      cantidadKg: "125.125",
      kilosAcordados: "140",
    })).toEqual({
      documentoUrl: "https://example.com/requirements.pdf",
      fechaRegistro: "2026-06-21",
      fichaTecnicaUrl: "https://example.com/technical.pdf",
      cantidadKg: 125.125,
      kilosAcordados: 140,
    });
  });

  it("reports invalid URLs, date and decimal constraints against the DTO", () => {
    expect(validateCampaignClientUpdate({
      documentoUrl: "javascript:alert(1)",
      fechaRegistro: "not-a-date",
      fichaTecnicaUrl: "invalid-url",
      cantidadKg: "-1",
      kilosAcordados: "1.2345",
    })).toMatchObject({
      documentoUrl: expect.any(String),
      fechaRegistro: expect.any(String),
      fichaTecnicaUrl: expect.any(String),
      cantidadKg: expect.any(String),
      kilosAcordados: expect.any(String),
    });
  });

  it("omits unchanged or blank optional values from the update payload", () => {
    expect(toCampaignClientUpdatePayload({
      documentoUrl: "",
      fechaRegistro: "",
      fichaTecnicaUrl: "https://example.com/technical.pdf",
      cantidadKg: "",
      kilosAcordados: "140",
    })).toEqual({
      fichaTecnicaUrl: "https://example.com/technical.pdf",
      kilosAcordados: 140,
    });
  });

  it("rejects clearing a populated optional field but permits one that was initially blank", () => {
    const original = {
      documentoUrl: "https://example.com/requirements.pdf",
      fechaRegistro: "2026-06-21",
      fichaTecnicaUrl: "",
      cantidadKg: "125.125",
      kilosAcordados: "140",
    };
    expect(validateCampaignClientUpdate({ ...original, documentoUrl: "" }, original)).toMatchObject({
      documentoUrl: "No se puede vaciar un campo que ya tenía valor.",
    });
    expect(validateCampaignClientUpdate({ ...original, fichaTecnicaUrl: "" }, original)).toEqual({});
  });

  it("treats an unchanged relation as a no-op and detects a real edit", () => {
    const values = {
      documentoUrl: "https://example.com/requirements.pdf",
      fechaRegistro: "2026-06-21",
      fichaTecnicaUrl: "https://example.com/technical.pdf",
      cantidadKg: "125.125",
      kilosAcordados: "140",
    };
    expect(hasCampaignClientChanges(values, values)).toBe(false);
    expect(hasCampaignClientChanges({ ...values, cantidadKg: "126" }, values)).toBe(true);
  });
});

describe("campaign certificate form", () => {
  it("requires the backend create DTO fields and accepts only backend status values", () => {
    expect(validateCampaignCertificate({
      nombre: " ",
      documentoUrl: "not-a-url",
      reciboUrl: "",
      costo: "-0.01",
      fechaVencimiento: "2026-02-31",
      estado: "active",
    })).toMatchObject({
      nombre: expect.any(String),
      documentoUrl: expect.any(String),
      reciboUrl: expect.any(String),
      costo: expect.any(String),
      fechaVencimiento: expect.any(String),
      estado: expect.any(String),
    });
  });

  it("accepts valid backend-compatible form data", () => {
    const values = {
      nombre: "Global GAP",
      documentoUrl: "https://example.com/certificate.pdf",
      reciboUrl: "https://example.com/receipt.pdf",
      costo: "123.45",
      fechaVencimiento: "2026-08-31",
      estado: "vigente",
    };
    expect(validateCampaignCertificate(values)).toEqual({});
    expect(toCampaignCertificatePayload(values)).toEqual({
      nombre: "Global GAP",
      documentUrl: "https://example.com/certificate.pdf",
      reciboUrl: "https://example.com/receipt.pdf",
      costo: 123.45,
      fechaVencimiento: "2026-08-31",
      estado: "vigente",
    });
    expect(toCampaignCertificateUpdatePayload({ ...values, nombre: "", costo: "" })).toEqual({
      documentUrl: values.documentoUrl,
      reciboUrl: values.reciboUrl,
      fechaVencimiento: values.fechaVencimiento,
      estado: values.estado,
    });
  });

  it("rejects clearing a populated optional value but permits an initially blank value", () => {
    const original = {
      nombre: "Global GAP",
      documentoUrl: "https://example.com/certificate.pdf",
      reciboUrl: "",
      costo: "123.45",
      fechaVencimiento: "2026-08-31",
      estado: "vigente",
    };
    expect(validateCampaignCertificate({ ...original, documentoUrl: "" }, true, original)).toMatchObject({
      documentoUrl: "No se puede vaciar un campo que ya tenía valor.",
    });
    expect(validateCampaignCertificate({ ...original, reciboUrl: "" }, true, original)).toEqual({});
  });

  it("treats an unchanged certificate as a no-op and detects a real edit", () => {
    const values = {
      nombre: "Global GAP",
      documentoUrl: "https://example.com/certificate.pdf",
      reciboUrl: "https://example.com/receipt.pdf",
      costo: "123.45",
      fechaVencimiento: "2026-08-31",
      estado: "vigente",
    };
    expect(hasCampaignCertificateChanges(values, values)).toBe(false);
    expect(hasCampaignCertificateChanges({ ...values, costo: "124" }, values)).toBe(true);
  });
});

describe("campaign mutation guard", () => {
  it("synchronously rejects duplicate saves and releases after completion", () => {
    const guard = createCampaignMutationGuard();
    expect(guard.acquire()).toBe(true);
    expect(guard.isInFlight).toBe(true);
    expect(guard.acquire()).toBe(false);
    guard.release();
    expect(guard.acquire()).toBe(true);
  });
});

describe("campaign client relation creation", () => {
  const valid = {
    clienteNegocioId: "7",
    documentoUrl: " https://example.com/requerimiento.pdf ",
    fechaRegistro: "2026-10-03",
    fichaTecnicaUrl: "https://example.com/ficha.pdf",
    cantidadKg: "1200.5",
    kilosAcordados: "1000",
  };

  it("accepts a complete relation and builds the full create DTO", () => {
    expect(validateCampaignClientCreate(valid)).toEqual({});
    expect(toCampaignClientCreatePayload(valid)).toEqual({
      clienteNegocioId: 7,
      documentoUrl: "https://example.com/requerimiento.pdf",
      fechaRegistro: "2026-10-03",
      fichaTecnicaUrl: "https://example.com/ficha.pdf",
      cantidadKg: 1200.5,
      kilosAcordados: 1000,
    });
  });

  it("requires every field the backend create DTO requires", () => {
    expect(validateCampaignClientCreate({
      clienteNegocioId: "",
      documentoUrl: "",
      fechaRegistro: "",
      fichaTecnicaUrl: "ficha.pdf",
      cantidadKg: "",
      kilosAcordados: "-5",
    })).toEqual({
      clienteNegocioId: expect.any(String),
      documentoUrl: expect.any(String),
      fechaRegistro: expect.any(String),
      fichaTecnicaUrl: expect.any(String),
      cantidadKg: expect.any(String),
      kilosAcordados: expect.any(String),
    });
  });
});
