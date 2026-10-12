export interface CampaignContractDeliveryValues {
    fecha: string;
    kilosProgramados: string;
    destino: string;
    observaciones: string;
}

export type CampaignContractDeliveryErrors = Partial<Record<keyof CampaignContractDeliveryValues, string>>;

export interface CampaignContractDeliveryLocal {
    id: number;
    fecha: string;
    kilosProgramados: number;
    destino: string;
    observaciones: string;
}

export const EMPTY_CONTRACT_DELIVERY: CampaignContractDeliveryValues = {
    fecha: "",
    kilosProgramados: "",
    destino: "",
    observaciones: "",
};

export function validateContractDelivery(values: CampaignContractDeliveryValues): CampaignContractDeliveryErrors {
    const errors: CampaignContractDeliveryErrors = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fecha)) errors.fecha = "Selecciona una fecha válida.";
    const kilos = Number(values.kilosProgramados);
    if (!values.kilosProgramados.trim() || !Number.isFinite(kilos) || kilos <= 0) errors.kilosProgramados = "Ingresa una cantidad mayor que cero.";
    if (!values.destino.trim()) errors.destino = "Ingresa el destino de la entrega.";
    return errors;
}

export function deliveryToValues(delivery: CampaignContractDeliveryLocal): CampaignContractDeliveryValues {
    return {
        fecha: delivery.fecha,
        kilosProgramados: String(delivery.kilosProgramados),
        destino: delivery.destino,
        observaciones: delivery.observaciones,
    };
}

