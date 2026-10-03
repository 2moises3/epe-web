import { useState } from "react";
import { X, Save, FlaskConical } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import FileDropzone from "@/shared/components/FileDropzone";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Combobox } from "@/shared/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { EMPTY_EXAM, EXAM_TYPES, validateExam, type ExamErrors, type ExamResult, type ExamValues } from "@/modules/campaigns/campaignExam";

interface CampaignExamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Proveedor al que se le registra el examen, se muestra bajo el título */
    providerName?: string;
    onSave?: (values: ExamValues) => void;
}

const REQUIRED = <span aria-hidden="true" className="text-destructive">*</span>;

export default function CampaignExamModal({ open, onOpenChange, providerName, onSave }: CampaignExamModalProps) {
    const [values, , set] = useModalForm<ExamValues>(open, EMPTY_EXAM);
    const [errors, setErrors] = useState<ExamErrors>({});

    useResetOnToggle(open, () => setErrors({}));

    const update = <K extends keyof ExamValues>(field: K, value: ExamValues[K]) => {
        set(field)(value);
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSave = () => {
        const nextErrors = validateExam(values);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        if (onSave) onSave(values);
        else onOpenChange(false);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<FlaskConical size={22} strokeWidth={2} />}
            title="Registrar Examen"
            description={providerName ? `Registra los análisis de laboratorio de ${providerName}.` : "Registra los análisis de laboratorio asociados al productor."}
            className="sm:max-w-275 md:max-w-250"
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
                    {/* Columna izquierda */}
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <Field data-invalid={errors.fecha ? true : undefined}>
                            <FieldLabel htmlFor="exam-date">Fecha: {REQUIRED}</FieldLabel>
                            <Input
                                id="exam-date"
                                type="date"
                                value={values.fecha}
                                onChange={(event) => update("fecha", event.target.value)}
                                aria-invalid={errors.fecha ? true : undefined}
                            />
                            {errors.fecha && <FieldError>{errors.fecha}</FieldError>}
                        </Field>
                        <Field data-invalid={errors.resultado ? true : undefined}>
                            <FieldLabel htmlFor="exam-result">Resultado: {REQUIRED}</FieldLabel>
                            <Select
                                items={[{ value: "positivo", label: "Positivo" }, { value: "negativo", label: "Negativo" }]}
                                value={values.resultado || null}
                                onValueChange={(result) => update("resultado", (result as ExamResult | null) ?? "")}
                            >
                                <SelectTrigger id="exam-result" className="w-full" aria-invalid={errors.resultado ? true : undefined}>
                                    <SelectValue placeholder="Seleccionar resultado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="positivo">Positivo</SelectItem>
                                    <SelectItem value="negativo">Negativo</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.resultado && <FieldError>{errors.resultado}</FieldError>}
                        </Field>
                    </div>

                    {/* Columna derecha */}
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <Field data-invalid={errors.tipoExamen ? true : undefined}>
                            <FieldLabel>Tipo de examen: {REQUIRED}</FieldLabel>
                            <Combobox
                                options={EXAM_TYPES}
                                value={EXAM_TYPES.find((type) => type.label === values.tipoExamen)?.value ?? ""}
                                onChange={(value) => update("tipoExamen", EXAM_TYPES.find((type) => type.value === value)?.label ?? "")}
                                placeholder="Seleccionar tipo..."
                            />
                            {errors.tipoExamen && <FieldError>{errors.tipoExamen}</FieldError>}
                        </Field>
                        <Field data-invalid={errors.origen ? true : undefined}>
                            <FieldLabel htmlFor="exam-origin">Origen: {REQUIRED}</FieldLabel>
                            <Input
                                id="exam-origin"
                                placeholder="Origen"
                                value={values.origen}
                                onChange={(event) => update("origen", event.target.value)}
                                className="placeholder:text-muted-foreground"
                                aria-invalid={errors.origen ? true : undefined}
                            />
                            {errors.origen && <FieldError>{errors.origen}</FieldError>}
                        </Field>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Observaciones (ocupa la misma altura visual que el dropzone) */}
                    <Field className="h-full">
                        <FieldLabel htmlFor="exam-observation">Observaciones/Detalles:</FieldLabel>
                        <Textarea
                            id="exam-observation"
                            value={values.observacion}
                            onChange={(event) => update("observacion", event.target.value)}
                            className="resize-none h-full min-h-35.5 rounded-2xl border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                        />
                    </Field>

                    <div className="flex flex-col">
                        <FileDropzone
                            label="Archivo de examen"
                            hint="PDF, Imagen · Máx. 10 MB"
                            file={values.archivo}
                            onChange={(file) => update("archivo", file)}
                        />
                    </div>
                </div>
            </div>
        </AppModal>
    );
}
