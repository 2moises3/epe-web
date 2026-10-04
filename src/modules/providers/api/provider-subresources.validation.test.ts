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

    it("requires certificate date and name and serializes the attached file ID", () => {
        const values = { ...createEmptyCertificadoProveedorValues(), fechaRevisionSenasa: "2026-09-21", nombre: " Registro SENASA " };
        expect(validateCertificadoProveedor(values)).toEqual({});
        expect(toCertificadoProveedorInput(values, 4)).toEqual({ fechaRevisionSenasa: "2026-09-21", nombre: "Registro SENASA", documentoArchivoId: 4 });
        expect(validateCertificadoProveedor(createEmptyCertificadoProveedorValues())).toMatchObject({ fechaRevisionSenasa: expect.any(String), nombre: expect.any(String) });
    });

    it("accepts only allowed provider certificate file types up to 10 MiB", async () => {
        const { validateCertificadoProveedorFile } = await import("@/modules/providers/api/provider-subresources.validation");
        const pdf = new File(["pdf"], "certificado.pdf", { type: "application/pdf" });
        expect(validateCertificadoProveedorFile(pdf)).toBeUndefined();
        expect(validateCertificadoProveedorFile(new File(["x"], "file.gif", { type: "image/gif" }))).toBeTruthy();
        expect(validateCertificadoProveedorFile(new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf", { type: "application/pdf" }))).toBeTruthy();
    });

    it("rejects script protocols and localhost URLs like the backend URL validator", () => {
        const validExam = { ...createEmptyExamenProveedorValues(), fecha: "2026-09-20", tipoExamen: "Residuo", resultado: "negativo", origen: "Laboratorio", observacion: "Sin observaciones", documentoUrl: "https://example.com/examen.pdf" };
        const invalidUrls = ["javascript://example.com/%0aalert(1)", "https://localhost/report"];
        expect(invalidUrls.map((documentoUrl) => validateExamenProveedor({ ...validExam, documentoUrl }).documentoUrl)).toEqual([expect.any(String), expect.any(String)]);
    });

});
