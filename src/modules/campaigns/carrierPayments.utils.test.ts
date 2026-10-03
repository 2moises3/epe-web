import { describe, expect, it } from "vitest";
import {
    EMPTY_PAYMENT_DRAFT,
    completeAdvancePayment,
    confirmPendingPayment,
    createPayment,
    isWithinDateRange,
    validatePaymentDraft,
    type PaymentDraft,
} from "@/modules/campaigns/carrierPayments.utils";
import type { CarrierPayment } from "@/modules/campaigns/carrierPayments.data";

const draft = (overrides: Partial<PaymentDraft> = {}): PaymentDraft => ({
    ...EMPTY_PAYMENT_DRAFT,
    codigo: "#abc",
    transportista: "SUTRIMEX",
    tipo: "Completo",
    cantidad: "1500",
    fecha: "2026-10-03",
    ...overrides,
});

describe("validatePaymentDraft", () => {
    it("accepts a complete payment with carrier, amount and date", () => {
        expect(validatePaymentDraft(draft())).toEqual({});
    });

    it("requires carrier, type, amount and date", () => {
        const errors = validatePaymentDraft(EMPTY_PAYMENT_DRAFT);
        expect(Object.keys(errors).sort()).toEqual(["cantidad", "fecha", "tipo", "transportista"]);
    });

    it("rejects zero, negative and non numeric amounts", () => {
        expect(validatePaymentDraft(draft({ cantidad: "0" })).cantidad).toBeDefined();
        expect(validatePaymentDraft(draft({ cantidad: "-5" })).cantidad).toBeDefined();
        expect(validatePaymentDraft(draft({ cantidad: "abc" })).cantidad).toBeDefined();
    });

    it("requires the advance total to exceed the advance", () => {
        expect(validatePaymentDraft(draft({ tipo: "Adelanto", cantidad: "500", cantidadTotal: "" })).cantidadTotal).toBeDefined();
        expect(validatePaymentDraft(draft({ tipo: "Adelanto", cantidad: "500", cantidadTotal: "500" })).cantidadTotal).toBeDefined();
        expect(validatePaymentDraft(draft({ tipo: "Adelanto", cantidad: "500", cantidadTotal: "800" }))).toEqual({});
    });
});

describe("createPayment", () => {
    it("leaves a full payment pending until its receipt is attached", () => {
        expect(createPayment(draft(), 7)).toMatchObject({ id: 7, estado: "Pendiente", cantidad: 1500, boleta: null });
    });

    it("creates an already settled payment when it comes with a receipt", () => {
        const receipt = new File(["x"], "boleta.pdf");
        expect(createPayment(draft({ boleta: receipt }), 7)).toMatchObject({ estado: "Realizados", boleta: "boleta.pdf" });
    });

    it("records an advance with its remaining balance", () => {
        const payment = createPayment(draft({ tipo: "Adelanto", cantidad: "500", cantidadTotal: "800" }), 7);
        expect(payment).toMatchObject({ estado: "Adelanto", cantidad: 500, cantidadPendiente: 300 });
    });
});

describe("payment transitions", () => {
    const pending: CarrierPayment = { id: 1, codigo: "#a", transportista: "A", cantidad: 100, boleta: null, estado: "Pendiente", fecha: "2026-10-01" };
    const advance: CarrierPayment = { ...pending, estado: "Adelanto", cantidad: 40, cantidadPendiente: 60 };

    it("settles a pending payment with its receipt", () => {
        expect(confirmPendingPayment(pending, "boleta.pdf")).toMatchObject({ estado: "Realizados", boleta: "boleta.pdf", cantidad: 100 });
    });

    it("closes an advance by adding the balance to the paid amount", () => {
        const settled = completeAdvancePayment(advance, "saldo.pdf");
        expect(settled).toMatchObject({ estado: "Realizados", cantidad: 100, boleta: "saldo.pdf" });
        expect(settled.cantidadPendiente).toBeUndefined();
    });
});

describe("isWithinDateRange", () => {
    it("accepts everything when no range is set", () => {
        expect(isWithinDateRange("", "", "")).toBe(true);
        expect(isWithinDateRange("2026-10-01", "", "")).toBe(true);
    });

    it("applies open and closed ranges inclusively", () => {
        expect(isWithinDateRange("2026-10-01", "2026-10-01", "")).toBe(true);
        expect(isWithinDateRange("2026-09-30", "2026-10-01", "")).toBe(false);
        expect(isWithinDateRange("2026-10-05", "", "2026-10-05")).toBe(true);
        expect(isWithinDateRange("2026-10-06", "", "2026-10-05")).toBe(false);
    });

    it("excludes payments without a date once a range is set", () => {
        expect(isWithinDateRange("", "2026-10-01", "")).toBe(false);
    });
});
