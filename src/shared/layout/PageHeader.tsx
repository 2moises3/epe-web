import type { ReactNode } from "react";

interface PageHeaderProps {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function PageHeader({ icon, title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="shrink-0 mt-0.5 sm:mt-0" style={{ color: "var(--brand-gradient-mid)" }}>{icon}</div>
                <div className="flex flex-col min-w-0">
                    <h1 className="text-[19px] sm:text-[22px] font-bold text-ink leading-tight">{title}</h1>
                    {description && (
                        <p className="text-[12.5px] sm:text-[13px] text-ink-muted font-medium">{description}</p>
                    )}
                </div>
            </div>
            {/* En móvil las acciones pasan a ancho completo, debajo del título */}
            {action && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 *:w-full sm:*:w-auto">
                    {action}
                </div>
            )}
        </div>
    );
}
