import StatCard from "@/modules/campaigns/components/StatCard";
import { CalendarDays, FileCheck, ClipboardList, CalendarClock } from "lucide-react";



const stats = [
    {
        title: "N° Campañas",
        value: 12,
        icon: <CalendarDays size={28} strokeWidth={2} />,
        trend: { value: "+33%", direction: "up" as const },
        sparklineVariant: "green" as const,
    },
    {
        title: "Campañas Completadas",
        value: 7,
        icon: <FileCheck size={28} strokeWidth={2} />,
        trend: { value: "+40%", direction: "up" as const },
        sparklineVariant: "green" as const,
    },
    {
        title: "Campañas en Proceso",
        value: 3,
        icon: <ClipboardList size={28} strokeWidth={2} />,
        trend: { value: "+0%", direction: "down" as const },
        sparklineVariant: "grey" as const,
    },
    {
        title: "Campañas Programadas",
        value: 2,
        icon: <CalendarClock size={28} strokeWidth={2} />,
        trend: { value: "+100%", direction: "up" as const },
        sparklineVariant: "yellow" as const,
    },
];

export default function CampaignStatsOverview() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
            {stats.map((stat) => (
                <StatCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    trend={stat.trend}
                    sparklineVariant={stat.sparklineVariant}
                />
            ))}
        </div>
    );
}
