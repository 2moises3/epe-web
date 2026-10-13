import { describe, expect, it } from "vitest";
import { EMPTY_EXAM, normalizeExam, validateExam, type ExamValues } from "@/modules/campaigns/campaignExam";

const pendiente: ExamValues = {
    ...EMPTY_EXAM,
    tipoExamen: "CADMIO",
    fecha: "2026-10-11",
    identificacionMuestra: "MUESTRA-001",
};

const archivo = new File(["x"], "resultado.pdf", { type: "application/pdf" });

describe("validateExam", () => {
    it("un examen pendiente de envío solo exige tipo, fecha e identificación", () => {
        expect(validateExam(pendiente)).toEqual({});
        expect(Object.keys(validateExam(EMPTY_EXAM)).sort()).toEqual(["fecha", "identificacionMuestra", "tipoExamen"]);
    });

    it("al enviarse exige la fecha de envío y que no sea anterior al examen", () => {
        expect(validateExam({ ...pendiente, estado: "enviado" }).fechaEnvioMuestra).toBeDefined();
        expect(validateExam({ ...pendiente, estado: "enviado", fechaEnvioMuestra: "2026-10-10" }).fechaEnvioMuestra).toBeDefined();
        expect(validateExam({ ...pendiente, estado: "enviado", fechaEnvioMuestra: "2026-10-12" })).toEqual({});
    });

    it("con resultado exige el resultado y el documento del laboratorio", () => {
        const base = { ...pendiente, estado: "resultado" as const, fechaEnvioMuestra: "2026-10-12" };
        const errors = validateExam(base);
        expect(errors.resultado).toBeDefined();
        expect(errors.archivo).toBeDefined();
        expect(validateExam({ ...base, resultado: "negativo", archivo })).toEqual({});
    });
});

describe("normalizeExam", () => {
    it("descarta la fecha de envío y el resultado que no corresponden a la etapa", () => {
        const values: ExamValues = { ...pendiente, fechaEnvioMuestra: "2026-10-12", resultado: "positivo", observacion: "  nota  " };
        expect(normalizeExam(values)).toMatchObject({ fechaEnvioMuestra: "", resultado: "", observacion: "nota" });
        expect(normalizeExam({ ...values, estado: "enviado" })).toMatchObject({ fechaEnvioMuestra: "2026-10-12", resultado: "" });
        expect(normalizeExam({ ...values, estado: "resultado" })).toMatchObject({ fechaEnvioMuestra: "2026-10-12", resultado: "positivo" });
    });
});
