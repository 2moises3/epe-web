import { useState } from "react";
import { Save, X, ShieldCheck } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import FileDropzone from "@/shared/components/FileDropzone";

const CERTIFICATION_TYPES = ["Internacional", "Nacional", "Orgánica", "GlobalGAP", "Fair Trade"];

interface CampaignCertificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignCertificationModal({ open, onOpenChange, onSave }: CampaignCertificationModalProps) {
    const [certification, setCertification] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cost, setCost] = useState("");
    const [receipt, setReceipt] = useState<File | null>(null);
    const [document, setDocument] = useState<File | null>(null);

    // Al cerrar el modal se limpia todo, así la próxima vez que se abra no arrastra datos de otro proveedor
    useResetOnToggle(open, () => {
        setCertification("");
        setExpiryDate("");
        setCost("");
        setReceipt(null);
        setDocument(null);
    });

    const handleSave = () => {
        if (onSave) onSave();
        else onOpenChange(false);

    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<ShieldCheck size={22} strokeWidth={2} />}
            title="Registrar Certificación"
            description="Registra las certificaciones y documentos del proveedor."
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
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Field>
                            <FieldLabel>Certificación:</FieldLabel>
                            <Select value={certification} onValueChange={(value) => setCertification(value ?? "")}>
                                <SelectTrigger className="w-full !h-11 rounded-lg border-border shadow-none text-ink font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    {CERTIFICATION_TYPES.map((type) => (
                                        <SelectItem key={type} value={type} className="rounded-lg">{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel>Fecha Vencimiento:</FieldLabel>
                            <Input
                                type="date"
                                value={expiryDate}
                                onChange={(event) => setExpiryDate(event.target.value)}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Costo:</FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">$</span>
                                <Input
                                    type="number"
                                    min="0"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={cost}
                                    onChange={(event) => setCost(event.target.value)}
                                    className="rounded-lg h-11 pl-7 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                                />
                            </div>
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <FileDropzone label="Recibo de pago" hint="PDF, imagen · Máx. 10 MB" file={receipt} onChange={setReceipt} />
                        <FileDropzone label="Documento de certificación" hint="PDF · Máx. 10 MB" file={document} onChange={setDocument} />
                    </div>
                </div>
        </AppModal>
    );
}
