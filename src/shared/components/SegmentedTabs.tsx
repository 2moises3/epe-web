import type { CSSProperties, ComponentType } from "react";
import { BRAND_ACTIVE_SURFACE, GRADIENT_BORDER_CLIP } from "@/shared/styles/brandGradients";
import { cn } from "@/lib/utils";

export interface SegmentedTabItem {
    id: string;
    label: string;
    icon: ComponentType<{ size?: number; strokeWidth?: number }>;
    /** Color del círculo del ícono cuando la opción NO está activa */
    tone?: "neutral" | "brand";
    /** Número opcional junto al texto (ej. cuántos registros hay en esa opción) */
    count?: number;
}

const INACTIVE_BADGE_TONES = {
    neutral: "bg-status-neutral-surface text-ink-muted",
    brand: "bg-brand-surface text-brand",
};

/** Track blanco con borde que se difumina de claro (arriba) a oscuro (abajo) */
const TRACK_STYLE: CSSProperties = {
    ...GRADIENT_BORDER_CLIP,
    backgroundColor: "var(--background)",
    backgroundImage:
        "linear-gradient(var(--background), var(--background)), linear-gradient(180deg, color-mix(in oklab, var(--border), white 70%), color-mix(in oklab, var(--border), var(--ink) 12%))",
    boxShadow: "0 8px 28px -12px rgb(0 0 0 / 0.12), 0 1px 2px rgb(0 0 0 / 0.04)",
};

interface SegmentedTabsProps {
    /** El ancho de cada opción se reparte solo, así que funciona con la cantidad que le pases */
    tabs: readonly SegmentedTabItem[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Control segmentado reutilizable: una píldora verde se desliza hacia la opción elegida.
 * Nació del selector de estado de Campañas, pero no está atado a "estados" — sirve para
 * cualquier set corto de opciones excluyentes (vistas, tipos, periodos, etc.).
 */
export default function SegmentedTabs({ tabs, value, onChange, className }: SegmentedTabsProps) {
    const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === value));

    return (
        <div className={cn("relative flex w-full items-center rounded-full border border-transparent p-1.5", className)} style={TRACK_STYLE}>
            {/* El ancho descuenta el padding del track (0.375rem por lado) y se reparte entre las opciones */}
            <span
                aria-hidden
                className="absolute inset-y-1.5 left-1.5 rounded-full border border-transparent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{
                    ...BRAND_ACTIVE_SURFACE,
                    width: `calc((100% - 0.75rem) / ${tabs.length})`,
                    transform: `translateX(${activeIndex * 100}%)`,
                }}
            />

            {tabs.map((tab) => {
                const isActive = tab.id === value;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        aria-pressed={isActive}
                        aria-label={tab.label}
                        className={cn(
                            "group relative z-10 flex flex-1 min-w-0 items-center justify-center gap-3 rounded-full px-2 sm:px-4 py-2.5 text-[14.5px] font-bold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-brand/30 active:scale-[0.98]",
                            isActive ? "text-white" : "text-ink-muted hover:text-ink"
                        )}
                    >
                        <span
                            className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-300",
                                isActive ? "bg-white/20 text-white ring-1 ring-white/25" : cn(INACTIVE_BADGE_TONES[tab.tone ?? "neutral"], "group-hover:scale-105")
                            )}
                        >
                            <Icon size={17} strokeWidth={2.5} />
                        </span>
                        {/* En móvil el ícono basta; el texto y el contador entran desde sm para no truncarse */}
                        <span className="hidden sm:inline truncate">{tab.label}</span>
                        {typeof tab.count === "number" && (
                            <span
                                className={cn(
                                    "hidden sm:inline-flex min-w-5.5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums transition-colors duration-300",
                                    isActive ? "bg-white/20 text-white" : "bg-status-neutral-surface"
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
