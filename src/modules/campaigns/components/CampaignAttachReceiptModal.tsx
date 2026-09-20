import { useMemo, useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Button } from "@/shared/components/ui/button";
import FileDropzone from "@/shared/components/FileDropzone";
import { generatePaymentCode, type CarrierPayment } from "@/modules/campaigns/carrierPayments.data";

interface CampaignAttachReceiptModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: CarrierPayment | null;
    onSave?: () => void;
}

/** Confirma un pago pendiente adjuntando su boleta; el pago en sí es de solo lectura acá */
export default function CampaignAttachReceiptModal({ open, onOpenChange, payment, onSave }: CampaignAttachReceiptModalProps) {
    const [receipt, setReceipt] = useState<File | null>(null);

    // Un código nuevo cada vez que se abre el modal
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `open` es la señal para regenerar, no una dependencia real de la función
    const paymentCode = useMemo(() => generatePaymentCode(), [open]);

    useEffect(() => {
        // Al cerrar se limpia, así la próxima vez que se abra (para otro pago) no arrastra el archivo anterior
        if (!open) {
            setReceipt(null);
        }
    }, [open]);

    const handleConfirm = () => {
        if (onSave) onSave();
        else onOpenChange(false);
        setReceipt(null);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Adjuntar Boleta"
            description={payment ? `Confirma el pago pendiente de ${payment.transportista}.` : "Confirma el pago pendiente."}
            className="sm:max-w-120"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleConfirm}>
                        <Check size={20} strokeWidth={2.5} /> Confirmar
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-5">
                    <span className="self-start rounded-full border border-border bg-surface-page px-3 py-1.5 text-[11px] font-mono font-semibold">
                        {paymentCode}
                    </span>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Pago Pendiente:</label>
                        <div className="flex h-11 items-center rounded-lg border border-border bg-surface-page px-3.5 text-[14px] font-semibold text-ink">
                            Pendiente · S/ {payment ? payment.cantidad.toLocaleString("es-PE") : 0}
                        </div>
                    </div>

                    <FileDropzone label="Boleta" hint="PDF, imagen · Máx. 10 MB" file={receipt} onChange={setReceipt} />
                </div>
        </AppModal>
    );
}
