import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Leaf, Sprout } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { campaigns } from "@/modules/campaigns/campaigns.data";
import { getCampaignDetails } from "@/modules/campaigns/campaignDetails.data";
import { getCampaignTiming } from "@/modules/campaigns/campaignDetails.utils";
import CampaignOverviewCard from "@/modules/campaigns/components/CampaignOverviewCard";
import CampaignMetricCards from "@/modules/campaigns/components/CampaignMetricCards";
import CampaignHarvestCard from "@/modules/campaigns/components/CampaignHarvestCard";
import CampaignProvidersSummary from "@/modules/campaigns/components/CampaignProvidersSummary";
import CampaignClientsSummary from "@/modules/campaigns/components/CampaignClientsSummary";
import CampaignCertificationsList from "@/modules/campaigns/components/CampaignCertificationsList";
import CampaignBrandBanner from "@/modules/campaigns/components/CampaignBrandBanner";
import CampaignManagementProvidersModal from "@/modules/campaigns/components/CampaignManagementProvidersModal";
import CampaignManagementClientsModal from "@/modules/campaigns/components/CampaignManagementClientsModal";
import "@/modules/campaigns/campaignDetails.css";

export default function CampaignDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const campaign = campaigns.find((item) => String(item.id) === id);

    if (!campaign) {
        return (
            <div className="flex minh-[-60vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <Sprout size={44} className="text-brand" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-ink">Campaña no encontrada</h1>
                <p className="text-ink-muted">La campaña que buscas no está disponible.</p>
                <Button nativeButton={false} render={<Link to="/campaigns" />}><ArrowLeft />Volver a campañas</Button>
            </div>
        );
    }

    // Reset local disclosures and dialogs when navigating between campaign IDs.
    return <CampaignDetailsView key={campaign.id} campaign={campaign} />;
}

function CampaignDetailsView({ campaign }: { campaign: (typeof campaigns)[number] }) {
    const [openModal, setOpenModal] = useState<"providers" | "clients" | null>(null);
    const details = getCampaignDetails(campaign.id);
    const timing = getCampaignTiming(campaign.inicio, campaign.fin);
    const requirement = campaign.kilos.trim() ? Number(campaign.kilos) : null;

    return (
        <div className="campaign-details px-4 py-5 sm:px-8 lg:px-14">
            <div className="campaign-details-inner">
                <header className="campaign-page-heading">
                    <div><h1>Detalle de Campaña</h1><p>Control y seguimiento integral de la campaña</p></div>
                    <div className="campaign-heading-signature" aria-hidden="true">
                        <span>Del campo al mundo <Leaf size={26} /></span>
                        <div /><p>Productos que conectan personas</p>
                    </div>
                </header>
                <div className="campaign-top-grid">
                    <CampaignOverviewCard campaign={campaign} duration={timing.duration} />
                    <CampaignMetricCards requirement={requirement !== null && Number.isFinite(requirement) ? requirement : null} estimated={details.estimated} harvested={details.harvested} remaining={timing.remaining} hasEnded={timing.hasEnded} hasStarted={timing.hasStarted} />
                </div>
                <div className="campaign-bottom-grid">
                    <div className="campaign-main-column">
                        <CampaignHarvestCard harvested={details.harvested} estimated={details.estimated} />
                        <div className="campaign-contacts-grid">
                            <CampaignProvidersSummary providers={details.providers} campaignName={campaign.nombre} onViewAll={() => setOpenModal("providers")} />
                            <CampaignClientsSummary clients={details.clients} campaignName={campaign.nombre} onViewAll={() => setOpenModal("clients")} />
                        </div>
                    </div>
                    <div className="campaign-side-column">
                        <CampaignCertificationsList certifications={details.certifications} />
                        <CampaignBrandBanner />
                    </div>
                </div>
                <CampaignManagementProvidersModal open={openModal === "providers"} onOpenChange={(open) => setOpenModal(open ? "providers" : null)} providers={details.providers} campaign={campaign} />
                <CampaignManagementClientsModal open={openModal === "clients"} onOpenChange={(open) => setOpenModal(open ? "clients" : null)} clients={details.clients} campaign={campaign} />
            </div>
        </div>
    );
}
