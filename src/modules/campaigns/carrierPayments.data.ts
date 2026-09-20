/** Código de referencia del pago, solo para mostrar mientras no hay backend que lo genere */
export function generatePaymentCode() {
    return `#${Math.random().toString(36).slice(2, 10)}`;
}

export interface CarrierPayment {
    id: number;
    transportista: string;
    /** Pendiente/Realizados: el monto del pago. Adelanto: lo ya pagado como adelanto. */
    cantidad: number;
    /** Solo aplica a pagos en Adelanto: lo que todavía falta pagar */
    cantidadPendiente?: number;
    boleta: string | null;
    estado: "Pendiente" | "Adelanto" | "Realizados";
}

/** Datos de muestra mientras el módulo no consume el backend. */
export const carrierPayments: CarrierPayment[] = [
    { id: 1, transportista: "SUTRIMEX", cantidad: 987456321, boleta: "SUTRIMEX@gmail.com", estado: "Pendiente" },
    { id: 2, transportista: "FIXGROM", cantidad: 962541387, boleta: "FIXGROM@gmail.com", estado: "Pendiente" },
    { id: 3, transportista: "TRANSVAL", cantidad: 10000, cantidadPendiente: 10000, boleta: "TRANSVAL@gmail.com", estado: "Adelanto" },
    { id: 4, transportista: "CARGOMAX", cantidad: 15000, cantidadPendiente: 8000, boleta: null, estado: "Adelanto" },
    { id: 5, transportista: "LOGIPERU", cantidad: 750000, boleta: "LOGIPERU@gmail.com", estado: "Realizados" },
    { id: 6, transportista: "RUTASUR", cantidad: 320000, boleta: "RUTASUR@gmail.com", estado: "Realizados" },
];
