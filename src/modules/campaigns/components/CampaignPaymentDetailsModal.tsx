import { Receipt } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[520px] p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                            <Receipt size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-ink">
                                Detalles del Pago
                            </DialogTitle>
                            <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                Visualizando la información registrada del pago.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 opacity-90 pointer-events-none">
                    <div className="flex flex-col gap-2.5 sm:col-span-2">
                        <label className="text-[13px] font-semibold text-ink">Transportista:</label>
                        <Input readOnly value={payment.transportista} className="rounded-lg h-11 border-border shadow-none bg-surface-page" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">{payment.estado === "Adelanto" ? "Adelantado:" : "Cantidad:"}</label>
                        <Input readOnly value={`S/ ${payment.cantidad.toLocaleString("es-PE")}`} className="rounded-lg h-11 border-border shadow-none bg-surface-page" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Estado:</label>
                        <div className="flex h-11 items-center rounded-lg border border-border bg-surface-page px-3.5">
                            <StatusBadge status={payment.estado} />
                        </div>
                    </div>

                    {payment.estado === "Adelanto" && (
                        <div className="flex flex-col gap-2.5 sm:col-span-2">
                            <label className="text-[13px] font-semibold text-ink">Pendiente por pagar:</label>
                            <Input readOnly value={`S/ ${(payment.cantidadPendiente ?? 0).toLocaleString("es-PE")}`} className="rounded-lg h-11 border-border shadow-none bg-surface-page" />
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5 sm:col-span-2">
                        <label className="text-[13px] font-semibold text-ink">Boleta:</label>
                        <Input readOnly value={payment.boleta ?? "Sin boleta adjunta"} className="rounded-lg h-11 border-border shadow-none bg-surface-page" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
