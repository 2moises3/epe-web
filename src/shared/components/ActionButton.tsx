import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
    label: string;
    icon: ReactNode;
    onClick?: () => void;
    className?: string;
}

/** Botón de solo ícono para las acciones de fila: `label` es a la vez el tooltip y el aria-label. */
export default function ActionButton({ label, icon, onClick, className }: ActionButtonProps) {
    return (
        <Hint label={label}>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClick}
                aria-label={label}
                className={cn("h-9 w-9 hover:text-brand hover:bg-brand-surface rounded-lg transition-colors active:scale-95", className)}
            >
                {icon}
            </Button>
        </Hint>
    );
}
