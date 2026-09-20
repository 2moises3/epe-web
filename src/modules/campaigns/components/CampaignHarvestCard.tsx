import { Leaf, Sprout } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { formatCampaignNumber, getHarvestProgress } from "@/modules/campaigns/campaignDetails.utils";

interface CampaignHarvestCardProps {
    harvested: number;
    estimated: number | null;
}

export default function CampaignHarvestCard({ harvested, estimated }: CampaignHarvestCardProps) {
    const { percentage, remaining } = getHarvestProgress(harvested, estimated);
    const values = [
        { label: "Cosechados", value: harvested },
        { label: "Estimados", value: estimated },
        { label: "Por cosechar", value: remaining },
    ];
    return (
        <Card className="campaign-panel campaign-harvest">
            <div className="campaign-section-heading">
                <Leaf size={24} className="campaign-section-icon" aria-hidden="true" />
                <div><h2>Avance de cosecha</h2><p>Kilos cosechados vs. estimados</p></div>
                <span className="campaign-percentage">{percentage}%</span>
            </div>
            <Progress value={percentage} aria-label="Avance de cosecha" className="campaign-progress" />
            <div className="campaign-harvest-bottom">
                <dl className="campaign-harvest-values">
                    {values.map(({ label, value }) => <div key={label}><dd>{formatCampaignNumber(value)} Kg</dd><dt>{label}</dt></div>)}
                </dl>
                <div className="campaign-harvest-note">
                    <Sprout size={25} aria-hidden="true" />
                    <div>
                        <p>{harvested === 0 ? "Aún no se ha registrado cosecha" : percentage >= 100 ? "Meta de cosecha alcanzada" : "Cada cosecha nos acerca a la meta"}</p>
                        <span>{harvested === 0 ? "La primera cosecha registrada se reflejará aquí." : estimated === null || estimated <= 0 ? "Registra una estimación para calcular el avance." : "Sigue el progreso de la producción de tu campaña."}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
