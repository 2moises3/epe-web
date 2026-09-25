import { X } from "lucide-react";
import Hint from "@/shared/components/Hint";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";

interface RemovableChipProps {
    label: string;
    /** Sin `onRemove` la píldora es solo informativa (no muestra la X) */
    onRemove?: () => void;
    /** Punto verde al inicio y la X al final, en vez de la X al inicio */
    dot?: boolean;
    className?: string;
}

/** Píldora de una selección (fruta, categoría...), con botón para quitarla. Misma en todos los formularios. */
export default function RemovableChip({ label, onRemove, dot, className }: RemovableChipProps) {
    const removeButton = onRemove && (
        <Hint label="Quitar">
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Quitar ${label}`}
                className="rounded-full p-0.5 text-brand transition-colors hover:bg-brand-border"
            >
                <X size={14} strokeWidth={3} />
            </button>
        </Hint>
    );

    return (
        <Badge
            variant="brand"
            className={cn(
                "h-auto gap-2 py-1.5 text-[13px] font-semibold",
                dot ? "justify-between pl-3.5 pr-2" : onRemove ? "pl-2 pr-3" : "px-3",
                className
            )}
        >
            {dot ? (
                <>
                    <span className="flex min-w-0 items-center gap-2.5">
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
                        <span className="truncate">{label}</span>
                    </span>
                    {removeButton}
                </>
            ) : (
                <>
                    {removeButton}
                    {label}
                </>
            )}
        </Badge>
    );
}
