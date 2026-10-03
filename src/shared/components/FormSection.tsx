import type { ReactNode } from "react";

interface FormSectionProps {
    icon: ReactNode;
    title: string;
    /** Texto o acción a la derecha del título, ej. los formatos permitidos o un botón "Registrar" */
    aside?: ReactNode;
    children: ReactNode;
}

/** Bloque de un formulario largo: ícono en círculo + título (y un extra a la derecha) sobre sus campos */
export default function FormSection({ icon, title, aside, children }: FormSectionProps) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <div className="flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                        {icon}
                    </span>
                    <h3 className="text-[14.5px] font-bold text-ink">{title}</h3>
                </div>
                {/* Puede ser un texto de ayuda o una acción (botón), por eso queda visible también en móvil */}
                {aside && <div className="text-[12px] font-medium text-ink-muted">{aside}</div>}
            </div>
            {children}
        </section>
    );
}
