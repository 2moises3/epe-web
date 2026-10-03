export interface BreadcrumbLevel {
    label: string;
    href?: string;
}

const ROOT_ROUTES: Record<string, string> = {
    campaigns: "Campañas",
    proveedores: "Proveedores",
    "planificacion-comercial": "Planificación comercial",
    transportistas: "Transporte",
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
            : segments[2] === "carrier-payments"
                ? "Pagos a transportistas"
                : "Detalle";

        levels.push({ label: campaignSection });
    } else if (segments.length > 1) {
        levels.push({ label: "Detalle" });
    }

    return levels;
}
