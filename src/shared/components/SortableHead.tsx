import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/shared/components/ui/table";
import Hint from "@/shared/components/Hint";
import { cn } from "@/lib/utils";
import type { SortState } from "@/shared/utils/tableSort";

interface SortableHeadProps<K extends string> {
    label: string;
    sortKey: K;
    sort: SortState<K> | null;
    onToggle: (key: K) => void;
    className?: string;
}

/** Encabezado de columna que ordena la tabla al hacer clic; la flecha indica el orden activo */
export default function SortableHead<K extends string>({ label, sortKey, sort, onToggle, className }: SortableHeadProps<K>) {
    const isActive = sort?.key === sortKey;
    const Icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
    const hint = !isActive ? "Ordenar ascendente" : sort.direction === "asc" ? "Ordenar descendente" : "Quitar orden";

    return (
        <TableHead className={cn("text-ink font-semibold h-14", className)}>
            <Hint label={hint}>
                <button
                    onClick={() => onToggle(sortKey)}
                    className={cn("inline-flex items-center gap-1.5 transition-colors hover:text-brand", isActive && "text-brand")}
                >
                    {label}
                    <Icon size={14} strokeWidth={2.5} className={isActive ? "opacity-100" : "opacity-40"} />
                </button>
            </Hint>
        </TableHead>
    );
}
