import { useSyncExternalStore } from "react";
import type { CampaignContractDeliveryLocal, CampaignContractDeliveryValues } from "@/modules/campaigns/campaignContractDelivery.utils";

/** TODO(api): reemplazar este almacén en memoria por el servicio de entregas por contrato. */
let records: Record<string, CampaignContractDeliveryLocal[]> = {};
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: CampaignContractDeliveryLocal[] = [];

const keyOf = (campaniaId: number, relationId: number, contractId: number) => `${campaniaId}:${relationId}:${contractId}`;
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };

export function useCampaignContractDeliveries(campaniaId: number, relationId: number, contractId: number) {
    const key = keyOf(campaniaId, relationId, contractId);
    return useSyncExternalStore(subscribe, () => records[key] ?? EMPTY);
}

export function addCampaignContractDelivery(campaniaId: number, relationId: number, contractId: number, values: CampaignContractDeliveryValues) {
    const key = keyOf(campaniaId, relationId, contractId);
    const delivery: CampaignContractDeliveryLocal = {
        id: nextId++,
        fecha: values.fecha,
        kilosProgramados: Number(values.kilosProgramados),
        destino: values.destino.trim(),
        observaciones: values.observaciones.trim(),
    };
    records = { ...records, [key]: [delivery, ...(records[key] ?? EMPTY)] };
    emit();
}

export function updateCampaignContractDelivery(campaniaId: number, relationId: number, contractId: number, deliveryId: number, values: CampaignContractDeliveryValues) {
    const key = keyOf(campaniaId, relationId, contractId);
    records = { ...records, [key]: (records[key] ?? EMPTY).map((item) => item.id === deliveryId ? {
        ...item,
        fecha: values.fecha,
        kilosProgramados: Number(values.kilosProgramados),
        destino: values.destino.trim(),
        observaciones: values.observaciones.trim(),
    } : item) };
    emit();
}

export function deleteCampaignContractDelivery(campaniaId: number, relationId: number, contractId: number, deliveryId: number) {
    const key = keyOf(campaniaId, relationId, contractId);
    records = { ...records, [key]: (records[key] ?? EMPTY).filter((item) => item.id !== deliveryId) };
    emit();
}

export function resetCampaignContractDeliveries() {
    records = {};
    nextId = 1;
    emit();
}
