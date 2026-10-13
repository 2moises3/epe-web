export interface BreadcrumbLevel {
    label: string;
    href?: string;
}

const ROOT_ROUTES: Record<string, string> = {
    campaigns: "Campañas",
    proveedores: "Proveedores",
    "planificacion-comercial": "Planificación comercial",
    transportistas: "Transporte",
    calidad: "Calidad",
    "logistica-despacho": "Logística y Despacho",
    "facturacion-cobros": "Facturación y Cobros",
    "liquidacion-compra": "Liquidación de Compra",
};

export function getBreadcrumbLevels(pathname: string): BreadcrumbLevel[] {
    const segments = pathname.split("/").filter(Boolean);
    const rootSegment = segments[0];
    const rootLabel = ROOT_ROUTES[rootSegment];

    if (!rootLabel) return [];

    const levels: BreadcrumbLevel[] = [
        { label: rootLabel, href: segments.length > 1 ? `/${rootSegment}` : undefined },
    ];

    if (rootSegment === "campaigns" && segments.length > 2) {
        const campaignSection = segments[2] === "providers"
            ? "Proveedores"
            : segments[2] === "clients"
                ? "Clientes"
            : segments[2] === "carrier-payments"
                ? "Pagos a transportistas"
                : segments[2] === "certifications"
                    ? "Certificaciones"
                    : "Detalle";

        levels.push({ 
            label: campaignSection,
            href: segments.length > 3 ? `/${rootSegment}/${segments[1]}/${segments[2]}` : undefined
        });

        if (segments.length > 3) {
            levels.push({
                label: segments[4] === "interviews" ? "Entrevistas" : segments[4] === "exams" ? "Exámenes" : segments[4] === "contracts" ? "Contratos" : "Detalle",
                href: segments[4] === "contracts" && segments.length > 5 ? `/${rootSegment}/${segments[1]}/${segments[2]}/${segments[3]}/contracts` : undefined,
            });
            if (segments[6] === "deliveries") levels.push({ label: "Entregas" });
        }
    } else if (rootSegment === "proveedores" && segments[2] === "fincas") {
        levels.push({ label: "Fincas" });
    } else if (rootSegment === "proveedores" && segments[2] === "certificados") {
        levels.push({ label: "Certificados" });
    } else if (segments.length > 1) {
        levels.push({ label: "Detalle" });
    }

    return levels;
}
