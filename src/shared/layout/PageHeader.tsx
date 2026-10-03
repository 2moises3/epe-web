import type { ReactNode } from "react";

interface PageHeaderProps {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
    const words = title.trim().split(" ");
    let highlightWord = "";
    let mainTitle = title;

    if (words.length > 1) {
        highlightWord = words.pop() || "";
        mainTitle = words.join(" ");
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
            <div className="flex flex-col min-w-0">
                <h1 className="text-2xl sm:text-[26px] lg:text-[28px] font-bold text-ink leading-tight tracking-tight">
                    {mainTitle}
                    {highlightWord && (
                        <>
                            {" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "var(--brand-gradient)" }}>
                                {highlightWord}
                            </span>
                        </>
                    )}
                </h1>
                {description && (
                    <p className="text-[13px] sm:text-[14px] text-ink-muted font-medium mt-0.5">
                        {description}
                    </p>
                )}
                <div className="flex items-center gap-1.5 mt-3">
                    <div className="h-1 w-12 sm:w-16 rounded-full" style={{ backgroundImage: "var(--brand-gradient)" }}></div>
                    <div className="flex items-center gap-1">
                        <div className="size-1 rounded-full bg-brand/60"></div>
                        <div className="size-1 rounded-full bg-brand/40"></div>
                        <div className="size-1 rounded-full bg-brand/20"></div>
                    </div>
                </div>
            </div>
            {/* En móvil las acciones pasan a ancho completo, debajo del título */}
            {action && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 *:w-full sm:*:w-auto mt-4 sm:mt-0 shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
