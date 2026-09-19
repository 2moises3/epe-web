import { Leaf } from "lucide-react";
import { campaignLandscape } from "@/modules/campaigns/campaignFruit";

export default function CampaignBrandBanner() {
    return (
        <aside className="campaign-brand-banner" aria-label="Cultivamos hoy un mañana mejor">
            <div className="campaign-brand-copy">
                <Leaf size={26} aria-hidden="true" />
                <p>“Cultivamos hoy<br />un mañana mejor”</p>
                <span>Calidad que cruza fronteras</span>
            </div>
            <img src={campaignLandscape} alt="" width={960} height={640} loading="lazy" />
        </aside>
    );
}
