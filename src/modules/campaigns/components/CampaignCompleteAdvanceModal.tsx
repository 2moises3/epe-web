import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Button } from "@/shared/components/ui/button";
import FileDropzone from "@/shared/components/FileDropzone";
import { generatePaymentCode, type CarrierPayment } from "@/modules/campaigns/carrierPayments.data";

interface CampaignCompleteAdvanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: CarrierPayment | null;
    onSave?: () => void;
}

/** Cierra un pago que ya tuvo un adelanto: muestra lo ya pagado y lo que falta, y pide la boleta del saldo */
export default function CampaignCompleteAdvanceModal({ open, onOpenChange, payment, onSave }: CampaignCompleteAdvanceModalProps) {
    const [receipt, setReceipt] = useState<File | null>(null);

    // Un código nuevo cada vez que se abre el modal
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `open` es la señal para regenerar, no una dependencia real de la función
    const paymentCode = useMemo(() => generatePaymentCode(), [open]);

    // Al cerrar se limpia, así la próxima vez que se abra (para otro pago) no arrastra el archivo anterior
    useResetOnToggle(open, () => {
        setReceipt(null);
    });

    const handleConfirm = () => {
        if (onSave) onSave();
        else onOpenChange(false);
        setReceipt(null);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Completar Pago"
            description={payment ? `Cierra el saldo pendiente de ${payment.transportista}.` : "Cierra el saldo pendiente."}
            className="sm:max-w-150"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <Field>
                            <FieldLabel>Pago Realizado:</FieldLabel>
                            <div className="flex h-11 items-center rounded-lg border border-border bg-surface-page px-3.5 text-[14px] font-semibold text-ink">
                                Adelanto · S/ {payment ? payment.cantidad.toLocaleString("es-PE") : 0}
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel>Pago Pendiente:</FieldLabel>
                            <div className="flex h-11 items-center rounded-lg border border-border bg-surface-page px-3.5 text-[14px] font-semibold text-ink">
                                Pendiente · S/ {payment?.cantidadPendiente ? payment.cantidadPendiente.toLocaleString("es-PE") : 0}
                            </div>
                        </Field>
                    </div>

                    <FileDropzone label="Boleta" hint="PDF, imagen · Máx. 10 MB" file={receipt} onChange={setReceipt} />
                </div>
        </AppModal>
    );
}
