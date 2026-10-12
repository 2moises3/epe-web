import { Leaf, Sprout } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import StatusBadge from "@/shared/components/StatusBadge";
import type { ProduccionProveedor } from "@/modules/providers/providerProduccion.utils";

interface ProviderProductionCardProps {
    /** Sin él, la tarjeta muestra que el proveedor no tiene información productiva registrada */
    produccion?: ProduccionProveedor;
}

/** Información productiva del proveedor: su estado de sanidad agraria y las frutas con sus variedades. */
export default function ProviderProductionCard({ produccion }: ProviderProductionCardProps) {
    const frutas = produccion?.frutas ?? [];

    return (
        <Card className="gap-0 rounded-2xl border-0 p-0 ring-1 ring-border">
            <div className="flex items-center gap-3 px-5 pt-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand">
                    <Sprout size={22} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-bold leading-tight text-ink">Información productiva</h2>
                    <p className="truncate text-[12px] text-ink-muted">Sanidad agraria, frutas y variedades</p>
                </div>
                <StatusBadge status={produccion?.estadoSanidad ?? "Sin registrar"} />
            </div>

            <div className="flex flex-col gap-3 px-5 pb-5 pt-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Frutas y variedades</h3>
                {frutas.length ? (
                    <ul className="flex flex-col gap-3">
                        {frutas.map((fruta) => (
                            <li key={fruta.nombre} className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink">
                                    <Leaf size={14} className="text-brand" aria-hidden="true" />
                                    {fruta.nombre}
                                </span>
                                <span className="flex flex-wrap gap-1.5 pl-5">
                                    {fruta.variedades.length ? fruta.variedades.map((variedad) => (
                                        <span key={variedad} className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[11px] font-semibold text-brand">{variedad}</span>
                                    )) : <span className="text-[12px] text-ink-muted">Sin variedades registradas</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-[13px] leading-relaxed text-ink-muted">Este proveedor todavía no tiene frutas registradas.</p>
                )}
            </div>
        </Card>
    );
}
