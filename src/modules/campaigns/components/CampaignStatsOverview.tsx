import { useEffect, useState } from "react";
import StatCard from "@/modules/campaigns/components/StatCard";
import { CalendarDays, FileCheck, ClipboardList, CalendarClock } from "lucide-react";
import { getCampanas } from "@/modules/campaigns/api/campaign.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";

const cards = [
    { 
        title: "N° Campañas", 
        icon: <CalendarDays size={28} strokeWidth={2} />, 
        count: (campaigns: Campana[]) => campaigns.length,
        trend: { value: "+33%", direction: "up" as const },
        sparklineVariant: "green" as const
    },
    { 
        title: "Campañas Completadas", 
        icon: <FileCheck size={28} strokeWidth={2} />, 
        count: (campaigns: Campana[]) => campaigns.filter((c) => c.estado === "terminado").length,
        trend: { value: "+40%", direction: "up" as const },
        sparklineVariant: "green" as const
    },
    { 
        title: "Campañas en Proceso", 
        icon: <ClipboardList size={28} strokeWidth={2} />, 
        count: (campaigns: Campana[]) => campaigns.filter((c) => c.estado === "en proceso").length,
        trend: { value: "+0%", direction: "down" as const },
        sparklineVariant: "grey" as const
    },
    { 
        title: "Campañas Programadas", 
        icon: <CalendarClock size={28} strokeWidth={2} />, 
        count: (campaigns: Campana[]) => campaigns.filter((c) => c.estado === "planificacion").length,
        trend: { value: "+100%", direction: "up" as const },
        sparklineVariant: "yellow" as const
    },
];

export default function CampaignStatsOverview() {
    const [campaigns, setCampaigns] = useState<Campana[]>([]);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        void getCampanas().then(setCampaigns).catch(() => setError(true)).finally(() => setIsLoading(false));
    }, []);

    if (error) return <p role="status" className="mb-6 rounded-xl border border-border bg-white p-4 text-sm text-ink-muted">No se pudieron cargar los indicadores de campañas.</p>;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
            {cards.map((stat) => (
                <StatCard
                    key={stat.title}
                    title={stat.title}
                    value={isLoading ? 0 : stat.count(campaigns)}
                    icon={stat.icon}
                    trend={stat.trend}
                    sparklineVariant={stat.sparklineVariant}
                />
            ))}
        </div>
    );
}
