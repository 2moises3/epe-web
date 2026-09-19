import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import FileDropzone from "@/shared/components/FileDropzone";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";

interface CampaignLinkClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignLinkClientModal({ open, onOpenChange, onSave }: CampaignLinkClientModalProps) {
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

    const ALL_CLIENTS = [
        { value: "sutrimex", label: "Sutrimex" },
        { value: "fixgrom", label: "Fixgrom" }
    ];

    // Resetear estados cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            setSelectedClient("");
            setCantidad("");
            setFile(null);
        }
    }, [open]);

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Registrar Clientes"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={() => onSave ? onSave() : onOpenChange(false)} disabled={!selectedClient}>
                        <Save size={20} strokeWidth={2.5} /> Guardar
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-5">
                    {/* Cliente + Cantidad */}
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Seleccionar Cliente:</label>
                            <Combobox
                                options={ALL_CLIENTS}
                                value={selectedClient}
                                onChange={setSelectedClient}
                                placeholder="Selecciona un cliente"
                            />
                        </div>

                        <div className="w-35 flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Cantidad kg:</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    {/* Adjuntar */}
                    <div className="flex flex-col gap-2.5">
                        <FileDropzone 
                            label="Requerimientos" 
                            hint="PDF, Excel · Máx. 10 MB" 
                            file={file} 
                            onChange={setFile} 
                        />
                    </div>
                </div>
        </AppModal>
    );
}
