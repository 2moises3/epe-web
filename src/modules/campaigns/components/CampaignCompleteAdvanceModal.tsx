import { useMemo, useState } from "react";
import { Banknote } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
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

    const handleOpenChange = (nextOpen: boolean) => {
        // Al cerrar se limpia, así la próxima vez que se abra (para otro pago) no arrastra el archivo anterior
        if (!nextOpen) setReceipt(null);
        onOpenChange(nextOpen);
    };

    const handleConfirm = () => {
        if (onSave) onSave();
        else onOpenChange(false);
        setReceipt(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[600px] p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-4 sm:gap-5">
                            <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                                <Banknote size={24} strokeWidth={2} />
                            </div>
                            <div className="flex-1 pt-1">
                                <DialogTitle className="text-xl font-bold text-ink">
                                    Registrar Pago
                                </DialogTitle>
                                <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                    {payment ? `Cierra el saldo pendiente de ${payment.transportista}.` : "Cierra el saldo pendiente."}
                                </DialogDescription>
                            </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-border bg-surface-page px-3 py-1.5 text-[11px] font-mono font-semibold text-ink-muted mt-1">
                            {paymentCode}
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Pago Realizado:</label>
                            <div className="flex h-11 items-center rounded-lg border border-border bg-surface-page px-3.5 text-[14px] font-semibold text-ink">
                                Adelanto · S/ {payment ? payment.cantidad.toLocaleString("es-PE") : 0}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Pago Pendiente:</label>
                            <div className="flex h-11 items-center rounded-lg border border-border bg-surface-page px-3.5 text-[14px] font-semibold text-ink">
                                Pendiente · S/ {payment?.cantidadPendiente ? payment.cantidadPendiente.toLocaleString("es-PE") : 0}
                            </div>
                        </div>
                    </div>

                    <FileDropzone label="Boleta" hint="PDF, imagen · Máx. 10 MB" file={receipt} onChange={setReceipt} />
                </div>

                {/* Botones Footer */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8 [&>button]:w-full sm:[&>button]:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        className="rounded-lg h-11 px-8 border-border text-ink-muted font-bold hover:bg-muted hover:text-ink transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="rounded-lg h-11 px-8 bg-brand hover:bg-brand-dark text-white font-semibold gap-2 shadow-sm transition-colors active:scale-95"
                    >
                        Confirmar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
