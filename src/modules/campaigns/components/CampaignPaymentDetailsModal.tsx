import AppModal from "@/shared/components/AppModal";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { InfoField } from "@/shared/components/InfoField";
import StatusBadge from "@/shared/components/StatusBadge";
import type { CarrierPayment } from "@/modules/campaigns/carrierPayments.data";

interface CampaignPaymentDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: CarrierPayment | null;
}

export default function CampaignPaymentDetailsModal({ open, onOpenChange, payment }: CampaignPaymentDetailsModalProps) {
    if (!payment) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Detalles del Pago"
            description="Visualizando la información registrada del pago."
            className="sm:max-w-130"
            footer={
                <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cerrar
                    </Button>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <InfoField label="Transportista" value={payment.transportista} className="sm:col-span-2" />

                <InfoField
                    label={payment.estado === "Adelanto" ? "Adelantado" : "Cantidad"}
                    value={`S/ ${payment.cantidad.toLocaleString("es-PE")}`}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wide">Estado</label>
                    <div className="flex h-10 items-center rounded-lg border border-border/60 bg-white px-3">
                        <StatusBadge status={payment.estado} />
                    </div>
                </div>

                {payment.estado === "Adelanto" && (
                    <InfoField
                        label="Pendiente por pagar"
                        value={`S/ ${(payment.cantidadPendiente ?? 0).toLocaleString("es-PE")}`}
                        className="sm:col-span-2"
                    />
                )}

                <InfoField label="Boleta" value={payment.boleta ?? "Sin boleta adjunta"} className="sm:col-span-2" />
            </div>
        </AppModal>
    );
}
