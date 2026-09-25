import { describe, expect, it } from "vitest";
import { toCertificadoCampana, toCreateCertificadoCampanaDto } from "@/modules/campaigns/api/certificado-campana.mapper";
import type { CertificadoCampanaDto } from "@/modules/campaigns/api/certificado-campana.dto";

const baseDto: CertificadoCampanaDto = {
  certificadoId: 1,
  nombre: "Global GAP",
  documentUrl: "https://example.com/certificados/global-gap.pdf",
  fechaVencimiento: "2026-08-31",
  campaniaId: 5,
  estado: "vigente",
};

describe("toCertificadoCampana", () => {
  it("convierte fechaVencimiento a Date sin corrimiento de dia", () => {
    const certificado = toCertificadoCampana(baseDto);

    expect(certificado.fechaVencimiento.getFullYear()).toBe(2026);
    expect(certificado.fechaVencimiento.getMonth()).toBe(7);
    expect(certificado.fechaVencimiento.getDate()).toBe(31);
  });

  it("renombra documentUrl a documentoUrl", () => {
    const certificado = toCertificadoCampana(baseDto);

    expect(certificado.documentoUrl).toBe("https://example.com/certificados/global-gap.pdf");
    expect(certificado).not.toHaveProperty("documentUrl");
  });

  it("convierte fechaVencimiento en formato ISO completo (shape real del backend) a Date valido", () => {
    const certificado = toCertificadoCampana({
      ...baseDto,
      fechaVencimiento: "2026-08-31T00:00:00.000Z",
    });

    expect(certificado.fechaVencimiento.getFullYear()).toBe(2026);
    expect(certificado.fechaVencimiento.getMonth()).toBe(7);
    expect(certificado.fechaVencimiento.getDate()).toBe(31);
  });
});

describe("toCreateCertificadoCampanaDto", () => {
  it("formatea fechaVencimiento a 'YYYY-MM-DD' sin corrimiento de dia", () => {
    const dto = toCreateCertificadoCampanaDto({
      nombre: "Global GAP",
      documentoUrl: "https://example.com/certificados/global-gap.pdf",
      fechaVencimiento: new Date(2026, 7, 31),
      estado: "vigente",
    });

    expect(dto.fechaVencimiento).toBe("2026-08-31");
  });

  it("renombra documentoUrl a documentUrl", () => {
    const dto = toCreateCertificadoCampanaDto({
      nombre: "Global GAP",
      documentoUrl: "https://example.com/certificados/global-gap.pdf",
      fechaVencimiento: new Date(2026, 7, 31),
      estado: "vigente",
    });

    expect(dto.documentUrl).toBe("https://example.com/certificados/global-gap.pdf");
    expect(dto).not.toHaveProperty("documentoUrl");
  });
});
