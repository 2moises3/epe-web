import { describe, expect, it, vi } from "vitest";
import { createCampaniaProveedorSubmissionController } from "@/modules/campaigns/api/campania-proveedor-submission";

const input = (proveedorId: number) => ({ campaniaId: 3, proveedorId });

describe("campaign provider submission", () => {
  it("reports success only after every create call completes", async () => {
    const create = vi.fn(async () => undefined);
    const list = vi.fn(async () => []);
    const controller = createCampaniaProveedorSubmissionController({ create, list });

    await expect(controller.submit(3, [input(1), input(2)])).resolves.toEqual({
      status: "complete",
      persistedProviderIds: [1, 2],
      pendingProviderIds: [],
    });
    expect(create).toHaveBeenCalledTimes(2);
    expect(list).not.toHaveBeenCalled();
  });

  it("reconciles partial success before returning the unsaved queue", async () => {
    const create = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("request failed"));
    const list = vi.fn(async () => [{ proveedorId: 1 }]);
    const controller = createCampaniaProveedorSubmissionController({ create, list });

    await expect(controller.submit(3, [input(1), input(2), input(3)])).resolves.toEqual({
      status: "partial",
      persistedProviderIds: [1],
      pendingProviderIds: [2, 3],
    });
    expect(create).toHaveBeenCalledTimes(2);
    expect(list).toHaveBeenCalledOnce();
  });

  it("locks uncertain outcomes until a later reconciliation succeeds", async () => {
    const create = vi.fn()
      .mockRejectedValueOnce(new Error("response lost"))
      .mockResolvedValueOnce(undefined);
    const list = vi.fn()
      .mockRejectedValueOnce(new Error("read failed"))
      .mockResolvedValueOnce([]);
    const controller = createCampaniaProveedorSubmissionController({ create, list });

    await expect(controller.submit(3, [input(1)])).resolves.toMatchObject({ status: "unresolved" });
    await expect(controller.submit(3, [input(1)])).resolves.toMatchObject({ status: "unresolved" });
    expect(create).toHaveBeenCalledOnce();

    await expect(controller.reconcile(3, [1])).resolves.toEqual({
      status: "partial",
      persistedProviderIds: [],
      pendingProviderIds: [1],
    });
    expect(list).toHaveBeenCalledTimes(2);
    await expect(controller.submit(3, [input(1)])).resolves.toMatchObject({ status: "complete" });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("treats a rejected response as complete when a read confirms every link persisted", async () => {
    const create = vi.fn().mockRejectedValue(new Error("response lost"));
    const list = vi.fn(async () => [{ proveedorId: 1 }]);
    const controller = createCampaniaProveedorSubmissionController({ create, list });

    await expect(controller.submit(3, [input(1)])).resolves.toEqual({
      status: "complete",
      persistedProviderIds: [1],
      pendingProviderIds: [],
    });
  });

  it("shares an in-flight submission instead of sending duplicate requests", async () => {
    let finishCreate!: () => void;
    const create = vi.fn(() => new Promise<void>((resolve) => { finishCreate = resolve; }));
    const list = vi.fn(async () => []);
    const controller = createCampaniaProveedorSubmissionController({ create, list });

    const first = controller.submit(3, [input(1)]);
    const duplicate = controller.submit(3, [input(1)]);
    expect(duplicate).toBe(first);
    expect(create).toHaveBeenCalledOnce();
    finishCreate();
    await expect(first).resolves.toMatchObject({ status: "complete" });
  });

  it("rejects duplicate provider IDs before issuing requests", async () => {
    const create = vi.fn(async () => undefined);
    const controller = createCampaniaProveedorSubmissionController({ create, list: vi.fn(async () => []) });

    await expect(controller.submit(3, [input(1), input(1)])).resolves.toMatchObject({
      status: "duplicate",
      pendingProviderIds: [1],
    });
    expect(create).not.toHaveBeenCalled();
  });
});
