import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
}

export default function TablePagination({ page, pageCount, onPageChange }: TablePaginationProps) {
    if (pageCount <= 1) return null;

    return (
        <div className="flex items-center justify-end gap-1.5">
            <Hint label="Página anterior">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Página anterior"
                    className="h-9 w-9 rounded-lg border-border text-ink-muted hover:text-brand hover:border-brand disabled:opacity-40 transition-colors active:scale-95"
                >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                </Button>
            </Hint>

            {Array.from({ length: pageCount }).map((_, index) => {
                const target = index + 1;
                const isActive = target === page;
                return (
                    <Button
                        key={target}
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(target)}
                        aria-current={isActive ? "page" : undefined}
                        style={isActive ? BRAND_ACTIVE_SURFACE : undefined}
                        className={cn(
                            "h-9 w-9 rounded-lg font-bold transition-[color,filter] active:scale-95",
                            isActive ? "border-transparent text-white hover:text-white hover:brightness-105" : "border-border hover:text-brand hover:border-brand"
                        )}
                    >
                        {target}
                    </Button>
                );
            })}

            <Hint label="Página siguiente">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page === pageCount}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Página siguiente"
                    className="h-9 w-9 rounded-lg border-border text-ink-muted hover:text-brand hover:border-brand disabled:opacity-40 transition-colors active:scale-95"
                >
                    <ChevronRight size={18} strokeWidth={2.5} />
                </Button>
            </Hint>
        </div>
    );
}
