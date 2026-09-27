import { describe, expect, it } from "vitest";
import {
    createEmptyCertificadoProveedorValues,
    createEmptyExamenProveedorValues,
    toCertificadoProveedorInput,
    toExamenProveedorInput,
    validateCertificadoProveedor,
    validateExamenProveedor,
} from "@/modules/providers/api/provider-subresources.validation";

describe("provider subresource DTO validation", () => {
    it("requires the exact exam DTO fields and accepts the backend result enum", () => {
        const values = { ...createEmptyExamenProveedorValues(), fecha: "2026-09-20", tipoExamen: " Residuo ", resultado: "negativo", origen: " Laboratorio ", observacion: " Sin observaciones ", documentoUrl: "https://example.com/examen.pdf" };
        expect(validateExamenProveedor(values)).toEqual({});
        expect(toExamenProveedorInput(values)).toEqual({ fecha: "2026-09-20", tipoExamen: "Residuo", resultado: "negativo", origen: "Laboratorio", observacion: "Sin observaciones", documentoUrl: "https://example.com/examen.pdf" });
        expect(validateExamenProveedor({ ...values, resultado: "aprobado" })).toHaveProperty("resultado");
    });

    it("reports missing or malformed exam values using field-level keys", () => {
        expect(validateExamenProveedor(createEmptyExamenProveedorValues())).toEqual({
            fecha: expect.any(String),
            tipoExamen: expect.any(String),
            resultado: expect.any(String),
            origen: expect.any(String),
            observacion: expect.any(String),
            documentoUrl: expect.any(String),
        });
        const values = { ...createEmptyExamenProveedorValues(), fecha: "2026-02-30", tipoExamen: "x".repeat(151), resultado: "positivo", origen: "Origen", observacion: "Obs", documentoUrl: "no-es-url" };
        expect(validateExamenProveedor(values)).toMatchObject({ fecha: expect.any(String), tipoExamen: expect.any(String), documentoUrl: expect.any(String) });
    });

    it("requires certificate date, name, and URL and trims its API payload", () => {
        const values = { ...createEmptyCertificadoProveedorValues(), fechaRevisionSenasa: "2026-09-21", nombre: " Registro SENASA ", documentoUrl: "https://example.com/certificado.pdf" };
        expect(validateCertificadoProveedor(values)).toEqual({});
        expect(toCertificadoProveedorInput(values)).toEqual({ fechaRevisionSenasa: "2026-09-21", nombre: "Registro SENASA", documentoUrl: "https://example.com/certificado.pdf" });
        expect(validateCertificadoProveedor(createEmptyCertificadoProveedorValues())).toMatchObject({ fechaRevisionSenasa: expect.any(String), nombre: expect.any(String), documentoUrl: expect.any(String) });
    });

    it("rejects script protocols and localhost URLs like the backend URL validator", () => {
        const validExam = { ...createEmptyExamenProveedorValues(), fecha: "2026-09-20", tipoExamen: "Residuo", resultado: "negativo", origen: "Laboratorio", observacion: "Sin observaciones", documentoUrl: "https://example.com/examen.pdf" };
        const invalidUrls = ["javascript://example.com/%0aalert(1)", "https://localhost/report"];
        expect(invalidUrls.map((documentoUrl) => validateExamenProveedor({ ...validExam, documentoUrl }).documentoUrl)).toEqual([expect.any(String), expect.any(String)]);
    });

    it("rejects script protocols and localhost URLs for certificates too", () => {
        const validCertificate = { ...createEmptyCertificadoProveedorValues(), fechaRevisionSenasa: "2026-09-21", nombre: "Registro SENASA", documentoUrl: "https://example.com/certificado.pdf" };
        const invalidUrls = ["javascript://example.com/%0aalert(1)", "https://localhost/report"];
        expect(invalidUrls.map((documentoUrl) => validateCertificadoProveedor({ ...validCertificate, documentoUrl }).documentoUrl)).toEqual([expect.any(String), expect.any(String)]);
    });

    it("matches backend rejection of spaces and DNS labels over 63 characters", () => {
        const validCertificate = { ...createEmptyCertificadoProveedorValues(), fechaRevisionSenasa: "2026-09-21", nombre: "Registro SENASA", documentoUrl: "https://example.com/certificado.pdf" };
        const invalidUrls = ["https://example.com/a b", `https://${"a".repeat(64)}.com/documento.pdf`];
        expect(invalidUrls.map((documentoUrl) => validateCertificadoProveedor({ ...validCertificate, documentoUrl }).documentoUrl)).toEqual([expect.any(String), expect.any(String)]);
    });

    it("accepts IPv4 and userinfo URLs that the backend validator accepts", () => {
        const base = { ...createEmptyCertificadoProveedorValues(), fechaRevisionSenasa: "2026-09-21", nombre: "Registro SENASA" };
        const backendAcceptedUrls = ["http://127.0.0.1/report", "https://user:pass@example.com/report"];
        expect(backendAcceptedUrls.map((documentoUrl) => validateCertificadoProveedor({ ...base, documentoUrl }).documentoUrl)).toEqual([undefined, undefined]);
    });
});
