import { useEffect, useState } from "react";
import { Users, UserCheck, ShoppingBag } from "lucide-react";
import CampaignDirectoryModal from "@/modules/campaigns/components/CampaignDirectoryModal";
import CampaignDirectoryTable, { DirectoryIdentity, DirectoryContact } from "@/modules/campaigns/components/CampaignDirectoryTable";
import StatusBadge from "@/shared/components/StatusBadge";
import { getClientesNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import { getCampana } from "@/modules/campaigns/api/campaign.api";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";

interface CampaignManagementClientsModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
}

const TIPO_CLIENTE_LABEL: Record<string, string> = {
    exportador: "Exportador",
    industria: "Industria",
};

export default function CampaignManagementClientsModal({ open, campaniaId, onOpenChange }: CampaignManagementClientsModalProps) {
    const [clients, setClients] = useState<ClienteNegocioCampana[]>([]);
    const [campaign, setCampaign] = useState<Campana | null>(null);

    useEffect(() => {
        if (!open || !campaniaId) return;
        getCampana(campaniaId).then(setCampaign);
        getClientesNegocioCampana(campaniaId).then(setClients);
    }, [open, campaniaId]);

    const active = clients.length; // Todo cliente retornado se asume activo por la API
    const orders = clients.reduce((total, client) => total + client.cantidadKg, 0);

    return (
        <CampaignDirectoryModal 
            open={open} 
            onOpenChange={onOpenChange} 
            title="Gestión de Clientes" 
            campaign={campaign}
            description="Clientes comerciales vinculados a esta campaña." 
            icon={Users} 
            empty={!clients.length}
            stats={[
                { label: "Clientes", value: clients.length, icon: Users, hint: "vinculados" }, 
                { label: "Clientes activos", value: active, icon: UserCheck, hint: `${clients.length ? Math.round(active / clients.length * 100) : 0}% del total` }, 
                { label: "Requerimientos", value: `${orders.toLocaleString()} kg`, icon: ShoppingBag, hint: "en esta campaña" }
            ]}
        >
            <CampaignDirectoryTable 
                label="clientes" 
                columns={["Cliente", "Requerimiento", "Estado", "Contacto comercial"]}
                rows={clients.map((client, index) => ({
                    id: String(client.clienteNegocioCampanaId), 
                    name: client.clienteNegocio?.nombreEmpresa ?? "-", 
                    category: client.clienteNegocio ? (TIPO_CLIENTE_LABEL[client.clienteNegocio.tipoCliente] ?? client.clienteNegocio.tipoCliente) : "-", 
                    search: `${client.clienteNegocio?.nombreContacto} ${client.clienteNegocio?.correoCorporativo}`,
                    cells: [
                        <DirectoryIdentity name={client.clienteNegocio?.nombreEmpresa ?? "-"} subtitle={client.clienteNegocio ? (TIPO_CLIENTE_LABEL[client.clienteNegocio.tipoCliente] ?? client.clienteNegocio.tipoCliente) : "-"} index={index} />,
                        <div><strong className="text-sm text-ink">{client.cantidadKg.toLocaleString()} kg</strong></div>,
                        <span className="[&_[data-slot=badge]]:px-2.5 [&_[data-slot=badge]]:py-1 [&_[data-slot=badge]]:text-[10px]"><StatusBadge status="Activo" /></span>,
                        <DirectoryContact name={client.clienteNegocio?.nombreContacto ?? "-"} value={client.clienteNegocio?.correoCorporativo ?? "-"} href={`mailto:${client.clienteNegocio?.correoCorporativo ?? ""}`} />,
                    ],
                }))} 
            />
        </CampaignDirectoryModal>
    );
}
