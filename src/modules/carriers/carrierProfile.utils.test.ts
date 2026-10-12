import { describe, expect, it } from "vitest";
import {
    EMPTY_CARRIER,
    carrierLocation,
    splitCarrierValues,
    toCarrierProfile,
    validateCarrier,
    type CarrierFormValues,
} from "@/modules/carriers/carrierProfile.utils";

const publico: CarrierFormValues = {
    ...EMPTY_CARRIER,
    tipo: "publico",
    nombre: "Transportes Andes S.A.C.",
    ruc: "20123456789",
    mtc: "MTC-0456",
    numero: "987654321",
    correo: "contacto@andes.pe",
    departamento: "Piura",
    provincia: "Sullana",
    ciudad: "Sullana",
};

const privado: CarrierFormValues = {
    ...publico,
    tipo: "privado",
    nombre: "Juan Pérez Rojas",
    ruc: "",
    documento: "45871236",
    cgn: "CGN-778",
};

describe("validateCarrier", () => {
    it("acepta un transportista público completo", () => {
        expect(validateCarrier(publico)).toEqual({});
    });

    it("exige RUC al público y lo deja opcional al privado", () => {
        expect(validateCarrier({ ...publico, ruc: "" }).ruc).toBeDefined();
        expect(validateCarrier(privado).ruc).toBeUndefined();
    });

    it("rechaza un RUC que no tiene 11 dígitos, incluso siendo opcional", () => {
        expect(validateCarrier({ ...publico, ruc: "123" }).ruc).toBeDefined();
        expect(validateCarrier({ ...privado, ruc: "123" }).ruc).toBeDefined();
    });

    it("exige documento y CGN solo al independiente", () => {
        const errors = validateCarrier({ ...privado, documento: "", cgn: "" });
        expect(errors.documento).toBeDefined();
        expect(errors.cgn).toBeDefined();
        expect(validateCarrier({ ...publico, documento: "", cgn: "" })).toEqual({});
    });

    it("valida el formato del correo y exige la ubicación", () => {
        expect(validateCarrier({ ...publico, correo: "no-es-correo" }).correo).toBeDefined();
        const errors = validateCarrier({ ...publico, departamento: "", provincia: "", ciudad: "" });
        expect(Object.keys(errors).sort()).toEqual(["ciudad", "departamento", "provincia"]);
    });
});

describe("splitCarrierValues", () => {
    it("separa lo que guarda la API de los datos nuevos", () => {
        const { input, extras } = splitCarrierValues(publico);
        expect(input).toEqual({ nombre: "Transportes Andes S.A.C.", numero: "987654321", correo: "contacto@andes.pe", ruc: "20123456789" });
        expect(extras.tipo).toBe("publico");
        expect(extras.mtc).toBe("MTC-0456");
    });

    it("vacía el CGN y el documento de un transportista público", () => {
        const { extras } = splitCarrierValues({ ...publico, cgn: "CGN-1", documento: "999" });
        expect(extras.cgn).toBe("");
        expect(extras.documento).toBe("");
    });

    it("conserva el CGN y el documento de un independiente", () => {
        const { extras } = splitCarrierValues(privado);
        expect(extras.cgn).toBe("CGN-778");
        expect(extras.documento).toBe("45871236");
    });
});

describe("toCarrierProfile y carrierLocation", () => {
    const carrier = { id: 7, nombre: "Transportes", numero: "1", correo: "a@b.c", ruc: "20123456789", vehiculos: [], choferes: [] };

    it("sin datos nuevos asume un transportista público sin ubicación", () => {
        const profile = toCarrierProfile(carrier, undefined);
        expect(profile.tipo).toBe("publico");
        expect(profile.mtc).toBe("");
        expect(carrierLocation(profile)).toBe("");
    });

    it("une los datos nuevos al transportista de la API", () => {
        const { extras } = splitCarrierValues(privado);
        const profile = toCarrierProfile(carrier, extras);
        expect(profile.tipo).toBe("privado");
        expect(profile.id).toBe(7);
        expect(carrierLocation(profile)).toBe("Sullana, Sullana, Piura");
    });
});
