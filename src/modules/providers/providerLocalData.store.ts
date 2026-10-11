import { useSyncExternalStore } from "react";
import type { Finca } from "@/modules/providers/providerFinca.utils";
import type { DatosAgronomicos } from "@/modules/providers/providerAgronomico.utils";

/**
 * Datos del proveedor que todavía no tienen servicio en el backend: sus fincas y sus datos agronómicos.
 *
 * TODO(api): se guardan en memoria por id de proveedor (se pierden al recargar la página) y viven acá, y no
 * dentro de un componente, para que sobrevivan al navegar entre la lista de proveedores y la gestión de
 * fincas. Cuando existan los servicios, este es el único archivo a reemplazar: `addFinca` y
 * `saveDatosAgronomicos` pasan a llamar a la API, y `useProviderLocalData` a leer lo que ella devuelva.
 * Los modelos y validaciones están en `providerFinca.utils.ts` y `providerAgronomico.utils.ts`.
 */
interface ProviderLocalData {
    fincas: Record<number, Finca[]>;
    agronomicos: Record<number, DatosAgronomicos>;
}

let data: ProviderLocalData = { fincas: {}, agronomicos: {} };
const listeners = new Set<() => void>();

function update(next: ProviderLocalData) {
    data = next;
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Agrega una finca al proveedor, al final de su lista. */
export function addFinca(providerId: number, finca: Finca) {
    update({ ...data, fincas: { ...data.fincas, [providerId]: [...(data.fincas[providerId] ?? []), finca] } });
}

/** Guarda los datos agronómicos del proveedor: reemplaza los anteriores, si los había. */
export function saveDatosAgronomicos(providerId: number, datos: DatosAgronomicos) {
    update({ ...data, agronomicos: { ...data.agronomicos, [providerId]: datos } });
}

/** Deja el almacén vacío. Solo lo usan las pruebas. */
export function resetProviderLocalData() {
    update({ fincas: {}, agronomicos: {} });
}

/** Lectura puntual del estado actual, fuera de un componente. */
export function getProviderLocalData(): ProviderLocalData {
    return data;
}

/** Fincas y datos agronómicos de todos los proveedores; el componente se vuelve a pintar cuando cambian. */
export function useProviderLocalData(): ProviderLocalData {
    return useSyncExternalStore(subscribe, getProviderLocalData);
}
