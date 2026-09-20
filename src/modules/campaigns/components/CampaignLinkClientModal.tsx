import { useState } from "react";
import { X, Save } from "lucide-react";
import FileDropzone from "@/shared/components/FileDropzone";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
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
    useResetOnToggle(open, () => {
        setSelectedClient("");
        setCantidad("");
        setFile(null);
    });

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
                        <Field className="flex-1">
                            <FieldLabel>Seleccionar Cliente:</FieldLabel>
                            <Combobox
                                options={ALL_CLIENTS}
                                value={selectedClient}
                                onChange={setSelectedClient}
                                placeholder="Selecciona un cliente"
                            />
                        </Field>

                        <Field className="w-35">
                            <FieldLabel>Cantidad kg:</FieldLabel>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                            />
                        </Field>
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
