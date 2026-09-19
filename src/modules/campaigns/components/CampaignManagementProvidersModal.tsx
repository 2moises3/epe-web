import { Truck, Sprout, LandPlot } from "lucide-react";
import CampaignDirectoryModal from "@/modules/campaigns/components/CampaignDirectoryModal";
import CampaignDirectoryTable, { DirectoryIdentity, DirectoryContact } from "@/modules/campaigns/components/CampaignDirectoryTable";
import { getGrowerTotals } from "@/modules/campaigns/campaignDetails.data";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";
import type { CampaignGrower } from "@/modules/campaigns/campaignDetails.data";
import type { Campaign } from "@/modules/campaigns/campaigns.data";

interface CampaignManagementProvidersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    providers: CampaignGrower[];
    campaign: Campaign;
}

export default function CampaignManagementProvidersModal({ open, onOpenChange, providers, campaign }: CampaignManagementProvidersModalProps) {
    const totals = getGrowerTotals(providers);
    return (
        <CampaignDirectoryModal open={open} onOpenChange={onOpenChange} title="Gestión de Proveedores" campaign={campaign}
            description="Productores vinculados a esta campaña." icon={Truck} empty={!providers.length}
            stats={[{ label: "Proveedores", value: providers.length, icon: Truck, hint: "vinculados" }, { label: "Hectáreas totales", value: `${formatCampaignNumber(totals.hectares)} ha`, icon: LandPlot, hint: "de cultivo" }, { label: "Variedades", value: totals.varieties, icon: Sprout, hint: "en esta campaña" }]}>
            <CampaignDirectoryTable label="proveedores" columns={["Proveedor", "Área", "Variedades", "Responsable del fundo"]}
                rows={providers.map((provider, index) => ({
                    id: provider.id, name: provider.name, category: provider.location, search: `${provider.owner} ${provider.phone} ${provider.varieties.join(" ")}`,
                    cells: [
                        <DirectoryIdentity name={provider.name} subtitle={provider.location} index={index} />,
                        <strong className="whitespace-nowrap text-ink">{formatCampaignNumber(provider.hectares)} ha</strong>,
                        <div className="flex max-w-36 flex-wrap gap-1">{provider.varieties.map(variety => <span key={variety} className="rounded-full bg-brand-surface px-2 py-1 text-[9px] text-brand-dark">{variety}</span>)}</div>,
                        <DirectoryContact name={provider.owner} value={provider.phone} href={`tel:${provider.phone.replace(/\s/g, "")}`} />,
                    ],
                }))} />
        </CampaignDirectoryModal>
    );
}
