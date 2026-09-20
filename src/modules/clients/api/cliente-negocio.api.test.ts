import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/api/client";
import { createClienteNegocio, deleteClienteNegocio, getClientesNegocio, updateClienteNegocio } from "@/modules/clients/api/cliente-negocio.api";

const dto = {
  clienteNegocioId: 9, nombreEmpresa: "Empresa", nombreContacto: "Contacto", telefono: "+51987654321",
  ruc: "20123456789", correoCorporativo: "contacto@empresa.pe", ubicacion: "Lima", tipoCliente: "exportador" as const,
  createdAt: "2026-09-20T00:00:00.000Z", updatedAt: "2026-09-20T00:00:00.000Z",
};

describe("cliente-negocio API", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("lee y mapea el listado", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ data: [dto] } as never);
    await expect(getClientesNegocio()).resolves.toEqual([dto]);
  });

  it("crea, actualiza y elimina usando los recursos REST del backend", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: dto } as never);
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue({ data: dto } as never);
    const del = vi.spyOn(apiClient, "delete").mockResolvedValue({} as never);
    const input = { nombreEmpresa: "Empresa", nombreContacto: "Contacto", telefono: "+51987654321", ruc: "20123456789", correoCorporativo: "contacto@empresa.pe", ubicacion: "Lima", tipoCliente: "exportador" as const };

    await expect(createClienteNegocio(input)).resolves.toEqual(dto);
    await expect(updateClienteNegocio(9, { ubicacion: "Piura" })).resolves.toEqual(dto);
    await deleteClienteNegocio(9);

    expect(post).toHaveBeenCalledWith("/clientes-negocio", input);
    expect(patch).toHaveBeenCalledWith("/clientes-negocio/9", { ubicacion: "Piura" });
    expect(del).toHaveBeenCalledWith("/clientes-negocio/9");
  });
});
