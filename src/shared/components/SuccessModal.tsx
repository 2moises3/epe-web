import type { AnimationEvent } from "react";
import { ArrowRight, Check, Leaf, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";

interface SuccessModalAction {
    label: string;
    onClick: () => void;
}

interface SuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    /** Texto de la píldora sobre el título */
    badgeLabel?: string;
    /**
     * Acción destacada opcional, ej. "Ir al listado" cuando el resultado se ve en otra pantalla.
     * Con ella aparece además "Seguir aquí", que solo cierra. Sin ella, un único "Aceptar".
     */
    primaryAction?: SuccessModalAction;
    /** Texto del botón secundario cuando hay primaryAction */
    secondaryLabel?: string;
    /**
     * Milisegundos hasta el cierre automático (la barra inferior lo muestra). Con primaryAction
     * se da más tiempo para decidir. Pasar null lo desactiva. Se pausa con el mouse encima.
     */
    autoCloseMs?: number | null;
}

/** 8 rayitas alrededor del check, cada 45° */
const DASH_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Modal de éxito genérico: banner de marca con check animado, píldora de estado, título/descripción,
 * uno o dos botones y una barra de tiempo que lo cierra sola. Cada flujo solo aporta el texto
 * y, si el resultado se ve en otra pantalla, una acción principal para ir hasta ahí.
 */
export default function SuccessModal({
    open,
    onOpenChange,
    title,
    description,
    badgeLabel = "Operación completada",
    primaryAction,
    secondaryLabel = "Seguir aquí",
    autoCloseMs,
}: SuccessModalProps) {
    const closeAfter = autoCloseMs === undefined ? (primaryAction ? 4000 : 2000) : autoCloseMs;

    const handlePrimaryClick = () => {
        onOpenChange(false);
        primaryAction?.onClick();
    };

    // animationend burbujea: solo la barra de progreso debe cerrar el modal
    const handleProgressEnd = (event: AnimationEvent<HTMLSpanElement>) => {
        if (event.animationName === "success-progress") onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="group maxw-[-calc(100%-2rem)] sm:max-w-115 p-0 rounded-2xl bg-white border-0 shadow-2xl gap-0 overflow-hidden maxh-[-90vh] flex flex-col"
            >
                {/* Banner de marca con el check animado */}
                <div
                    className="relative h-44 sm:h-48 w-full shrink-0 bg-brand-surface bg-cover bg-center"
                    style={{ backgroundImage: "url('/image/success_modal_background.webp')" }}
                >
                    <div aria-hidden className="absolute left-6 top-6 hidden sm:block">
                        <p className="w-28 text-[8.5px] font-bold uppercase leading-relaxed tracking-[0.28em] text-brand-dark/70">
                            Agricultura que conecta personas
                        </p>
                        <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand" />
                    </div>

                    <DialogClose
                        render={
                            <button
                                aria-label="Cerrar"
                                className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm backdrop-blur-sm transition-colors hover:bg-white active:scale-95"
                            />
                        }
                    >
                        <X size={18} strokeWidth={2.5} />
                    </DialogClose>

                    <div aria-hidden className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex h-40 w-40 items-center justify-center">
                            {DASH_ANGLES.map((angle, index) => (
                                <span key={angle} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                                    <span
                                        className="absolute left-1/2 top-1 -ml-0.375 h-3.5 w-0.75 rounded-full bg-brand"
                                        style={{ animation: `success-dash 0.35s ease-out ${280 + index * 35}ms both` }}
                                    />
                                </span>
                            ))}

                            <span
                                className="absolute h-26 w-26 rounded-full bg-brand/25"
                                style={{ animation: "success-ring 1.1s ease-out 0.15s both" }}
                            />
                            <div
                                className="relative flex h-26 w-26 items-center justify-center rounded-full border border-brand-border bg-brand-surface/90"
                                style={{ animation: "success-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
                            >
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-full border border-transparent text-white"
                                    style={BRAND_ACTIVE_SURFACE}
                                >
                                    <Check size={32} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center overflow-y-auto px-6 pb-7 pt-3 text-center sm:px-10 sm:pb-9">
                    <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3.5 py-1.5 text-[12.5px] font-bold text-brand">
                        <Leaf size={14} strokeWidth={2.5} />
                        {badgeLabel}
                    </span>

                    <DialogTitle className="mb-2 text-[21px] font-bold leading-tight text-ink sm:text-[24px]">
                        {title}
                    </DialogTitle>

                    <DialogDescription className="mb-7 max-w-85 text-[13.5px] font-medium leading-relaxed sm:text-[14px]">
                        {description}
                    </DialogDescription>

                    {primaryAction ? (
                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            <Button size="xl" className="justify-between sm:flex-[1.4]" onClick={handlePrimaryClick}>
                                {primaryAction.label}
                                <ArrowRight size={17} strokeWidth={2.5} />
                            </Button>
                            <Button
                                variant="outline"
                                size="xl"
                                onClick={() => onOpenChange(false)}
                                className="border-border text-ink-body hover:bg-muted hover:text-ink sm:flex-1"
                            >
                                {secondaryLabel}
                            </Button>
                        </div>
                    ) : (
                        <Button size="xl" className="min-w-40" onClick={() => onOpenChange(false)}>
                        <Check size={20} strokeWidth={2.5} /> Aceptar
                    </Button>
                    )}
                </div>

                {/* Barra de tiempo: al vaciarse cierra el modal; con el mouse encima se pausa */}
                {closeAfter !== null && (
                    <span
                        aria-hidden
                        onAnimationEnd={handleProgressEnd}
                        className="absolute inset-x-0 bottom-0 h-1 origin-left bg-brand group-hover:[animation-play-state:paused]"
                        style={{ animation: `success-progress ${closeAfter}ms linear both` }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
