import { describe, expect, it } from "vitest";
import { EMPTY_FINCA, toFinca, validateFinca, type FincaFormValues } from "@/modules/providers/providerFinca.utils";

const values = (overrides: Partial<FincaFormValues> = {}): FincaFormValues => ({
    ...EMPTY_FINCA,
    nombre: "Fundo Tambogrande",
    departamento: "Piura",
    provincia: "Piura",
    distrito: "Tambogrande",
    haTotal: "20",
    haCultivo: "12.5",
    ...overrides,
});

describe("validateFinca", () => {
    it("acepta una finca completa sin coordenadas", () => {
        expect(validateFinca(values())).toEqual({});
    });

    it("exige nombre, ubicación y hectáreas", () => {
        const errors = validateFinca(EMPTY_FINCA);
        expect(Object.keys(errors).sort()).toEqual(["departamento", "distrito", "haCultivo", "haTotal", "nombre", "provincia"]);
    });

    it("no permite repetir el nombre de una finca del mismo proveedor", () => {
        expect(validateFinca(values({ nombre: "  fundo TAMBOGRANDE " }), ["Fundo Tambogrande"]).nombre).toBeDefined();
        expect(validateFinca(values({ nombre: "Fundo Sullana" }), ["Fundo Tambogrande"]).nombre).toBeUndefined();
    });

    it("valida el rango de las coordenadas solo cuando se escriben", () => {
        expect(validateFinca(values({ latitud: "-5.19", longitud: "-80.63" }))).toEqual({});
        const errors = validateFinca(values({ latitud: "91", longitud: "-181" }));
        expect(errors.latitud).toBeDefined();
        expect(errors.longitud).toBeDefined();
    });

    it("no permite más hectáreas de cultivo que hectáreas totales", () => {
        expect(validateFinca(values({ haTotal: "10", haCultivo: "10.5" })).haCultivo).toBeDefined();
        expect(validateFinca(values({ haTotal: "10", haCultivo: "10" })).haCultivo).toBeUndefined();
    });

    it("exige hectáreas totales mayores a cero", () => {
        expect(validateFinca(values({ haTotal: "0", haCultivo: "0" })).haTotal).toBeDefined();
    });
});

describe("toFinca", () => {
    it("recorta textos y convierte números, dejando en null las coordenadas vacías", () => {
        expect(toFinca(values({ nombre: "  Fundo Norte ", latitud: "-5.2" }))).toEqual({
            nombre: "Fundo Norte",
            departamento: "Piura",
            provincia: "Piura",
            distrito: "Tambogrande",
            latitud: -5.2,
            longitud: null,
            haTotal: 20,
            haCultivo: 12.5,
        });
    });
});
