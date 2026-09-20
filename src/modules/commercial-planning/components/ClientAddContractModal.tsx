import { useState } from "react";
import { Save, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import FileDropzone from "@/shared/components/FileDropzone";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

interface ClientAddContractModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ClientAddContractModal({ open, onOpenChange, onSuccess }: ClientAddContractModalProps) {
    const [kg, setKg] = useState("");
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [fichaFile, setFichaFile] = useState<File | null>(null);

    // Resetear estados cuando se cierra el modal
    useResetOnToggle(open, () => {
        setKg("");
        setContractFile(null);
        setFichaFile(null);
    });

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Añadir Contrato"
            description="Datos del cliente y documentos adjuntos"
            className="sm:max-w-187.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        <Save size={20} strokeWidth={2.5} /> Guardar contrato
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-muted mb-4">Datos del contrato</h3>
                        <Field>
                            <FieldLabel>Kilos Acordados:</FieldLabel>
                            <div className="relative">
                                <Input
                                    placeholder="0"
                                    value={kg}
                                    onChange={(e) => setKg(e.target.value)}
                                    className="rounded-xl h-12 border-border/60 bg-surface-page/50 pr-12 text-[15px] font-medium shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand focus-visible:bg-white placeholder:text-muted-foreground text-ink transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[13px] text-ink-muted px-2 py-1 bg-muted/50 rounded-md">
                                    kg
                                </div>
                            </div>
                        </Field>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-muted mb-4">Documentos adjuntos</h3>

                        <div className="flex flex-col gap-5">
                            <FileDropzone 
                                label="Contrato" 
                                hint="PDF · Máx. 10 MB" 
                                file={contractFile} 
                                onChange={setContractFile} 
                            />

                            <FileDropzone 
                                label="Ficha Técnica" 
                                hint="PDF, Excel · Máx. 10 MB" 
                                file={fichaFile} 
                                onChange={setFichaFile} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppModal>
    );
}
