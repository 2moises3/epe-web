import { Users, UserCheck, ShoppingBag } from "lucide-react";
import CampaignDirectoryModal from "@/modules/campaigns/components/CampaignDirectoryModal";
import CampaignDirectoryTable, { DirectoryIdentity, DirectoryContact } from "@/modules/campaigns/components/CampaignDirectoryTable";
import StatusBadge from "@/shared/components/StatusBadge";
import type { CampaignClient } from "@/modules/campaigns/campaignDetails.data";
import type { Campaign } from "@/modules/campaigns/campaigns.data";

interface CampaignManagementClientsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clients: CampaignClient[];
    campaign: Campaign;
}

export default function CampaignManagementClientsModal({ open, onOpenChange, clients, campaign }: CampaignManagementClientsModalProps) {
    const active = clients.filter(client => client.status === "Activo").length;
    const orders = clients.reduce((total, client) => total + client.orders, 0);
    return (
        <CampaignDirectoryModal open={open} onOpenChange={onOpenChange} title="Gestión de Clientes" campaign={campaign}
            description="Clientes comerciales vinculados a esta campaña." icon={Users} empty={!clients.length}
            stats={[{ label: "Clientes", value: clients.length, icon: Users, hint: "vinculados" }, { label: "Clientes activos", value: active, icon: UserCheck, hint: `${clients.length ? Math.round(active / clients.length * 100) : 0}% del total` }, { label: "Pedidos", value: orders, icon: ShoppingBag, hint: "en esta campaña" }]}>
            <CampaignDirectoryTable label="clientes" columns={["Cliente", "Pedidos", "Estado", "Contacto comercial"]}
                rows={clients.map((client, index) => ({
                    id: client.id, name: client.name, category: client.type, search: `${client.contact} ${client.email} ${client.status}`,
                    cells: [
                        <DirectoryIdentity name={client.name} subtitle={client.type} index={index} />,
                        <div><strong className="text-sm text-ink">{client.orders}</strong><p className="mt-1 text-[10px]">pedidos</p></div>,
                        <span className="[&_[data-slot=badge]]:px-2.5 [&_[data-slot=badge]]:py-1 [&_[data-slot=badge]]:text-[10px]"><StatusBadge status={client.status} /></span>,
                        <DirectoryContact name={client.contact} value={client.email} href={`mailto:${client.email}`} />,
                    ],
                }))} />
        </CampaignDirectoryModal>
    );
}
