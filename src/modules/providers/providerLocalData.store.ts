import { useSyncExternalStore } from "react";
import type { Finca } from "@/modules/providers/providerFinca.utils";
import type { DatosAgronomicos } from "@/modules/providers/providerAgronomico.utils";
import type { CertificadoFormValues, CertificadoLocal } from "@/modules/providers/providerCertificado.utils";

/**
 * Datos del proveedor que todavía no tienen servicio en el backend: sus fincas, sus datos agronómicos y
 * los certificados de su vista de gestión.
 *
 * TODO(api): se guardan en memoria por id de proveedor (se pierden al recargar la página) y viven acá, y no
 * dentro de un componente, para que sobrevivan al navegar entre la lista de proveedores y la gestión de
 * fincas. Cuando existan los servicios, este es el único archivo a reemplazar: `addFinca`,
 * `saveDatosAgronomicos`, `addCertificado` y `updateCertificado` pasan a llamar a la API, y `useProviderLocalData` a leer lo que ella devuelva.
 * Los modelos y validaciones están en `providerFinca.utils.ts`, `providerAgronomico.utils.ts` y
 * `providerCertificado.utils.ts`.
 */
interface ProviderLocalData {
    fincas: Record<number, Finca[]>;
    agronomicos: Record<number, DatosAgronomicos>;
    certificados: Record<number, CertificadoLocal[]>;
}

let data: ProviderLocalData = { fincas: {}, agronomicos: {}, certificados: {} };
let nextCertificadoId = 1;
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

/** Registra un certificado al proveedor; el más reciente queda primero. */
export function addCertificado(providerId: number, values: CertificadoFormValues, documento: File) {
    const certificado: CertificadoLocal = {
        certificadoId: nextCertificadoId++,
        nombre: values.nombre.trim(),
        fechaRevisionSenasa: values.fechaRevisionSenasa,
        documento,
    };
    update({ ...data, certificados: { ...data.certificados, [providerId]: [certificado, ...(data.certificados[providerId] ?? [])] } });
}

/** Actualiza un certificado del proveedor; sin `documento` conserva el que ya tenía. */
export function updateCertificado(providerId: number, certificadoId: number, values: CertificadoFormValues, documento?: File) {
    const current = data.certificados[providerId] ?? [];
    const next = current.map((item) => item.certificadoId !== certificadoId ? item : {
        ...item,
        nombre: values.nombre.trim(),
        fechaRevisionSenasa: values.fechaRevisionSenasa,
        documento: documento ?? item.documento,
    });
    update({ ...data, certificados: { ...data.certificados, [providerId]: next } });
}

/** Deja el almacén vacío. Solo lo usan las pruebas. */
export function resetProviderLocalData() {
    nextCertificadoId = 1;
    update({ fincas: {}, agronomicos: {}, certificados: {} });
}

/** Lectura puntual del estado actual, fuera de un componente. */
export function getProviderLocalData(): ProviderLocalData {
    return data;
}

/** Fincas, datos agronómicos y certificados de todos los proveedores; el componente se vuelve a pintar cuando cambian. */
export function useProviderLocalData(): ProviderLocalData {
    return useSyncExternalStore(subscribe, getProviderLocalData);
}
