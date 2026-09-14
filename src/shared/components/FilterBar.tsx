import type { ReactNode } from "react";
import { CalendarDays, Eraser, Search, SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import Hint from "@/shared/components/Hint";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    children: ReactNode;
    onClear?: () => void;
    /** Deshabilita "Limpiar" cuando no hay nada aplicado, sin ocultarlo para que la fila no salte */
    canClear?: boolean;
    className?: string;
}

/**
 * Barra de filtros en una sola fila desde lg. En pantallas chicas el título y "Limpiar"
 * comparten la primera línea y los controles bajan a la segunda.
 * Todos los controles miden h-14; el padding del card (p-3) compensa para que la barra siga en 80px.
 */
export default function FilterBar({ children, onClear, canClear = true, className }: FilterBarProps) {
    return (
        <Card className={cn("rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]", className)}>
            <CardContent className="flex flex-wrap items-center gap-3 p-3 lg:flex-nowrap">
                <div className="flex shrink-0 items-center gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-brand-border bg-brand-surface text-brand">
                        <SlidersHorizontal size={20} strokeWidth={2.5} />
                    </span>
                    <span className="text-[14.5px] font-bold text-ink">Filtros</span>
                    {/* Separa el título de los controles cuando todo va en una sola fila */}
                    <span aria-hidden className="hidden h-8 w-px bg-border lg:block" />
                </div>

                <div className="order-last grid w-full grid-cols-2 gap-3 sm:flex lg:order-none lg:w-auto lg:min-w-0 lg:flex-1">
                    {children}
                </div>

                {onClear && (
                    <Button
                        variant="outline"
                        onClick={onClear}
                        disabled={!canClear}
                        // Con algo aplicado toma el mismo verde activo del selector de estados, invitando a limpiar
                        style={canClear ? BRAND_ACTIVE_SURFACE : undefined}
                        className={cn(
                            "ml-auto h-14 gap-2 rounded-xl px-5 text-[14px] font-semibold shadow-none transition-[color,filter] active:scale-95 lg:ml-0",
                            canClear
                                ? "border-transparent text-white hover:bg-transparent hover:text-white hover:brightness-105"
                                : "border-border text-ink-muted"
                        )}
                    >
                        <Eraser size={17} strokeWidth={2.5} />
                        Limpiar
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

interface FilterSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/** Buscador de la barra: ocupa el espacio que dejan libre los demás campos y trae su propio botón para borrar */
export function FilterSearch({ value, onChange, placeholder = "Buscar..." }: FilterSearchProps) {
    return (
        <div className="relative col-span-2 min-w-0 sm:flex-1">
            <Search
                className={cn("pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors", value ? "text-brand" : "text-muted-foreground")}
                size={19}
                strokeWidth={2}
            />
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={cn(
                    "h-14 rounded-xl bg-white pl-11 pr-12 text-[14.5px] shadow-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/30",
                    value ? "border-brand/60" : "border-border"
                )}
            />
            {value && (
                <Hint label="Borrar búsqueda">
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        aria-label="Borrar búsqueda"
                        className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-brand transition-colors hover:bg-brand-surface active:scale-95"
                    >
                        <X size={17} strokeWidth={2.5} />
                    </button>
                </Hint>
            )}
        </div>
    );
}

interface FilterDateFieldProps {
    label: string;
    value?: string;
    onChange?: (value: string) => void;
}

/**
 * Fecha con la etiqueta dentro del recuadro (solo para barras de filtro; en formularios la etiqueta va afuera).
 * Desde sm el ancho es el de su contenido; en móvil llena su celda. El DatePicker es el propio recuadro,
 * así cualquier clic abre el calendario.
 */
export function FilterDateField({ label, value, onChange }: FilterDateFieldProps) {
    return (
        <div
            className={cn(
                // min-w-38 = ancho de "dd/mm/aaaa": evita que el campo crezca al elegir fecha y empuje al buscador
                "relative flex h-14 min-w-0 rounded-xl border bg-white transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 sm:min-w-38 sm:shrink-0",
                value ? "border-brand/60" : "border-border hover:border-brand-border"
            )}
        >
            <CalendarDays
                className={cn("pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors", value ? "text-brand" : "text-ink-muted")}
                size={19}
                strokeWidth={2}
            />
            <span className="pointer-events-none absolute left-11 top-2.5 text-[11.5px] font-semibold leading-none text-ink-muted">{label}</span>
            <DatePicker
                value={value}
                onChange={onChange}
                placeholder="--/--/----"
                className="h-full w-full items-end rounded-xl border-0 bg-transparent pb-2.5 pl-11 pr-5 text-[14px] font-semibold text-ink-body hover:bg-transparent aria-expanded:bg-transparent focus-visible:border-0 focus-visible:ring-0 sm:w-auto [&>svg]:hidden"
            />
        </div>
    );
}
