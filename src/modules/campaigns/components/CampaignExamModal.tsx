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

const REQUIRED = <span aria-hidden="true" className="text-destructive">*</span>;

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
                    <Field data-invalid={errors.origen ? true : undefined}>
                        <FieldLabel htmlFor="exam-origin">Origen {REQUIRED}</FieldLabel>
                        <Input
                            id="exam-origin"
                            placeholder="Ej. Campo A"
                            value={values.origen}
                            onChange={(event) => update("origen", event.target.value)}
                            aria-invalid={errors.origen ? true : undefined}
                            readOnly={isViewOnly}
                        />
                        {errors.origen && <FieldError>{errors.origen}</FieldError>}
                    </Field>

                    <Field data-invalid={errors.tipoExamen ? true : undefined}>
                        <FieldLabel>Tipo de examen {REQUIRED}</FieldLabel>
                        <div className={isViewOnly ? "pointer-events-none" : ""}>
                            <Combobox
                                options={EXAM_TYPES}
                                value={EXAM_TYPES.find((type) => type.label === values.tipoExamen)?.value ?? ""}
                                onChange={(value) => update("tipoExamen", EXAM_TYPES.find((type) => type.value === value)?.label ?? "")}
                                placeholder="Buscar..."
                            />
                        </div>
                        {errors.tipoExamen && <FieldError>{errors.tipoExamen}</FieldError>}
                    </Field>
                </div>

                {/* Row 2: Identificación | Resultado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <Field data-invalid={errors.identificacionMuestra ? true : undefined}>
                        <FieldLabel htmlFor="exam-sample">Identificación de muestra {REQUIRED}</FieldLabel>
                        <Input
                            id="exam-sample"
                            placeholder="Ej. MUESTRA-001"
                            value={values.identificacionMuestra}
                            onChange={(event) => update("identificacionMuestra", event.target.value)}
                            aria-invalid={errors.identificacionMuestra ? true : undefined}
                            readOnly={isViewOnly}
                        />
                        {errors.identificacionMuestra && <FieldError>{errors.identificacionMuestra}</FieldError>}
                    </Field>

                    <Field data-invalid={errors.resultado ? true : undefined}>
                        <FieldLabel htmlFor="exam-result">Resultado del examen {REQUIRED}</FieldLabel>
                        <div className={isViewOnly ? "pointer-events-none" : ""}>
                            <SegmentedControl
                                options={[{ label: "Positivo", value: "positivo" }, { label: "Negativo", value: "negativo" }]}
                                value={values.resultado || ""}
                                onChange={(value) => update("resultado", value as ExamResult)}
                            />
                        </div>
                        {errors.resultado && <FieldError>{errors.resultado}</FieldError>}
                    </Field>
                </div>

                {/* Row 3: Fecha del examen | Fecha de envío | Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <Field data-invalid={errors.fecha ? true : undefined}>
                        <FieldLabel htmlFor="exam-date">Fecha del examen {REQUIRED}</FieldLabel>
                        <Input
                            id="exam-date"
                            type="date"
                            value={values.fecha}
                            onChange={(event) => update("fecha", event.target.value)}
                            aria-invalid={errors.fecha ? true : undefined}
                            readOnly={isViewOnly}
                        />
                        {errors.fecha && <FieldError>{errors.fecha}</FieldError>}
                    </Field>

                    <Field data-invalid={errors.fechaEnvioMuestra ? true : undefined}>
                        <FieldLabel htmlFor="exam-sample-date">Fecha de envío de la muestra {REQUIRED}</FieldLabel>
                        <Input
                            id="exam-sample-date"
                            type="date"
                            value={values.fechaEnvioMuestra}
                            onChange={(event) => update("fechaEnvioMuestra", event.target.value)}
                            aria-invalid={errors.fechaEnvioMuestra ? true : undefined}
                            readOnly={isViewOnly}
                        />
                        {errors.fechaEnvioMuestra && <FieldError>{errors.fechaEnvioMuestra}</FieldError>}
                    </Field>

                    <Field data-invalid={errors.estadoEnvioResultado ? true : undefined}>
                        <FieldLabel htmlFor="exam-status">Estado de envío/resultado {REQUIRED}</FieldLabel>
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
                        {errors.estadoEnvioResultado && <FieldError>{errors.estadoEnvioResultado}</FieldError>}
                    </Field>
                </div>

                {/* Row 4: Observación | Archivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Observación */}
                    <Field className="h-full">
                        <FieldLabel htmlFor="exam-observation">Observación</FieldLabel>
                        <Textarea
                            id="exam-observation"
                            placeholder="Escribe alguna observación o detalle adicional..."
                            value={values.observacion}
                            onChange={(event) => update("observacion", event.target.value)}
                            className="resize-none h-full min-h-35.5"
                            readOnly={isViewOnly}
                        />
                    </Field>

                    {/* Dropzone */}
                    <Field data-invalid={errors.archivo ? true : undefined}>
                        <FieldLabel>Archivo de examen {REQUIRED}</FieldLabel>
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
                        {errors.archivo && <FieldError>{errors.archivo}</FieldError>}
                    </Field>
                </div>
            </div>
        </AppModal>
    );
}
