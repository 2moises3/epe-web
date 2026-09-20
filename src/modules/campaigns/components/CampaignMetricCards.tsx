import { BarChart3, Box, CalendarDays, Leaf } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";

interface CampaignMetricCardsProps {
    requirement: number | null;
    estimated: number | null;
    harvested: number;
    remaining: number | null;
    hasEnded: boolean;
    hasStarted: boolean;
}

export default function CampaignMetricCards({ requirement, estimated, harvested, remaining, hasEnded, hasStarted }: CampaignMetricCardsProps) {
    const metrics = [
        { title: "Requerimiento comercial", value: requirement, unit: "Kg", description: "Según pedidos de clientes", icon: BarChart3 },
        { title: "Kilos estimados", value: estimated, unit: "Kg", description: "Producción proyectada", icon: Box },
        { title: "Kilos cosechados", value: harvested, unit: "Kg", description: "De la producción estimada", icon: Leaf },
        { title: "Días restantes", value: remaining, unit: "días", description: hasEnded ? "El periodo de campaña finalizó" : hasStarted ? "Para finalizar la campaña" : "Campaña pendiente de inicio", icon: CalendarDays, warm: true },
    ];

    return (
        <section aria-label="Indicadores de campaña" className="campaign-metrics">
            {metrics.map(({ title, value, unit, description, icon: Icon, warm }) => (
                <Card key={title} className={`campaign-panel campaign-metric ${warm ? "campaign-metric-warm" : ""}`}>
                    <span className="campaign-icon-circle"><Icon size={21} strokeWidth={2.2} aria-hidden="true" /></span>
                    <div className="min-w-0">
                        <h3>{title}</h3>
                        <p className={`campaign-metric-value ${value === null ? "is-pending" : ""}`}>{formatCampaignNumber(value)} <span>{unit}</span></p>
                        <p className="campaign-metric-description">{description}</p>
                    </div>
                </Card>
            ))}
        </section>
    );
}
