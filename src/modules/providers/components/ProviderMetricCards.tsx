import type { LucideIcon } from "lucide-react";
import { LandPlot, Leaf, Ruler, ShieldCheck } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/lib/utils";

const number = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 });

interface ProviderMetricCardsProps {
    fincas: number;
    totalHectares: number;
    cultivatedHectares: number;
    certificates: number;
}

interface Metric {
    title: string;
    value: string;
    unit: string;
    description: string;
    icon: LucideIcon;
    /** Tono cálido para el indicador que pide atención (documentación) */
    warm?: boolean;
}

/** Cuatro cifras del proveedor, en la misma grilla de 2×2 que los indicadores de campaña. */
export default function ProviderMetricCards({ fincas, totalHectares, cultivatedHectares, certificates }: ProviderMetricCardsProps) {
    const cultivatedShare = totalHectares > 0 ? Math.round((cultivatedHectares / totalHectares) * 100) : 0;

    const metrics: Metric[] = [
        { title: "Fincas registradas", value: String(fincas), unit: fincas === 1 ? "finca" : "fincas", description: "Lugares de cultivo del proveedor", icon: LandPlot },
        { title: "Hectáreas totales", value: number.format(totalHectares), unit: "ha", description: "Suma de todas sus fincas", icon: Ruler },
        { title: "Hectáreas de cultivo", value: number.format(cultivatedHectares), unit: "ha", description: totalHectares > 0 ? `${cultivatedShare}% del total registrado` : "Aún sin fincas registradas", icon: Leaf },
        { title: "Certificados", value: String(certificates), unit: certificates === 1 ? "documento" : "documentos", description: "Certificados propios del proveedor", icon: ShieldCheck, warm: true },
    ];

    return (
        <section aria-label="Indicadores del proveedor" className="grid grid-cols-2 gap-3">
            {metrics.map(({ title, value, unit, description, icon: Icon, warm }) => (
                <Card
                    key={title}
                    className={cn(
                        "flex-row items-start gap-3 rounded-2xl border-0 px-4 py-5 ring-1 ring-border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
                        warm && "bg-linear-to-br from-card to-status-highlight-surface",
                    )}
                >
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", warm ? "bg-status-highlight-surface text-status-highlight" : "bg-brand-surface text-brand")}>
                        <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-[11px] font-bold leading-snug text-ink-body">{title}</h3>
                        <p className="mt-1 text-[24px] font-extrabold leading-tight tracking-tight tabular-nums text-ink">
                            {value} <span className="text-[14px] font-bold text-ink-muted">{unit}</span>
                        </p>
                        <p className="mt-1 text-[11px] leading-snug text-ink-muted">{description}</p>
                    </div>
                </Card>
            ))}
        </section>
    );
}
