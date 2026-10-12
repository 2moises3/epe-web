import { useState } from "react";

import { X, Save, FlaskConical } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import FileDropzone from "@/shared/components/FileDropzone";
import FormField from "@/shared/components/FormField";
import InputField from "@/shared/components/InputField";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Combobox } from "@/shared/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import SegmentedControl from "@/shared/components/SegmentedControl";
import { EMPTY_EXAM, EXAM_TYPES, validateExam, type ExamErrors, type ExamResult, type ExamValues } from "@/modules/campaigns/campaignExam";

interface CampaignExamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Proveedor al que se le registra el examen, se muestra bajo el título */
    providerName?: string;
    initialValues?: ExamValues;
    isViewOnly?: boolean;
    onSave?: (values: ExamValues) => void;
}

export default function CampaignExamModal({ open, onOpenChange, initialValues, isViewOnly, onSave }: CampaignExamModalProps) {
    const [values, , set] = useModalForm<ExamValues>(open, initialValues || EMPTY_EXAM);
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
            title={isViewOnly ? "Detalles del Examen" : initialValues ? "Editar Examen" : "Registrar examen"}
            className="sm:max-w-275 md:max-w-250"
            footer={
                isViewOnly ? (
                    <Button size="xl" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                            <X size={20} strokeWidth={2.5} /> Cancelar
                        </Button>
                        <Button size="xl" onClick={handleSave}>
                            <Save size={20} strokeWidth={2.5} /> Guardar
                        </Button>
                    </>
                )
            }
        >
            <div className="flex flex-col gap-6">
                {/* Row 1: Origen | Tipo de examen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <InputField id="exam-origin" label="Origen" required placeholder="Ej. Campo A" value={values.origen} onChange={(value) => update("origen", value)} error={errors.origen} readOnly={isViewOnly} />

                    <FormField label="Tipo de examen" required error={errors.tipoExamen}>
                        <div className={isViewOnly ? "pointer-events-none" : ""}>
                            <Combobox
                                options={EXAM_TYPES}
                                value={EXAM_TYPES.find((type) => type.label === values.tipoExamen)?.value ?? ""}
                                onChange={(value) => update("tipoExamen", EXAM_TYPES.find((type) => type.value === value)?.label ?? "")}
                                placeholder="Buscar..."
                            />
                        </div>
                    </FormField>
                </div>

                {/* Row 2: Identificación | Resultado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <InputField id="exam-sample" label="Identificación de muestra" required placeholder="Ej. MUESTRA-001" value={values.identificacionMuestra} onChange={(value) => update("identificacionMuestra", value)} error={errors.identificacionMuestra} readOnly={isViewOnly} />

                    <FormField id="exam-result" label="Resultado del examen" required error={errors.resultado}>
                        <div className={isViewOnly ? "pointer-events-none" : ""}>
                            <SegmentedControl
                                options={[{ label: "Positivo", value: "positivo" }, { label: "Negativo", value: "negativo" }]}
                                value={values.resultado || ""}
                                onChange={(value) => update("resultado", value as ExamResult)}
                            />
                        </div>
                    </FormField>
                </div>

                {/* Row 3: Fecha del examen | Fecha de envío | Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <InputField id="exam-date" type="date" label="Fecha del examen" required value={values.fecha} onChange={(value) => update("fecha", value)} error={errors.fecha} readOnly={isViewOnly} />
                    <InputField id="exam-sample-date" type="date" label="Fecha de envío de la muestra" required value={values.fechaEnvioMuestra} onChange={(value) => update("fechaEnvioMuestra", value)} error={errors.fechaEnvioMuestra} readOnly={isViewOnly} />

                    <FormField id="exam-status" label="Estado de envío/resultado" required error={errors.estadoEnvioResultado}>
                        <div className={isViewOnly ? "pointer-events-none" : ""}>
                            <Select
                                items={[{ value: "Pendiente", label: "Pendiente" }, { value: "En proceso", label: "En proceso" }, { value: "Entregado", label: "Entregado" }]}
                                value={values.estadoEnvioResultado || null}
                                onValueChange={(result) => update("estadoEnvioResultado", result ?? "")}
                            >
                                <SelectTrigger id="exam-status" className="w-full" aria-invalid={errors.estadoEnvioResultado ? true : undefined}>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                    <SelectItem value="En proceso">En proceso</SelectItem>
                                    <SelectItem value="Entregado">Entregado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </FormField>
                </div>

                {/* Row 4: Observación | Archivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField id="exam-observation" label="Observación" className="h-full">
                        <Textarea
                            id="exam-observation"
                            placeholder="Escribe alguna observación o detalle adicional..."
                            value={values.observacion}
                            onChange={(event) => update("observacion", event.target.value)}
                            className="resize-none h-full min-h-35.5"
                            readOnly={isViewOnly}
                        />
                    </FormField>

                    <FormField label="Archivo de examen" required error={errors.archivo}>
                        {isViewOnly && !values.archivo ? (
                            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-surface-elevated text-sm text-ink-muted">
                                Sin archivo adjunto
                            </div>
                        ) : (
                            <div className={isViewOnly ? "pointer-events-none" : ""}>
                                <FileDropzone
                                    label="Archivo de examen"
                                    hideLabel
                                    hint="PDF, Imagen · Máx. 10 MB"
                                    file={values.archivo}
                                    onChange={(file) => update("archivo", file)}
                                />
                            </div>
                        )}
                    </FormField>
                </div>
            </div>
        </AppModal>
    );
}
