import { useEffect, useState } from "react";
import { Truck, LandPlot, Sprout } from "lucide-react";
import CampaignDirectoryModal from "@/modules/campaigns/components/CampaignDirectoryModal";
import CampaignDirectoryTable, { DirectoryIdentity, DirectoryContact } from "@/modules/campaigns/components/CampaignDirectoryTable";
import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import { getCampana } from "@/modules/campaigns/api/campaign.api";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";

interface CampaignManagementProvidersModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
}

const TIPO_LABEL: Record<string, string> = {
    productor: "Productor",
    acopio: "Acopiador",
};

export default function CampaignManagementProvidersModal({ open, campaniaId, onOpenChange }: CampaignManagementProvidersModalProps) {
    const [proveedores, setProveedores] = useState<CampaniaProveedor[]>([]);
    const [campaign, setCampaign] = useState<Campana | null>(null);

    useEffect(() => {
        if (!open || !campaniaId) return;
        getCampana(campaniaId).then(setCampaign);
        getCampaniaProveedoresByCampania(campaniaId).then(setProveedores);
    }, [open, campaniaId]);

    const hectareas = proveedores.reduce((sum, p) => sum + (Number(p.cantidadProveedor) || 0), 0);
    const uniqueVarieties = 1; // Backend doesn't support multiple varieties per provider easily yet.

    return (
        <CampaignDirectoryModal 
            open={open} 
            onOpenChange={onOpenChange} 
            title="Gestión de Proveedores" 
            campaign={campaign}
            description="Productores vinculados a esta campaña." 
            icon={Truck} 
            empty={!proveedores.length}
            stats={[
                { label: "Proveedores", value: proveedores.length, icon: Truck, hint: "vinculados" }, 
                { label: "Volumen estimado", value: `${hectareas.toLocaleString()} kg`, icon: LandPlot, hint: "en total" }, 
                { label: "Variedades", value: uniqueVarieties, icon: Sprout, hint: "en esta campaña" }
            ]}
        >
            <CampaignDirectoryTable 
                label="proveedores" 
                columns={["Proveedor", "Volumen", "Variedades", "Responsable del fundo"]}
                rows={proveedores.map((cp, index) => ({
                    id: String(cp.cxpId), 
                    name: cp.proveedor ? `${cp.proveedor.nombres} ${cp.proveedor.apellido}` : "Proveedor", 
                    category: TIPO_LABEL[cp.tipoProveedor] ?? cp.tipoProveedor, 
                    search: `${cp.proveedor?.nombres} ${cp.proveedor?.apellido} ${cp.proveedor?.telefono}`,
                    cells: [
                        <DirectoryIdentity name={cp.proveedor ? `${cp.proveedor.nombres} ${cp.proveedor.apellido}` : "Proveedor"} subtitle={TIPO_LABEL[cp.tipoProveedor] ?? cp.tipoProveedor} index={index} />,
                        <strong className="whitespace-nowrap text-ink">{cp.cantidadProveedor.toLocaleString()} kg</strong>,
                        <div className="flex max-w-36 flex-wrap gap-1"><span className="rounded-full bg-brand-surface px-2 py-1 text-[9px] text-brand-dark">Exportación</span></div>,
                        <DirectoryContact name={cp.proveedor ? `${cp.proveedor.nombres} ${cp.proveedor.apellido}` : "-"} value={cp.proveedor?.telefono ?? "-"} href={`tel:${cp.proveedor?.telefono ?? ""}`} />,
                    ],
                }))} 
            />
        </CampaignDirectoryModal>
    );
}
