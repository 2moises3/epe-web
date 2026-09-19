import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { brandShade } from "@/shared/styles/brandGradients";

interface AppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    /** Botones de acción, siempre abajo a la derecha (a la izquierda en móvil, apilados). Omitir si el modal no tiene acciones. */
    footer?: ReactNode;
    className?: string;
}

/** Shared shell only: each module owns its content; the footer (if any) always sits bottom-right, pinned outside the scroll area. */
export default function AppModal({ open, onOpenChange, title, description, children, footer, className }: AppModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                showCloseButton={false} 
                className={cn("flex maxh-[-90dvh] flex-col gap-0 overflow-hidden rounded-3xl border border-brand-border/50 bg-white p-0 sm:max-w-xl motion-reduce:animate-none", className)}
                style={{ 
                    boxShadow: `0 20px 40px -10px ${brandShade("+ 0.08", "1.3", "0.25")}, 0 0 30px -5px ${brandShade("+ 0.1", "1.3", "0.2")}`
                }}
            >
                <DialogHeader className="relative shrink-0 gap-1 px-5 pb-4 pt-6 pr-14 sm:px-6 sm:pr-16">
                    <DialogTitle className="relative w-fit bg-clip-text text-xl font-bold leading-snug tracking-tight text-transparent forced-colors:text-ink" style={{ backgroundImage: "var(--brand-gradient)" }}>{title}</DialogTitle>
                    {description && <DialogDescription className="relative text-xs leading-relaxed text-ink-body">{description}</DialogDescription>}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <DialogClose render={<Button variant="ghost" size="icon" />} className="rounded-full hover:bg-brand-surface hover:text-brand active:translate-y-0" aria-label="Cerrar">
                            <X size={18} className="transition-transform duration-200 ease-out group-hover/button:rotate-90 group-hover/button:scale-110 group-active/button:scale-90 motion-reduce:transition-none motion-reduce:transform-none" />
                        </DialogClose>
                    </span>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6">
                    {children}
                </div>
                {footer && (
                    <div className="flex shrink-0 flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 [&>button]:w-full sm:[&>button]:w-auto">
                        {footer}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
