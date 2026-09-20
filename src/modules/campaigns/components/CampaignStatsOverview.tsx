import { useEffect, useState } from "react";
import { CalendarDays, FileCheck, ClipboardList, CalendarClock } from "lucide-react";
import { getCampanas } from "@/modules/campaigns/api/campaign.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";

const cards = [
    { title: "N° Campañas", icon: CalendarDays, count: (campaigns: Campana[]) => campaigns.length },
    { title: "Campañas Completadas", icon: FileCheck, count: (campaigns: Campana[]) => campaigns.filter((campaign) => campaign.estado === "terminado").length },
    { title: "Campañas en Proceso", icon: ClipboardList, count: (campaigns: Campana[]) => campaigns.filter((campaign) => campaign.estado === "en proceso").length },
    { title: "Campañas Programadas", icon: CalendarClock, count: (campaigns: Campana[]) => campaigns.filter((campaign) => campaign.estado === "planificacion").length },
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
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-5 lg:grid-cols-4">
            {cards.map(({ title, icon: Icon, count }) => (
                <article key={title} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand"><Icon size={22} /></div>
                    <div><p className="text-xs font-semibold text-ink-muted">{title}</p><p className="text-2xl font-extrabold text-ink">{isLoading ? "—" : count(campaigns)}</p></div>
                </article>
            ))}
        </div>
    );
}
