/** Código de referencia del pago, solo para mostrar mientras no hay backend que lo genere */
export function generatePaymentCode() {
    return `#${Math.random().toString(36).slice(2, 10)}`;
}

export interface CarrierPayment {
    id: number;
    /** Código de referencia que se muestra en los modales del pago */
    codigo: string;
    transportista: string;
    /** Pendiente/Realizados: el monto del pago. Adelanto: lo ya pagado como adelanto. */
    cantidad: number;
    /** Solo aplica a pagos en Adelanto: lo que todavía falta pagar */
    cantidadPendiente?: number;
    boleta: string | null;
    estado: "Pendiente" | "Adelanto" | "Realizados";
    /** Fecha acordada (o de pago final, en un adelanto) en formato AAAA-MM-DD; sirve para filtrar por fechas */
    fecha: string;
}

/**
 * Datos de muestra: estado inicial de la pantalla mientras el módulo no consume el backend.
 * TODO(api): reemplazar por la lista que devuelva el servicio de pagos al transportista.
 */
export const carrierPayments: CarrierPayment[] = [
    { id: 1, codigo: "#k3m9x2ab", transportista: "SUTRIMEX", cantidad: 987456321, boleta: "SUTRIMEX@gmail.com", estado: "Pendiente", fecha: "2026-09-12" },
    { id: 2, codigo: "#p7q1z8cd", transportista: "FIXGROM", cantidad: 962541387, boleta: "FIXGROM@gmail.com", estado: "Pendiente", fecha: "2026-09-18" },
    { id: 3, codigo: "#h4n6w5ef", transportista: "TRANSVAL", cantidad: 10000, cantidadPendiente: 10000, boleta: "TRANSVAL@gmail.com", estado: "Adelanto", fecha: "2026-09-25" },
    { id: 4, codigo: "#t2v8j1gh", transportista: "CARGOMAX", cantidad: 15000, cantidadPendiente: 8000, boleta: null, estado: "Adelanto", fecha: "2026-10-02" },
    { id: 5, codigo: "#b9d3r7ij", transportista: "LOGIPERU", cantidad: 750000, boleta: "LOGIPERU@gmail.com", estado: "Realizados", fecha: "2026-08-30" },
    { id: 6, codigo: "#c5f1y4kl", transportista: "RUTASUR", cantidad: 320000, boleta: "RUTASUR@gmail.com", estado: "Realizados", fecha: "2026-09-05" },
];
