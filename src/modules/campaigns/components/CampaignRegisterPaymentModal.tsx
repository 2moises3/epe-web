import { useEffect, useState } from "react";
import { Save, X, Banknote } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import FileDropzone from "@/shared/components/FileDropzone";
import { getCarriers } from "@/modules/carriers/api/carrier.api";
import { generatePaymentCode } from "@/modules/campaigns/carrierPayments.data";
import {
    EMPTY_PAYMENT_DRAFT,
    validatePaymentDraft,
    type PaymentDraft,
    type PaymentDraftErrors,
    type PaymentType,
} from "@/modules/campaigns/carrierPayments.utils";

interface CampaignRegisterPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (draft: PaymentDraft) => void;
}

const REQUIRED = <span aria-hidden="true" className="text-destructive">*</span>;
const AMOUNT_INPUT_CLASS = "rounded-lg h-11 pl-9 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground";

function AmountField({ id, label, value, error, onChange }: { id: string; label: string; value: string; error?: string; onChange: (value: string) => void }) {
    return (
        <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={id}>{label} {REQUIRED}</FieldLabel>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">S/</span>
                <Input
                    id={id}
                    type="number"
                    min="0"
                    inputMode="decimal"
                    placeholder="0"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={AMOUNT_INPUT_CLASS}
                    aria-invalid={error ? true : undefined}
                />
            </div>
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
}

export default function CampaignRegisterPaymentModal({ open, onOpenChange, onSave }: CampaignRegisterPaymentModalProps) {
    const [draft, , set] = useModalForm<PaymentDraft>(open, EMPTY_PAYMENT_DRAFT);
    const [errors, setErrors] = useState<PaymentDraftErrors>({});
    const [carriers, setCarriers] = useState<string[]>([]);
    const [carriersState, setCarriersState] = useState<"loading" | "ready" | "error">("loading");
    // Un código nuevo cada vez que se abre el modal para registrar un pago
    const [paymentCode, setPaymentCode] = useState(generatePaymentCode);

    useResetOnToggle(open, () => {
        setErrors({});
        setPaymentCode(generatePaymentCode());
    });

    // Las empresas disponibles se consultan al abrir, para reflejar las que se acaban de registrar
    useEffect(() => {
        if (!open) return;
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCarriersState("loading");
        getCarriers()
            .then((items) => {
                if (!active) return;
                setCarriers(items.map((carrier) => carrier.nombre));
                setCarriersState("ready");
            })
            .catch(() => { if (active) setCarriersState("error"); });
        return () => { active = false; };
    }, [open]);

    const update = <K extends keyof PaymentDraft>(field: K, value: PaymentDraft[K]) => {
        set(field)(value);
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSave = () => {
        const withCode = { ...draft, codigo: paymentCode };
        const nextErrors = validatePaymentDraft(withCode);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        if (onSave) onSave(withCode);
        else onOpenChange(false);
    };

    const tipo = draft.tipo;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Banknote size={22} strokeWidth={2} />}
            title="Registrar Pago"
            description="Registra un pago al transportista. Los campos con * son obligatorios."
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

                <Field data-invalid={errors.transportista || carriersState === "error" ? true : undefined}>
                    <FieldLabel>Empresa de transporte: {REQUIRED}</FieldLabel>
                    <Combobox
                        options={carriers.map((name) => ({ value: name, label: name }))}
                        value={draft.transportista}
                        onChange={(value) => update("transportista", value)}
                        placeholder={carriersState === "loading" ? "Cargando empresas..." : "Seleccione una empresa..."}
                        emptyMessage="Aún no hay empresas de transporte registradas"
                        disabled={carriersState !== "ready"}
                    />
                    {carriersState === "error" && <FieldError>No se pudieron cargar las empresas. Cierra y vuelve a abrir el formulario.</FieldError>}
                    {errors.transportista && <FieldError>{errors.transportista}</FieldError>}
                </Field>

                <Field data-invalid={errors.tipo ? true : undefined}>
                    <FieldLabel>Tipo de pago: {REQUIRED}</FieldLabel>
                    <Select
                        value={tipo || null}
                        onValueChange={(value) => update("tipo", ((value as PaymentType | null) ?? ""))}
                    >
                        <SelectTrigger className="w-full !h-11 rounded-lg border-border shadow-none text-ink font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand" aria-invalid={errors.tipo ? true : undefined}>
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="Adelanto" className="rounded-lg">Adelanto</SelectItem>
                            <SelectItem value="Completo" className="rounded-lg">Completo</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.tipo && <FieldError>{errors.tipo}</FieldError>}
                </Field>

                {/*
                    Adelanto = se paga una parte ahora y el resto queda pendiente, por eso pide el total
                    y cuándo se cierra; Completo = se paga todo de una vez, solo pide cuándo se acordó.
                */}
                {tipo === "Adelanto" && (
                    <div className="flex flex-col gap-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <AmountField id="payment-amount" label="Cantidad:" value={draft.cantidad} error={errors.cantidad} onChange={(value) => update("cantidad", value)} />
                            <AmountField id="payment-total" label="Cantidad Total:" value={draft.cantidadTotal} error={errors.cantidadTotal} onChange={(value) => update("cantidadTotal", value)} />
                        </div>

                        <Field data-invalid={errors.fecha ? true : undefined}>
                            <FieldLabel htmlFor="payment-date">Fecha de pago final: {REQUIRED}</FieldLabel>
                            <Input id="payment-date" type="date" value={draft.fecha} onChange={(event) => update("fecha", event.target.value)} aria-invalid={errors.fecha ? true : undefined} />
                            {errors.fecha && <FieldError>{errors.fecha}</FieldError>}
                        </Field>
                    </div>
                )}

                {tipo === "Completo" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <Field data-invalid={errors.fecha ? true : undefined}>
                            <FieldLabel htmlFor="payment-date">Fecha acordada: {REQUIRED}</FieldLabel>
                            <Input id="payment-date" type="date" value={draft.fecha} onChange={(event) => update("fecha", event.target.value)} aria-invalid={errors.fecha ? true : undefined} />
                            {errors.fecha && <FieldError>{errors.fecha}</FieldError>}
                        </Field>
                        <AmountField id="payment-amount" label="Cantidad:" value={draft.cantidad} error={errors.cantidad} onChange={(value) => update("cantidad", value)} />
                    </div>
                )}

                {tipo === "" && (
                    <p className="text-[13px] text-ink-muted italic -mt-2">Elige un tipo de pago para continuar.</p>
                )}

                <FileDropzone label="Boleta" hint="PDF, imagen · Máx. 10 MB" file={draft.boleta} onChange={(file) => update("boleta", file)} />
            </div>
        </AppModal>
    );
}
