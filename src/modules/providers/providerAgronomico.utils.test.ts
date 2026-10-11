import { describe, expect, it } from "vitest";
import {
    EMPTY_DATOS_AGRONOMICOS,
    toDatosAgronomicos,
    toFormValues,
    validateDatosAgronomicos,
    type DatosAgronomicosFormValues,
} from "@/modules/providers/providerAgronomico.utils";

const values = (overrides: Partial<DatosAgronomicosFormValues> = {}): DatosAgronomicosFormValues => ({
    nombre: "Plan 2026",
    densidadPlantacion: "250",
    distanciamiento: "4.5",
    frecuenciaRiego: "3",
    nombreAplicacion: "Fertilizante X",
    aplicacionesAlAno: "2",
    ...overrides,
});

describe("validateDatosAgronomicos", () => {
    it("acepta un registro completo", () => {
        expect(validateDatosAgronomicos(values())).toEqual({});
    });

    it("exige todos los campos", () => {
        expect(Object.keys(validateDatosAgronomicos(EMPTY_DATOS_AGRONOMICOS)).sort()).toEqual([
            "aplicacionesAlAno",
            "densidadPlantacion",
            "distanciamiento",
            "frecuenciaRiego",
            "nombre",
            "nombreAplicacion",
        ]);
    });

    it("pide densidad y distanciamiento mayores a cero", () => {
        const errors = validateDatosAgronomicos(values({ densidadPlantacion: "0", distanciamiento: "-1" }));
        expect(errors.densidadPlantacion).toBeDefined();
        expect(errors.distanciamiento).toBeDefined();
    });

    it("pide enteros en riego y aplicaciones, y acepta cero", () => {
        expect(validateDatosAgronomicos(values({ frecuenciaRiego: "0", aplicacionesAlAno: "0" }))).toEqual({});
        const errors = validateDatosAgronomicos(values({ frecuenciaRiego: "1.5", aplicacionesAlAno: "-2" }));
        expect(errors.frecuenciaRiego).toBeDefined();
        expect(errors.aplicacionesAlAno).toBeDefined();
    });

    it("rechaza texto que no es número", () => {
        expect(validateDatosAgronomicos(values({ densidadPlantacion: "abc" })).densidadPlantacion).toBeDefined();
    });
});

describe("toDatosAgronomicos / toFormValues", () => {
    it("recorta textos y convierte números", () => {
        expect(toDatosAgronomicos(values({ nombre: "  Lote norte ", nombreAplicacion: " Urea " }))).toEqual({
            nombre: "Lote norte",
            densidadPlantacion: 250,
            distanciamiento: 4.5,
            frecuenciaRiego: 3,
            nombreAplicacion: "Urea",
            aplicacionesAlAno: 2,
        });
    });

    it("carga un registro guardado de vuelta al formulario sin perder datos", () => {
        const form = values();
        expect(toFormValues(toDatosAgronomicos(form))).toEqual(form);
    });
});
