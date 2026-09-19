import { CalendarDays, Check, Settings } from "lucide-react";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";

/** Estados de campaña en el orden en que se muestran */
const CAMPAIGN_STATUS_TABS: SegmentedTabItem[] = [
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
    return <SegmentedTabs tabs={CAMPAIGN_STATUS_TABS} value={value} onChange={onChange} className={className} />;
}
