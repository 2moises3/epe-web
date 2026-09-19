import type { ReactNode } from "react";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import TopNavBar from "@/shared/layout/TopNavBar";

interface DashboardLayoutProps {
    children: ReactNode;
    onLogout?: () => void;
}

export default function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
    return (
        <TooltipProvider delay={300}>
            <div className="flex flex-col h-screen overflow-hidden w-full">
                <TopNavBar onLogout={onLogout} />

                <div className="flex flex-1 overflow-hidden w-full relative z-10">
                    {/* `relative` para que los fondos absolutos de cada página se anclen acá y no en un ancestro lejano */}
                    <main className="relative flex-1 overflow-y-auto bg-surface-page">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
