import { beforeEach, describe, expect, it } from "vitest";
import {
    addFinca,
    getProviderLocalData,
    resetProviderLocalData,
    saveDatosAgronomicos,
} from "@/modules/providers/providerLocalData.store";
import type { Finca } from "@/modules/providers/providerFinca.utils";
import type { DatosAgronomicos } from "@/modules/providers/providerAgronomico.utils";

const finca = (nombre: string): Finca => ({
    nombre,
    departamento: "Piura",
    provincia: "Piura",
    distrito: "Tambogrande",
    latitud: null,
    longitud: null,
    haTotal: 10,
    haCultivo: 8,
});

const agronomicos = (nombre: string): DatosAgronomicos => ({
    nombre,
    densidadPlantacion: 250,
    distanciamiento: 4,
    frecuenciaRiego: 3,
    nombreAplicacion: "Urea",
    aplicacionesAlAno: 2,
});

describe("providerLocalData.store", () => {
    beforeEach(() => resetProviderLocalData());

    it("agrega fincas por proveedor, en el orden en que se registran", () => {
        addFinca(1, finca("Fundo A"));
        addFinca(1, finca("Fundo B"));
        addFinca(2, finca("Fundo C"));
        const { fincas } = getProviderLocalData();
        expect(fincas[1].map((item) => item.nombre)).toEqual(["Fundo A", "Fundo B"]);
        expect(fincas[2].map((item) => item.nombre)).toEqual(["Fundo C"]);
    });

    it("reemplaza los datos agronómicos al guardar de nuevo", () => {
        saveDatosAgronomicos(1, agronomicos("Plan 2026"));
        saveDatosAgronomicos(1, agronomicos("Plan 2027"));
        expect(getProviderLocalData().agronomicos[1].nombre).toBe("Plan 2027");
    });

    it("entrega un estado nuevo en cada cambio, para que los componentes se actualicen", () => {
        const before = getProviderLocalData();
        addFinca(5, finca("Fundo Z"));
        expect(getProviderLocalData()).not.toBe(before);
        expect(before.fincas[5]).toBeUndefined();
    });

    it("no mezcla datos entre proveedores", () => {
        saveDatosAgronomicos(1, agronomicos("Plan 1"));
        expect(getProviderLocalData().agronomicos[2]).toBeUndefined();
    });
});
