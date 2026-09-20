import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

interface CampaignContactsCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    stats: { label: string; value: string | number; tone?: "green" | "red" }[];
    children: ReactNode;
    onViewAll: () => void;
    empty?: boolean;
}

export default function CampaignContactsCard({ title, description, icon, stats, children, onViewAll, empty }: CampaignContactsCardProps) {
    return (
        <Card className="campaign-panel campaign-contacts">
            <div className="campaign-section-heading">
                <span className="campaign-section-icon">{icon}</span>
                <div className="min-w-0 flex-1"><h2>{title}</h2><p className="truncate" title={description}>{description}</p></div>
                <Button variant="outline" size="sm" className="campaign-view-all" onClick={onViewAll} aria-label={`Ver todos los ${title.toLowerCase()}`} disabled={empty}>
                    Ver todos <ArrowRight size={13} aria-hidden="true" />
                </Button>
            </div>
            <dl className="campaign-contact-stats">
                {stats.map(({ label, value, tone }) => <div key={label}><dd className={tone ? `campaign-stat-${tone}` : undefined}>{value}</dd><dt>{label}</dt></div>)}
            </dl>
            <div className="campaign-contact-list">
                {empty ? <p className="campaign-empty">Todavía no hay {title.toLowerCase()} vinculados a esta campaña.</p> : children}
            </div>
        </Card>
    );
}
