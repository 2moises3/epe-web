import { describe, expect, it } from "vitest";
import {
  getCampaniaProveedorDraftErrors,
  toCreateCampaniaProveedorInput,
  type CampaniaProveedorDraft,
} from "@/modules/campaigns/api/campania-proveedor-form";

const producerDraft: CampaniaProveedorDraft = {
  proveedorId: 17,
  tipoProveedor: "productor",
  cantidadProveedor: "12.5",
  mtdCeratitis: "0.375",
  departamento: "Lima",
  provincia: "Huaral",
  distrito: "Chancay",
  latitud: "-11.5623456",
  longitud: "-77.2678901",
  densidadPlantacion: "320.125",
  distanciamiento: "3.5",
  frecuenciaRiego: "2",
  haTotalFinca: "8",
  haCultivo: "5",
  nombreAplicacion: "Riego por goteo",
  aplicacionesAlAno: "4",
};

describe("campaign provider form contract", () => {
  it("serializes all required finca data and the entered MTD for producers", () => {
    expect(toCreateCampaniaProveedorInput(4, producerDraft)).toEqual({
      campaniaId: 4,
      proveedorId: 17,
      tipoProveedor: "productor",
      cantidadProveedor: 12.5,
      mtdCeratitis: 0.375,
      departamento: "Lima",
      provincia: "Huaral",
      distrito: "Chancay",
      latitud: -11.5623456,
      longitud: -77.2678901,
      densidadPlantacion: 320.125,
      distanciamiento: 3.5,
      frecuenciaRiego: 2,
      haTotalFinca: 8,
      haCultivo: 5,
      nombreAplicacion: "Riego por goteo",
      aplicacionesAlAno: 4,
    });
  });

  it("does not send finca fields for acopio providers", () => {
    expect(
      toCreateCampaniaProveedorInput(4, {
        ...producerDraft,
        tipoProveedor: "acopio",
      }),
    ).toEqual({
      campaniaId: 4,
      proveedorId: 17,
      tipoProveedor: "acopio",
      cantidadProveedor: 12.5,
      mtdCeratitis: 0.375,
    });
  });

  it("reports missing, negative, out-of-range, and over-precision values", () => {
    const errors = getCampaniaProveedorDraftErrors({
      ...producerDraft,
      mtdCeratitis: "",
      cantidadProveedor: "-1",
      departamento: "",
      latitud: "91",
      longitud: "-181",
      distanciamiento: "1.1234",
      frecuenciaRiego: "1.5",
    });

    expect(errors).toMatchObject({
      cantidadProveedor: expect.any(String),
      mtdCeratitis: expect.any(String),
      departamento: expect.any(String),
      latitud: expect.any(String),
      longitud: expect.any(String),
      distanciamiento: expect.any(String),
      frecuenciaRiego: expect.any(String),
    });
  });
});
