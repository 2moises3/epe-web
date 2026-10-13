import type { CampaignInterviewRecord } from "@/modules/campaigns/campaignInterview.utils";
import type { InterviewValues } from "@/modules/campaigns/campaignInterview";
import { createDemoProviderData } from "@/modules/providers/providerLocalData.demo";

/**
 * Entrevistas de demostración SOLO para desarrollo: llenan el detalle y la gestión de entrevistas de los
 * productores de ejemplo para revisar cómo se ven con información (lista corta, código FYV, ubicación). Salen
 * de las fincas de demostración del propio proveedor, así que coinciden con lo que se vería al entrevistar.
 * Se cargan únicamente con `import.meta.env.DEV` (ver `campaignInterview.utils.ts`); en producción y en las
 * pruebas el almacén arranca vacío.
 *
 * TODO(api): borrar este archivo cuando las entrevistas vengan del backend.
 */

/** Relaciones campaña–productor que reciben entrevistas de muestra (ids de la base de datos de desarrollo) */
const DEMO_RELATIONS = [
    { cxpId: 1, campaignId: 1, providerId: 1, fruitPrefix: "MAN", interviews: 3 },
    { cxpId: 5, campaignId: 2, providerId: 4, fruitPrefix: "UVA", interviews: 2 },
];

const AGRONOMICS = [
    { densidadPlantacion: "400", distanciamiento: "6", frecuenciaRiego: "3", nombreAplicacion: "Caldo bordelés", aplicacionesAlAno: "4" },
    { densidadPlantacion: "625", distanciamiento: "4", frecuenciaRiego: "2", nombreAplicacion: "Azufre mojable", aplicacionesAlAno: "6" },
    { densidadPlantacion: "300", distanciamiento: "8", frecuenciaRiego: "4", nombreAplicacion: "Control biológico", aplicacionesAlAno: "3" },
];

export function createDemoInterviews(): Map<number, CampaignInterviewRecord[]> {
    const { fincas } = createDemoProviderData();
    const byRelation = new Map<number, CampaignInterviewRecord[]>();

    for (const relation of DEMO_RELATIONS) {
        const providerFincas = fincas[relation.providerId] ?? [];
        const records = providerFincas.slice(0, relation.interviews).map((finca, index): CampaignInterviewRecord => {
            const values: InterviewValues = {
                ...AGRONOMICS[index % AGRONOMICS.length],
                fincaNombre: finca.nombre,
                haTotalFinca: String(finca.haTotal),
                haCultivo: String(finca.haCultivo),
                departamento: finca.departamento,
                provincia: finca.provincia,
                distrito: finca.distrito,
                latitud: finca.latitud === null ? "" : String(finca.latitud),
                longitud: finca.longitud === null ? "" : String(finca.longitud),
            };
            return {
                id: `demo-${relation.cxpId}-${index + 1}`,
                campaignId: relation.campaignId,
                // El más reciente primero, como en el almacén real
                createdAt: new Date(Date.UTC(2026, 9, 12 - index, 15, 30)).toISOString(),
                codigoFyv: `FYV-${relation.fruitPrefix}-${String(relation.interviews - index).padStart(2, "0")}`,
                values,
            };
        });
        byRelation.set(relation.cxpId, records);
    }
    return byRelation;
}
