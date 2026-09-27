import { describe, expect, it } from "vitest";
import { createProviderSubresourceOperationGate } from "@/modules/providers/api/provider-subresources.guard";

describe("provider subresource operation gate", () => {
    it("prevents a mutation while a retry/load request can still replace the current lists", () => {
        const gate = createProviderSubresourceOperationGate();

        expect(gate.beginLoad()).toBe(true);
        expect(gate.isLoading).toBe(true);
        expect(gate.beginMutation()).toBe(false);
        expect(gate.isMutating).toBe(false);

        gate.endLoad();
        expect(gate.beginMutation()).toBe(true);
        expect(gate.beginLoad()).toBe(false);
        expect(gate.isMutating).toBe(true);
        gate.endMutation();
    });
});
