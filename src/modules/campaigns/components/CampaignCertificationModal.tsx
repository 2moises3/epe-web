import { useState } from "react";
import { ShieldCheck } from "lucide-react";
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
    const resetForm = () => {
        setCertification("");
        setExpiryDate("");
        setCost("");
        setReceipt(null);
        setDocument(null);
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
                    <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                            <ShieldCheck size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-ink">
                                Registrar Certificaciones
                            </DialogTitle>
                            <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                Registra las certificaciones y documentos del proveedor.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Certificación:</label>
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
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Fecha Vencimiento:</label>
                            <Input
                                type="date"
                                value={expiryDate}
                                onChange={(event) => setExpiryDate(event.target.value)}
                                className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Costo:</label>
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <FileDropzone label="Recibo de pago" hint="PDF, imagen · Máx. 10 MB" file={receipt} onChange={setReceipt} />
                        <FileDropzone label="Documento de certificación" hint="PDF · Máx. 10 MB" file={document} onChange={setDocument} />
                    </div>
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
