import { useState } from "react";
import { X, Save, FlaskConical } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import FileDropzone from "@/shared/components/FileDropzone";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Combobox } from "@/shared/components/ui/combobox";

interface CampaignExamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignExamModal({ open, onOpenChange, onSave }: CampaignExamModalProps) {
    const [date, setDate] = useState("");
    const [result, setResult] = useState("");
    const [type, setType] = useState("");
    const [origin, setOrigin] = useState("");
    const [obs, setObs] = useState("");
    const [file, setFile] = useState<File | null>(null);

    // Resetear estados cuando se cierra el modal
    useResetOnToggle(open, () => {
        setDate("");
        setResult("");
        setType("");
        setOrigin("");
        setObs("");
        setFile(null);
    });

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<FlaskConical size={22} strokeWidth={2} />}
            title="Registrar Examen"
            description="Registra los análisis de laboratorio asociados al productor."
            className="sm:max-w-275 md:max-w-250"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={() => onSave ? onSave() : onOpenChange(false)}>
                        <Save size={20} strokeWidth={2.5} /> Guardar
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Columna Izquierda - Inputs */}
                        <div className="flex flex-col gap-4 sm:gap-5">
                            <Field>
                                <FieldLabel>Fecha:</FieldLabel>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Resultado:</FieldLabel>
                                <Input
                                    placeholder="Ingrese el resultado"
                                    value={result}
                                    onChange={(e) => setResult(e.target.value)}
                                    className="placeholder:text-muted-foreground"
                                />
                            </Field>
                        </div>

                        {/* Columna Derecha - Inputs */}
                        <div className="flex flex-col gap-4 sm:gap-5">
                            <Field>
                                <FieldLabel>Tipo de examen:</FieldLabel>
                                <Combobox
                                    options={[
                                        { value: "suelo", label: "Análisis de suelo" },
                                        { value: "foliar", label: "Análisis foliar" },
                                        { value: "agua", label: "Análisis de agua" },
                                        { value: "sanidad", label: "Análisis de sanidad" }
                                    ]}
                                    value={type}
                                    onChange={setType}
                                    placeholder="Seleccionar tipo..."
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Origen:</FieldLabel>
                                <Input
                                    placeholder="Origen"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    className="placeholder:text-muted-foreground"
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Observaciones (Ocupa la misma altura visual que el Dropzone) */}
                        <Field className="h-full">
                            <FieldLabel>Observaciones/Detalles:</FieldLabel>
                            <Textarea
                                value={obs}
                                onChange={(e) => setObs(e.target.value)}
                                className="resize-none h-full min-h-35.5 rounded-2xl border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                            />
                        </Field>

                        {/* File Dropzone */}
                        <div className="flex flex-col">
                            <FileDropzone 
                                label="Archivo de examen" 
                                hint="PDF, Imagen · Máx. 10 MB" 
                                file={file} 
                                onChange={setFile} 
                            />
                        </div>
                    </div>
                </div>
        </AppModal>
    );
}
