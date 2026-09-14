import { CalendarDays, Check, Settings } from "lucide-react";
import StatusTabs, { type StatusTabItem } from "@/shared/components/StatusTabs";

/** Estados de campaña en el orden en que se muestran */
const CAMPAIGN_STATUS_TABS: StatusTabItem[] = [
    { id: "Planificado", label: "Planificado", icon: CalendarDays, tone: "neutral" },
    { id: "En proceso", label: "En proceso", icon: Settings, tone: "neutral" },
    { id: "Terminado", label: "Finalizado", icon: Check, tone: "brand" },
];

interface CampaignStatusTabsProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function CampaignStatusTabs({ value, onChange, className }: CampaignStatusTabsProps) {
    return <StatusTabs tabs={CAMPAIGN_STATUS_TABS} value={value} onChange={onChange} className={className} />;
}
