import type { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mb-5" style={{ color: "var(--brand-gradient-mid)" }}>
                {icon}
            </div>
            <h3 className="text-[16px] font-bold text-ink mb-1.5">{title}</h3>
            <p className="text-[13px] text-ink-muted font-medium max-w-[320px] mb-6">{description}</p>
            {action}
        </div>
    );
}
