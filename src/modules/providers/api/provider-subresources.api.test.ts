import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post, patch, deleteRequest } = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    deleteRequest: vi.fn(),
}));

vi.mock("@/shared/api/client", () => ({ apiClient: { get, post, patch, delete: deleteRequest } }));

import {
    assignProveedorFruta,
    createCertificadoProveedor,
    createExamenProveedor,
    deleteCertificadoProveedor,
    deleteExamenProveedor,
    getCertificadosProveedor,
    getExamenesProveedor,
    getFrutasProveedor,
    unassignProveedorFruta,
    updateCertificadoProveedor,
    updateExamenProveedor,
} from "@/modules/providers/api/provider-subresources.api";

const fruta = { pxfId: 1, proveedorId: 7, frutaId: 3, fruta: { frutaId: 3, name: "Mango" } };
const examen = {
    examenProveedorId: 8,
    proveedorId: 7,
    fecha: "2026-09-20T00:00:00.000Z",
    tipoExamen: "Residuo",
    resultado: "negativo" as const,
    origen: "Laboratorio",
    observacion: "Sin observaciones",
    documentoUrl: "https://example.com/examen.pdf",
};
const certificado = {
    certificadoProveedorId: 9,
    proveedorId: 7,
    fechaRevisionSenasa: "2026-09-21T00:00:00.000Z",
    nombre: "Registro SENASA",
    documentoUrl: "https://example.com/certificado.pdf",
};

describe("provider subresource API", () => {
    beforeEach(() => vi.clearAllMocks());

    it("reads assigned fruit and assigns or removes it using the path-parameter contract", async () => {
        get.mockResolvedValueOnce({ data: [fruta] });
        post.mockResolvedValueOnce({ data: fruta });
        deleteRequest.mockResolvedValueOnce({});

        await expect(getFrutasProveedor(7)).resolves.toEqual([fruta]);
        await expect(assignProveedorFruta(7, 3)).resolves.toEqual(fruta);
        await expect(unassignProveedorFruta(7, 3)).resolves.toBeUndefined();
        expect(get).toHaveBeenCalledWith("/proveedores/7/frutas");
        expect(post).toHaveBeenCalledWith("/proveedores/7/frutas/3");
        expect(deleteRequest).toHaveBeenCalledWith("/proveedores/7/frutas/3");
    });

    it("reads and mutates provider exams with exact IDs and DTO fields", async () => {
        get.mockResolvedValueOnce({ data: [examen] });
        post.mockResolvedValueOnce({ data: examen });
        patch.mockResolvedValueOnce({ data: examen });
        deleteRequest.mockResolvedValueOnce({});
        const examenProveedorId = examen.examenProveedorId;
        const payload = { fecha: examen.fecha, tipoExamen: examen.tipoExamen, resultado: examen.resultado, origen: examen.origen, observacion: examen.observacion, documentoUrl: examen.documentoUrl };

        await expect(getExamenesProveedor(7)).resolves.toEqual([examen]);
        await expect(createExamenProveedor(7, payload)).resolves.toEqual(examen);
        await expect(updateExamenProveedor(7, examenProveedorId, payload)).resolves.toEqual(examen);
        await expect(deleteExamenProveedor(7, examenProveedorId)).resolves.toBeUndefined();
        expect(get).toHaveBeenCalledWith("/proveedores/7/examenes");
        expect(post).toHaveBeenCalledWith("/proveedores/7/examenes", payload);
        expect(patch).toHaveBeenCalledWith("/proveedores/7/examenes/8", payload);
        expect(deleteRequest).toHaveBeenCalledWith("/proveedores/7/examenes/8");
    });

    it("reads and mutates provider certificates with exact IDs and DTO fields", async () => {
        get.mockResolvedValueOnce({ data: [certificado] });
        post.mockResolvedValueOnce({ data: certificado });
        patch.mockResolvedValueOnce({ data: certificado });
        deleteRequest.mockResolvedValueOnce({});
        const certificadoProveedorId = certificado.certificadoProveedorId;
        const payload = { fechaRevisionSenasa: certificado.fechaRevisionSenasa, nombre: certificado.nombre, documentoUrl: certificado.documentoUrl };

        await expect(getCertificadosProveedor(7)).resolves.toEqual([certificado]);
        await expect(createCertificadoProveedor(7, payload)).resolves.toEqual(certificado);
        await expect(updateCertificadoProveedor(7, certificadoProveedorId, payload)).resolves.toEqual(certificado);
        await expect(deleteCertificadoProveedor(7, certificadoProveedorId)).resolves.toBeUndefined();
        expect(get).toHaveBeenCalledWith("/proveedores/7/certificados");
        expect(post).toHaveBeenCalledWith("/proveedores/7/certificados", payload);
        expect(patch).toHaveBeenCalledWith("/proveedores/7/certificados/9", payload);
        expect(deleteRequest).toHaveBeenCalledWith("/proveedores/7/certificados/9");
    });
});
