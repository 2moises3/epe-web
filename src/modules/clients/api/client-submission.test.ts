import { describe, expect, it, vi } from "vitest";
import { createInFlightGuard } from "@/modules/clients/api/in-flight-guard";
import type { ClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.dto";
import { validateClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.validation";
import { submitValidatedClienteNegocio } from "@/modules/clients/api/client-submission";

const valid = {
  nombreEmpresa: "Exportadora Andina",
  nombreContacto: "Ana Pérez",
  telefono: "+51987654321",
  ruc: "20123456789",
  correoCorporativo: "ana@example.com",
  ubicacion: "Lima",
  tipoCliente: "exportador" as const,
};

describe("submitValidatedClienteNegocio", () => {
  it("allows a corrected retry after validation rejects the first submission", async () => {
    const guard = createInFlightGuard();
    const save = vi.fn(async (input: ClienteNegocioInput) => input);

    const invalidResult = await submitValidatedClienteNegocio(
      { ...valid, ruc: "123" }, validateClienteNegocioInput, guard, save,
    );

    expect(invalidResult.status).toBe("invalid");
    expect(guard.isInFlight).toBe(false);

    const savedResult = await submitValidatedClienteNegocio(valid, validateClienteNegocioInput, guard, save);

    expect(savedResult).toEqual({ status: "saved", value: valid });
    expect(save).toHaveBeenCalledTimes(1);
    expect(guard.isInFlight).toBe(false);
  });
});
