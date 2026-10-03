import type { CarrierPayment } from "@/modules/campaigns/carrierPayments.data";

/**
 * Reglas del registro de pagos al transportista, sin pantalla de por medio.
 *
 * TODO(api): el backend todavía no tiene pagos al transportista. La página trabaja en memoria con estas
 * funciones (los cambios se pierden al recargar); al existir el servicio, cada transición se convierte en
 * una llamada y estas validaciones pueden quedar como validación previa del formulario.
 */
export type PaymentType = "Adelanto" | "Completo";

export interface PaymentDraft {
    codigo: string;
    transportista: string;
    tipo: PaymentType | "";
    cantidad: string;
    /** Solo en adelantos: el monto total acordado, del que lo adelantado es una parte */
    cantidadTotal: string;
    fecha: string;
    boleta: File | null;
}

export type PaymentDraftErrors = Partial<Record<"transportista" | "tipo" | "cantidad" | "cantidadTotal" | "fecha", string>>;

export const EMPTY_PAYMENT_DRAFT: PaymentDraft = {
    codigo: "",
    transportista: "",
    tipo: "",
    cantidad: "",
    cantidadTotal: "",
    fecha: "",
    boleta: null,
};

const isPositiveAmount = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) > 0;

export function validatePaymentDraft(draft: PaymentDraft): PaymentDraftErrors {
    const errors: PaymentDraftErrors = {};
    if (!draft.transportista) errors.transportista = "Selecciona la empresa de transporte.";
    if (draft.tipo === "") errors.tipo = "Selecciona el tipo de pago.";
    if (!isPositiveAmount(draft.cantidad)) errors.cantidad = "Ingresa un monto mayor a 0.";
    if (draft.tipo === "Adelanto") {
        if (!isPositiveAmount(draft.cantidadTotal)) errors.cantidadTotal = "Ingresa un monto mayor a 0.";
        else if (!errors.cantidad && Number(draft.cantidadTotal) <= Number(draft.cantidad)) {
            errors.cantidadTotal = "El total debe ser mayor al adelanto.";
        }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.fecha)) errors.fecha = "Ingresa la fecha.";
    return errors;
}

/**
 * Un pago completo queda pendiente hasta que se confirme con su boleta (o nace realizado si ya la trae);
 * un adelanto registra lo pagado y deja el resto como saldo pendiente.
 */
export function createPayment(draft: PaymentDraft, id: number): CarrierPayment {
    const base = {
        id,
        codigo: draft.codigo,
        transportista: draft.transportista,
        boleta: draft.boleta?.name ?? null,
        fecha: draft.fecha,
    };
    if (draft.tipo === "Adelanto") {
        const paid = Number(draft.cantidad);
        return { ...base, estado: "Adelanto", cantidad: paid, cantidadPendiente: Number(draft.cantidadTotal) - paid };
    }
    return { ...base, estado: draft.boleta ? "Realizados" : "Pendiente", cantidad: Number(draft.cantidad) };
}

/** Confirma un pago pendiente con su boleta */
export function confirmPendingPayment(payment: CarrierPayment, receiptName: string): CarrierPayment {
    return { ...payment, estado: "Realizados", boleta: receiptName };
}

/** Cierra el saldo de un adelanto: el monto pasa a ser el total y ya no queda nada pendiente */
export function completeAdvancePayment(payment: CarrierPayment, receiptName: string): CarrierPayment {
    return {
        ...payment,
        estado: "Realizados",
        cantidad: payment.cantidad + (payment.cantidadPendiente ?? 0),
        cantidadPendiente: undefined,
        boleta: receiptName,
    };
}

/** Pagos cuya fecha cae dentro del rango (los extremos vacíos no limitan); los que no tienen fecha quedan fuera si hay rango */
export function isWithinDateRange(fecha: string, startDate: string, endDate: string): boolean {
    if (!startDate && !endDate) return true;
    if (!fecha) return false;
    return (!startDate || fecha >= startDate) && (!endDate || fecha <= endDate);
}
