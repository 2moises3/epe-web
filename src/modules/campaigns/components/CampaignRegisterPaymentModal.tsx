import { useMemo, useState } from "react";
import { Save, X, Banknote } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
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

    useResetOnToggle(open, () => {
        setTipo("");
        setCantidad("");
        setCantidadTotal("");
        setFecha("");
        setBoleta(null);
    });

    const handleSave = () => {
        if (onSave) onSave();
        else onOpenChange(false);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Banknote size={22} strokeWidth={2} />}
            title="Registrar Pago"
            description="Registra un pago al transportista."
            className="sm:max-w-150"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSave}>
                        <Save size={20} strokeWidth={2.5} /> Guardar
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-5">
                    <span className="self-start rounded-full border border-border bg-surface-page px-3 py-1.5 text-[11px] font-mono font-semibold text-ink-muted">
                        {paymentCode}
                    </span>
                    <Field>
                        <FieldLabel>Tipo de pago:</FieldLabel>
                        <Select value={tipo} onValueChange={(value) => setTipo((value as PaymentType) ?? "")}>
                            <SelectTrigger className="w-full !h-11 rounded-lg border-border shadow-none text-ink font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="Adelanto" className="rounded-lg">Adelanto</SelectItem>
                                <SelectItem value="Completo" className="rounded-lg">Completo</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    {/*
                        Adelanto = se paga una parte ahora y el resto queda pendiente, por eso pide el total
                        y cuándo se cierra; Completo = se paga todo de una vez, solo pide cuándo se acordó.
                    */}
                    {tipo === "Adelanto" && (
                        <div className="flex flex-col gap-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <Field>
                                    <FieldLabel>Cantidad:</FieldLabel>
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
                                </Field>
                                <Field>
                                    <FieldLabel>Cantidad Total:</FieldLabel>
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
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel>Fecha de pago final:</FieldLabel>
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={(event) => setFecha(event.target.value)}
                                />
                            </Field>
                        </div>
                    )}

                    {tipo === "Completo" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                            <Field>
                                <FieldLabel>Fecha acordada:</FieldLabel>
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={(event) => setFecha(event.target.value)}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Cantidad:</FieldLabel>
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
                            </Field>
                        </div>
                    )}

                    {tipo === "" && (
                        <p className="text-[13px] text-ink-muted italic -mt-2">Elige un tipo de pago para continuar.</p>
                    )}

                    <FileDropzone label="Boleta" hint="PDF, imagen · Máx. 10 MB" file={boleta} onChange={setBoleta} />
                </div>
        </AppModal>
    );
}
