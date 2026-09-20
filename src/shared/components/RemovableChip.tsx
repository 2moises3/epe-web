import { X } from "lucide-react";
import Hint from "@/shared/components/Hint";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";

interface RemovableChipProps {
    label: string;
    /** Sin `onRemove` la píldora es solo informativa (no muestra la X) */
    onRemove?: () => void;
    className?: string;
}

/** Píldora de una selección (fruta, categoría...), con botón para quitarla. Misma en todos los formularios. */
export default function RemovableChip({ label, onRemove, className }: RemovableChipProps) {
    return (
        <Badge
            variant="brand"
            className={cn("h-auto gap-2 py-1.5 text-[13px] font-semibold", onRemove ? "pl-2 pr-3" : "px-3", className)}
        >
            {onRemove && (
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
            )}
            {label}
        </Badge>
    );
}
