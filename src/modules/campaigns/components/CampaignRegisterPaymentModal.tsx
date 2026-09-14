import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import FileDropzone from "@/shared/components/FileDropzone";
import { generatePaymentCode } from "@/modules/campaigns/carrierPayments.data";

type PaymentType = "Adelanto" | "Completo";

interface CampaignRegisterPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignRegisterPaymentModal({ open, onOpenChange, onSave }: CampaignRegisterPaymentModalProps) {
    const [tipo, setTipo] = useState<PaymentType | "">("");
    const [cantidad, setCantidad] = useState("");
    const [cantidadTotal, setCantidadTotal] = useState("");
    const [fecha, setFecha] = useState("");
    const [boleta, setBoleta] = useState<File | null>(null);

    // Un código nuevo cada vez que se abre el modal para registrar un pago
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `open` es la señal para regenerar, no una dependencia real de la función
    const paymentCode = useMemo(() => generatePaymentCode(), [open]);

    const resetForm = () => {
        setTipo("");
        setCantidad("");
        setCantidadTotal("");
        setFecha("");
        setBoleta(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
    };

    const handleSave = () => {
        if (onSave) onSave();
        else onOpenChange(false);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[600px] p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-4 sm:gap-5">
                            <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                                <Wallet size={24} strokeWidth={2} />
                            </div>
                            <div className="flex-1 pt-1">
                                <DialogTitle className="text-xl font-bold text-ink">
                                    Registrar Pago
                                </DialogTitle>
                                <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                    Registra un pago al transportista.
                                </DialogDescription>
                            </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-border bg-surface-page px-3 py-1.5 text-[11px] font-mono font-semibold text-ink-muted mt-1">
                            {paymentCode}
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Tipo de pago:</label>
                        <Select value={tipo} onValueChange={(value) => setTipo((value as PaymentType) ?? "")}>
                            <SelectTrigger className="w-full !h-11 rounded-lg border-border shadow-none text-ink font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="Adelanto" className="rounded-lg">Adelanto</SelectItem>
                                <SelectItem value="Completo" className="rounded-lg">Completo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/*
                        Adelanto = se paga una parte ahora y el resto queda pendiente, por eso pide el total
                        y cuándo se cierra; Completo = se paga todo de una vez, solo pide cuándo se acordó.
                    */}
                    {tipo === "Adelanto" && (
                        <div className="flex flex-col gap-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[13px] font-semibold text-ink">Cantidad:</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">S/</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={cantidad}
                                            onChange={(event) => setCantidad(event.target.value)}
                                            className="rounded-lg h-11 pl-9 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[13px] font-semibold text-ink">Cantidad Total:</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">S/</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={cantidadTotal}
                                            onChange={(event) => setCantidadTotal(event.target.value)}
                                            className="rounded-lg h-11 pl-9 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <label className="text-[13px] font-semibold text-ink">Fecha de pago final:</label>
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={(event) => setFecha(event.target.value)}
                                    className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                                />
                            </div>
                        </div>
                    )}

                    {tipo === "Completo" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[13px] font-semibold text-ink">Fecha acordada:</label>
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={(event) => setFecha(event.target.value)}
                                    className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                                />
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[13px] font-semibold text-ink">Cantidad:</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">S/</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={cantidad}
                                        onChange={(event) => setCantidad(event.target.value)}
                                        className="rounded-lg h-11 pl-9 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {tipo === "" && (
                        <p className="text-[13px] text-ink-muted italic -mt-2">Elige un tipo de pago para continuar.</p>
                    )}

                    <FileDropzone label="Boleta" hint="PDF, imagen · Máx. 10 MB" file={boleta} onChange={setBoleta} />
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
                        onClick={handleSave}
                        className="rounded-lg h-11 px-8 bg-brand hover:bg-brand-dark text-white font-semibold gap-2 shadow-sm transition-colors active:scale-95"
                    >
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
