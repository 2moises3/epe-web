import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoFieldProps {
    label: string;
    value: ReactNode;
    /** Unidad pegada al borde derecho, ej. "m", "ha", "/año" */
    suffix?: string;
    className?: string;
}

/**
 * Campo de solo lectura: etiqueta + valor en una caja. Para vistas de "ver detalles" que no son
 * formularios — nada de `<Input readOnly>` fingiendo ser un campo editable.
 */
export function InfoField({ label, value, suffix, className }: InfoFieldProps) {
    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <label className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{label}</label>
            <div className="relative flex h-10 items-center rounded-lg border border-border/60 bg-card px-3 text-[13px] font-medium text-ink">
                <span className="truncate">{value}</span>
                {suffix && <span className="absolute right-3 text-xs font-bold text-ink-muted">{suffix}</span>}
            </div>
        </div>
    );
}

interface SummaryBarItem {
    label: string;
    value: ReactNode;
    /** Resalta la cifra que importa (p. ej. el saldo pendiente): "brand" en verde, "highlight" en ámbar */
    tone?: "brand" | "highlight";
}

interface SummaryBarProps {
    items: SummaryBarItem[];
    className?: string;
}

/**
 * Resumen de contexto de un modal ("costo · pagado · saldo"): una sola franja informativa con las cifras
 * separadas por líneas. A propósito no usa cajas de campo, para que no se confunda con algo que se llena;
 * para valores de solo lectura dentro de un formulario o detalle está `InfoField`.
 */
export function SummaryBar({ items, className }: SummaryBarProps) {
    return (
        <dl className={cn("grid divide-x divide-border/70 rounded-xl border border-brand-border/60 bg-brand-surface/40 py-3", className)} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
            {items.map(({ label, value, tone }) => (
                <div key={label} className="flex min-w-0 flex-col items-center gap-0.5 px-2 text-center">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{label}</dt>
                    <dd className={cn("max-w-full truncate text-[15px] font-bold tabular-nums", tone === "brand" ? "text-brand" : tone === "highlight" ? "text-status-highlight" : "text-ink")}>{value}</dd>
                </div>
            ))}
        </dl>
    );
}

interface InfoSectionProps {
    icon: LucideIcon;
    title: string;
    children: ReactNode;
    className?: string;
}

/** Encabezado de sección (ícono + título en mayúsculas) para agrupar varios InfoField relacionados */
export function InfoSection({ icon: Icon, title, children, className }: InfoSectionProps) {
    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div className="flex items-center gap-2 text-brand">
                <Icon size={18} strokeWidth={2.5} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand">{title}</h3>
            </div>
            {children}
        </div>
    );
}

interface StatTileProps {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    /** Aclaración chica debajo del valor, ej. "de 245 ha en la finca" */
    hint?: string;
    className?: string;
}

/**
 * Cifra destacada con ícono, para el dato que sí vale la pena que salte a la vista
 * (en vez de otra caja igual a las demás en una grilla uniforme).
 */
export function StatTile({ icon: Icon, label, value, hint, className }: StatTileProps) {
    return (
        <div className={cn("flex items-start gap-3 rounded-xl border border-border/60 bg-card px-3 py-3", className)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                <Icon size={17} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase leading-snug tracking-wide text-ink-muted">{label}</p>
                <p className="truncate text-[18px] font-bold leading-tight text-ink">{value}</p>
                {hint && <p className="text-[11px] leading-snug text-ink-muted">{hint}</p>}
            </div>
        </div>
    );
}

interface LocationTrailProps {
    parts: string[];
    className?: string;
}

/** Departamento › Provincia › Distrito en una sola línea, en vez de tres cajas idénticas */
export function LocationTrail({ parts, className }: LocationTrailProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-1.5 text-[13.5px] font-semibold text-ink", className)}>
            {parts.map((part, index) => (
                <span key={part} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-ink-muted/50">›</span>}
                    {part}
                </span>
            ))}
        </div>
    );
}
