import { describe, expect, it } from "vitest";
import {
    EMPTY_CERTIFICADO_CAMPANA,
    getVigenciaAutomatica,
    validateCertificadoCampana,
    type CertificadoCampanaFormValues,
} from "@/modules/campaigns/campaignCertificate.utils";

const valid: CertificadoCampanaFormValues = {
    ...EMPTY_CERTIFICADO_CAMPANA,
    tipo: "Global GAP",
    nombre: "GlobalGAP Mango 2026",
    organismoEmisor: "SGS Perú",
    costo: "1500.50",
};

describe("validateCertificadoCampana", () => {
    it("exige tipo, nombre, organismo y costo", () => {
        const errors = validateCertificadoCampana(EMPTY_CERTIFICADO_CAMPANA);
        expect(Object.keys(errors).sort()).toEqual(["costo", "nombre", "organismoEmisor", "tipo"]);
    });

    it("acepta un registro completo sin los campos opcionales", () => {
        expect(validateCertificadoCampana(valid)).toEqual({});
    });

    it("rechaza costos negativos o con más de 2 decimales", () => {
        expect(validateCertificadoCampana({ ...valid, costo: "-5" }).costo).toBeDefined();
        expect(validateCertificadoCampana({ ...valid, costo: "10.123" }).costo).toBeDefined();
    });

    it("valida los kilos solo si se escribieron", () => {
        expect(validateCertificadoCampana({ ...valid, kilosIniciales: "" }).kilosIniciales).toBeUndefined();
        expect(validateCertificadoCampana({ ...valid, kilosIniciales: "abc" }).kilosIniciales).toBeDefined();
        expect(validateCertificadoCampana({ ...valid, kilosIniciales: "1200.5" }).kilosIniciales).toBeUndefined();
    });

    it("no exige el periodo, pero si se completa debe ir en orden", () => {
        expect(validateCertificadoCampana({ ...valid, validoDesde: "2026-05-01" }).validoHasta).toBeUndefined();
        expect(validateCertificadoCampana({ ...valid, validoDesde: "2026-05-10", validoHasta: "2026-05-01" }).validoHasta).toBeDefined();
    });
});

describe("getVigenciaAutomatica", () => {
    const now = new Date(2026, 5, 15); // 15/06/2026

    it("no calcula nada sin las dos fechas", () => {
        expect(getVigenciaAutomatica("", "", now)).toBe("Sin fechas completas");
        expect(getVigenciaAutomatica("2026-01-01", "", now)).toBe("Sin fechas completas");
    });

    it("clasifica según dónde cae hoy dentro del periodo", () => {
        expect(getVigenciaAutomatica("2026-07-01", "2027-07-01", now)).toBe("Por iniciar");
        expect(getVigenciaAutomatica("2026-01-01", "2027-01-01", now)).toBe("Vigente");
        expect(getVigenciaAutomatica("2026-01-01", "2026-07-10", now)).toBe("Por vencer");
        expect(getVigenciaAutomatica("2026-01-01", "2026-06-14", now)).toBe("Vencida");
    });

    it("el último día todavía cuenta como por vencer, no vencida", () => {
        expect(getVigenciaAutomatica("2026-01-01", "2026-06-15", now)).toBe("Por vencer");
    });
});
