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
};

describe("campaign provider form contract", () => {
  it("serializes all required fields", () => {
    expect(toCreateCampaniaProveedorInput(4, producerDraft)).toEqual({
      campaniaId: 4,
      proveedorId: 17,
      tipoProveedor: "productor",
      cantidadProveedor: 12.5,
      mtdCeratitis: 0.375,
      departamento: "-",
      provincia: "-",
      distrito: "-",
      latitud: 0,
      longitud: 0,
      densidadPlantacion: 0,
      distanciamiento: 0,
      frecuenciaRiego: 0,
      haTotalFinca: 0,
      haCultivo: 0,
      nombreAplicacion: "-",
      aplicacionesAlAno: 0,
    });
  });

  it("reports missing, negative, and out-of-range values", () => {
    const errors = getCampaniaProveedorDraftErrors({
      ...producerDraft,
      mtdCeratitis: "",
      cantidadProveedor: "-1",
    });

    expect(errors).toMatchObject({
      cantidadProveedor: expect.any(String),
      mtdCeratitis: expect.any(String),
    });
  });
});

