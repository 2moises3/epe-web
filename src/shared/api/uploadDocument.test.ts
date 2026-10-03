import { describe, expect, it } from "vitest";
import { FileUploadUnavailableError, getUploadErrorMessage, uploadDocument } from "@/shared/api/uploadDocument";

describe("uploadDocument", () => {
    it("fails with a recognizable error while there is no file service", async () => {
        await expect(uploadDocument(new File(["x"], "contrato.pdf"))).rejects.toBeInstanceOf(FileUploadUnavailableError);
    });

    it("explains the missing service differently from any other failure", () => {
        expect(getUploadErrorMessage(new FileUploadUnavailableError())).toMatch(/aún no está conectado/);
        expect(getUploadErrorMessage(new Error("network"))).toMatch(/No se pudo subir/);
    });
});
