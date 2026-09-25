import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { getClientesNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";

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

    useEffect(() => {
        if (!open || !campaniaId) return;
        getClientesNegocioCampana(campaniaId).then(setClients);
    }, [open, campaniaId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[600px] md:max-w-3xl p-8 rounded-2xl bg-white border-none shadow-2xl gap-6">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-[22px] font-bold text-ink">
                        Gestión de Clientes
                    </DialogTitle>
                    <p className="text-[13px] font-medium text-ink-muted">{clients.length} clientes registrados</p>
                </DialogHeader>

                {/* Lista de Clientes */}
                <div className="flex flex-col gap-6 mt-2 max-h-[400px] overflow-y-auto pr-2">
                    {clients.length === 0 ? (
                        <p className="text-[13px] text-ink-muted">Esta campaña aún no tiene clientes vinculados.</p>
                    ) : (
                        clients.map((client) => (
                            <div key={client.clienteNegocioCampanaId} className="flex items-start gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center shrink-0">
                                    <span className="text-[15px] font-bold text-brand">
                                        {client.clienteNegocio?.nombreEmpresa?.charAt(0)?.toUpperCase() ?? "?"}
                                    </span>
                                </div>

                                {/* Info Principal */}
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-[14px] font-bold text-ink">{client.clienteNegocio?.nombreEmpresa ?? "-"}</h4>
                                            <p className="text-[12px] text-muted-foreground font-medium">
                                                {client.clienteNegocio ? TIPO_CLIENTE_LABEL[client.clienteNegocio.tipoCliente] ?? client.clienteNegocio.tipoCliente : "-"}
                                            </p>
                                        </div>

                                        <div className="px-3 py-1 rounded-full border border-status-highlight-border text-status-highlight bg-status-highlight-surface">
                                            <span className="text-[11px] font-bold">{client.cantidadKg} kg</span>
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="flex items-center gap-3 text-[12px] text-ink-muted font-medium mt-1">
                                        <span>{client.clienteNegocio?.nombreContacto ?? "-"}</span>
                                        <span className="text-border">·</span>
                                        <span>{client.clienteNegocio?.correoCorporativo ?? "-"}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
