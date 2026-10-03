import { describe, expect, it } from "vitest";
import { toClienteNegocioInput, validateClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.validation";

const valid = {
  nombreEmpresa: "Exportadora Andina",
  nombreContacto: "Ana Pérez",
  telefono: "+51987654321",
  ruc: "20123456789",
  correoCorporativo: "ana@example.com",
  ubicacion: "Lima",
  tipoCliente: "exportador" as const,
};

describe("validateClienteNegocioInput", () => {
  it("accepts values matching the backend DTO", () => {
    expect(validateClienteNegocioInput(valid)).toEqual({});
  });

  it("reports field-specific errors for required and malformed DTO values", () => {
    expect(validateClienteNegocioInput({ ...valid, nombreEmpresa: "", telefono: "123", ruc: "123", correoCorporativo: "bad", tipoCliente: "" as never })).toEqual({
      nombreEmpresa: "Este campo es obligatorio.",
      telefono: "Ingresa un teléfono de 7 a 15 dígitos; puede iniciar con +.",
      ruc: "El RUC debe tener exactamente 11 dígitos.",
      correoCorporativo: "Ingresa un correo electrónico válido.",
      tipoCliente: "Selecciona un tipo de cliente válido.",
    });
  });

  it("projects an API entity into a trimmed seven-field edit payload", () => {
    const entity = {
      clienteNegocioId: 7,
      nombreEmpresa: " Exportadora Andina ",
      nombreContacto: " Ana Pérez ",
      telefono: " +51987654321 ",
      ruc: " 20123456789 ",
      correoCorporativo: " ana@example.com ",
      ubicacion: " Lima ",
      tipoCliente: "exportador" as const,
      createdAt: "2026-09-01",
      updatedAt: "2026-09-02",
    };

    expect(toClienteNegocioInput(entity)).toEqual({
      nombreEmpresa: "Exportadora Andina",
      nombreContacto: "Ana Pérez",
      telefono: "+51987654321",
      ruc: "20123456789",
      correoCorporativo: "ana@example.com",
      ubicacion: "Lima",
      tipoCliente: "exportador",
    });
  });
});
