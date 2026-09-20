import type { ReactNode } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number | ReactNode;
    icon: ReactNode;
    trend?: {
        value: string;
        direction: "up" | "down" | "neutral";
    };
    sparklineVariant?: "green" | "grey" | "yellow";
    onClick?: () => void;
    active?: boolean;
}

/** Mini sparkline SVG decorativa para el fondo de la card */
function Sparkline({ variant = "green" }: { variant?: "green" | "grey" | "yellow" }) {
    const config = {
        green: { 
            stroke: "var(--brand)", 
            fill: "var(--brand)",
            path: "M 0 50 C 20 50, 30 35, 50 40 C 70 45, 90 15, 120 15"
        },
        grey: { 
            stroke: "var(--status-neutral)",
            fill: "var(--status-neutral)",
            path: "M 0 50 C 40 50, 60 45, 80 45 C 100 45, 100 20, 120 20"
        },
        yellow: { 
            stroke: "var(--status-highlight)",
            fill: "var(--status-highlight)",
            path: "M 0 45 C 30 45, 50 40, 70 40 C 90 40, 100 15, 120 15"
        }
    };
    
    const c = config[variant];
    const fillPath = `${c.path} L 120 60 L 0 60 Z`;

    return (
        <svg
            className="hidden sm:block absolute bottom-0 right-0 w-[60%] h-[60%] z-0 rounded-br-2xl pointer-events-none"
            viewBox="0 0 120 60"
            preserveAspectRatio="none"
            fill="none"
        >
            <defs>
                <linearGradient id={`grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.fill} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={c.fill} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillPath} fill={`url(#grad-${variant})`} />
            <path d={c.path} stroke={c.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

export default function StatCard({ title, value, icon, trend, sparklineVariant = "green", onClick, active = false }: StatCardProps) {
    const trendColor =
        trend?.direction === "down"
            ? "text-status-warning"
            : trend?.direction === "up"
            ? "text-brand"
            : "text-ink-muted";

    const isInteractive = Boolean(onClick);

    return (
        <Card
            onClick={onClick}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-pressed={isInteractive ? active : undefined}
            onKeyDown={(event) => {
                if (!isInteractive) return;
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick?.();
                }
            }}
            className={`relative rounded-2xl border border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] h-33 sm:h-40 bg-white transition-all borderl-[-3px] outline-none ${
                isInteractive ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40" : ""
            } ${
                active
                    ? "border-l-brand shadow-[0_4px_20px_rgb(0,0,0,0.06)] ring-1 ring-brand/20"
                    : "border-l-transparent hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-l-brand"
            }`}
        >
            {/* MÓVIL: ícono y tendencia arriba, cifra y rótulo abajo. Con el rótulo
                al final, un título de dos líneas ya no empuja la cifra hacia abajo
                y todas las tarjetas alinean sus números a la misma altura. */}
            <CardContent className="sm:hidden p-3.5 flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center shrink-0 border border-brand-border/50 [&>svg]:size-4" style={{ color: "var(--brand-gradient-mid)" }}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-0.5 shrink-0 ${trendColor}`}>
                            {trend.direction === "up" ? (
                                <ArrowUpRight size={14} strokeWidth={2.5} />
                            ) : (
                                <ArrowDownRight size={14} strokeWidth={2.5} />
                            )}
                            <span className="text-[12px] font-bold leading-none">{trend.value}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto min-w-0">
                    <span className="block text-[28px] font-bold text-ink leading-none tracking-tight">
                        {value}
                    </span>
                    <span className="block text-[11.5px] font-semibold text-ink-muted leading-tight mt-1 line-clamp-2">
                        {title}
                    </span>
                </div>
            </CardContent>

            {/* ESCRITORIO: hay espacio para el ícono grande, la comparativa y la sparkline */}
            <CardContent className="hidden sm:flex p-5 pt-1 flex-col h-full relative z-10 justify-between">
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center shrink-0 border border-brand-border/50" style={{ color: "var(--brand-gradient-mid)" }}>
                        {icon}
                    </div>
                    <div className="flex flex-col pt-1 min-w-0">
                        <span className="text-[14px] font-semibold text-ink leading-snug">
                            {title}
                        </span>
                        <span className="text-[40px] font-bold text-ink leading-[1.1] tracking-tight mt-1">
                            {value}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-0.5 mt-auto">
                    {trend && (
                        <>
                            <div className={`flex items-center gap-1 ${trendColor}`}>
                                {trend.direction === "up" ? (
                                    <ArrowUpRight size={18} strokeWidth={2.5} />
                                ) : (
                                    <ArrowDownRight size={18} strokeWidth={2.5} />
                                )}
                                <span className="text-[15px] font-bold">{trend.value}</span>
                            </div>
                            <span className="text-[12px] text-ink-muted font-medium">
                                vs. campaña anterior
                            </span>
                        </>
                    )}
                </div>
            </CardContent>

            {/* Sparkline decorativa: en móvil la tarjeta es demasiado compacta y la
                curva termina cruzando la cifra y la tendencia. */}
            {trend && <Sparkline variant={sparklineVariant} />}
        </Card>
    );
}
