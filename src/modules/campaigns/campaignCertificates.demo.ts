import type { CertificadoCampanaLocal } from "@/modules/campaigns/campaignCertificate.utils";

/**
 * Datos de demostración SOLO para desarrollo: llenan la gestión de certificaciones de las primeras campañas
 * para revisar la vista con información (vigencias de todos los tipos, pagos parciales, ampliaciones, nombres
 * largos, estados vacíos). Se cargan únicamente con `import.meta.env.DEV` (ver `campaignCertificates.store.ts`).
 *
 * TODO(api): borrar este archivo cuando las certificaciones vengan del backend.
 */

/** Cuántas campañas (ids 1..N) reciben datos de demostración */
const DEMO_CAMPAIGNS = 12;

/** Suma días a hoy y devuelve yyyy-MM-dd, para que las vigencias de la demo no caduquen con el tiempo */
function dayOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function demoFile(name: string, type = "application/pdf"): File {
    const body = [
        "%PDF-1.4",
        "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
        "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
        "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 360 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj",
        "4 0 obj<</Length 66>>stream\nBT /F1 16 Tf 24 100 Td (Documento de demostracion) Tj ET\nendstream endobj",
        "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
        "trailer<</Root 1 0 R/Size 6>>",
        "%%EOF",
    ].join("\n");
    return new File([body], name, { type });
}

type Seed = Omit<CertificadoCampanaLocal, "id" | "ampliaciones" | "pagos"> & {
    ampliaciones: number[];
    pagos: number[];
};

const SEEDS: Seed[] = [
    {
        tipo: "Global GAP", nombre: "GlobalGAP Mango 2026", organismoEmisor: "SGS Perú",
        validoDesde: dayOffset(-120), validoHasta: dayOffset(240), estadoTramite: "certificado",
        moneda: "USD", costo: 2400, kilosIniciales: 12000,
        productores: [{ id: "1", nombre: "José Luis Ramos Quispe" }, { id: "2", nombre: "María Gonzales" }],
        observaciones: "Cubre los lotes de exportación a Europa.",
        documento: demoFile("globalgap-mango-2026.pdf"), cotizacion: demoFile("cotizacion-sgs.pdf"),
        ampliaciones: [3000, 1500], pagos: [1200, 1200],
    },
    {
        tipo: "Orgánico USDA", nombre: "Certificación Orgánica Uva Red Globe de Exportación", organismoEmisor: "Control Union",
        validoDesde: dayOffset(-340), validoHasta: dayOffset(18), estadoTramite: "certificado",
        moneda: "USD", costo: 3150.5, kilosIniciales: 8000,
        productores: [{ id: "1", nombre: "José Luis Ramos Quispe" }],
        observaciones: "", documento: demoFile("organico-usda.pdf"), cotizacion: null,
        ampliaciones: [], pagos: [1500],
    },
    {
        tipo: "Fairtrade", nombre: "Fairtrade Arándano", organismoEmisor: "FLOCERT",
        validoDesde: dayOffset(30), validoHasta: dayOffset(395), estadoTramite: "en tramite",
        moneda: "EUR", costo: 1800, kilosIniciales: 0,
        productores: [
            { id: "2", nombre: "María Gonzales" }, { id: "3", nombre: "María Elena Flores Vega" },
            { id: "1", nombre: "José Luis Ramos Quispe" }, { id: "4", nombre: "Pedro Castillo" },
        ],
        observaciones: "Trámite iniciado, a la espera de la auditoría.", documento: null, cotizacion: demoFile("cotizacion-flocert.pdf"),
        ampliaciones: [], pagos: [],
    },
    {
        tipo: "Rainforest Alliance", nombre: "Rainforest Palta Hass", organismoEmisor: "NSF",
        validoDesde: dayOffset(-500), validoHasta: dayOffset(-20), estadoTramite: "observado",
        moneda: "PEN", costo: 5200, kilosIniciales: 20000,
        productores: [{ id: "3", nombre: "María Elena Flores Vega" }, { id: "4", nombre: "Pedro Castillo" }],
        observaciones: "Observaciones por levantar en el plan de manejo.", documento: demoFile("rainforest-palta.pdf"), cotizacion: null,
        ampliaciones: [2500], pagos: [5200],
    },
    {
        tipo: "Orgánico UE", nombre: "Orgánico UE Mango Kent", organismoEmisor: "Ecocert",
        validoDesde: "", validoHasta: "", estadoTramite: "pendiente",
        moneda: "USD", costo: 0, kilosIniciales: 0,
        productores: [], observaciones: "", documento: null, cotizacion: null,
        ampliaciones: [], pagos: [],
    },
];

/** Cantidad de certificaciones por campaña: vacío, una sola, varias y todas */
const PER_CAMPAIGN = [3, 1, 0, 5, 2, 4];

export function createDemoCampaignCertificates(): Record<number, CertificadoCampanaLocal[]> {
    const result: Record<number, CertificadoCampanaLocal[]> = {};
    let id = 1;

    for (let campaniaId = 1; campaniaId <= DEMO_CAMPAIGNS; campaniaId++) {
        const count = PER_CAMPAIGN[(campaniaId - 1) % PER_CAMPAIGN.length];
        result[campaniaId] = Array.from({ length: count }, (_, index) => {
            const seed = SEEDS[(campaniaId + index) % SEEDS.length];
            const certificateId = id++;
            return {
                ...seed,
                id: certificateId,
                ampliaciones: seed.ampliaciones.map((kilos, order) => ({
                    id: 1000 + certificateId * 10 + order, kilos, fecha: dayOffset(-60 + order * 20), referencia: `Adenda ${order + 1}`,
                })),
                pagos: seed.pagos.map((monto, order) => ({
                    id: 5000 + certificateId * 10 + order, monto, fecha: dayOffset(-90 + order * 30),
                    referencia: `OP-${certificateId}${order}`, evidencia: order === 0 ? demoFile(`voucher-${certificateId}.pdf`) : null,
                })),
            };
        });
    }

    return result;
}
