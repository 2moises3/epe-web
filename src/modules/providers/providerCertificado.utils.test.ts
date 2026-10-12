import { describe, expect, it } from "vitest";
import { displayCertificadoDate, EMPTY_CERTIFICADO, validateCertificado } from "@/modules/providers/providerCertificado.utils";

describe("validateCertificado", () => {
    it("exige nombre y fecha", () => {
        expect(Object.keys(validateCertificado(EMPTY_CERTIFICADO)).sort()).toEqual(["fechaRevisionSenasa", "nombre"]);
    });

    it("acepta un certificado completo", () => {
        expect(validateCertificado({ nombre: "Certificado SENASA", fechaRevisionSenasa: "2025-04-18" })).toEqual({});
    });

    it("rechaza nombres de más de 255 caracteres", () => {
        expect(validateCertificado({ nombre: "a".repeat(256), fechaRevisionSenasa: "2025-04-18" }).nombre).toBeDefined();
    });
});

describe("displayCertificadoDate", () => {
    it("muestra día/mes/año", () => {
        expect(displayCertificadoDate("2025-04-18")).toBe("18/04/2025");
    });
});
