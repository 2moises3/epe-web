import { useState } from "react";
import { Save, UserPlus, X, IdCard, Phone, AlertCircle } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import FormSection from "@/shared/components/FormSection";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import type { ProveedorInput } from "@/modules/providers/api/proveedor.dto";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import type { ProveedorField, ProveedorFieldErrors } from "@/modules/providers/api/proveedor.validation";
import { validateProveedorInput } from "@/modules/providers/api/proveedor.validation";
import { createProviderFormSession } from "@/modules/providers/api/provider-lifecycle";
import { createInFlightGuard, submitValidatedProveedor } from "@/modules/providers/api/proveedor-submission";

const DOCUMENT_TYPES = [
    { value: "DNI", label: "DNI" },
    { value: "Pasaporte", label: "Pasaporte" },
    { value: "Carnet de extranjeria", label: "Carnet de extranjería" },
];

interface ProviderFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** "create" arranca vacío; "edit" arranca con los datos de `provider` y cambia los textos */
    mode?: "create" | "edit";
    provider?: Proveedor | null;
    /** Bloqueo compartido con la tabla: evita guardar y eliminar al mismo tiempo */
    mutationGuard: ReturnType<typeof createInFlightGuard>;
    /** Guarda en el backend; el modal solo se cierra si la promesa se resuelve */
    onSave: (providerId: number | null, input: ProveedorInput) => Promise<Proveedor>;
}

/** Alta y edición de un proveedor: mismos campos, solo cambian los textos y los valores iniciales. */
export default function ProviderFormModal({ open, onOpenChange, mode = "create", provider, mutationGuard, onSave }: ProviderFormModalProps) {
    const isEdit = mode === "edit";
    // Al abrir y al cerrar vuelve a los valores de origen: en alta queda vacío, en edición carga el proveedor
    const [values, , set] = useModalForm(open, createProviderFormSession(provider).values);
    const [errors, setErrors] = useState<ProveedorFieldErrors>({});
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useResetOnToggle(open, () => {
        setErrors({});
        setSaveError(null);
    });

    const updateField = (field: ProveedorField, value: string) => {
        set(field)(value as never);
        setErrors((current) => ({ ...current, [field]: undefined }));
        setSaveError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && mutationGuard.isInFlight) return;
        onOpenChange(nextOpen);
    };

    const handleSubmit = async () => {
        try {
            const result = await submitValidatedProveedor(values, validateProveedorInput, mutationGuard, (input) => onSave(provider?.proveedorId ?? null, input), () => {
                setIsSaving(true);
                setErrors({});
                setSaveError(null);
            });
            if (result.status === "invalid") setErrors(result.errors);
            if (result.status === "saved") onOpenChange(false);
        } catch {
            setSaveError("No se pudieron guardar los cambios. Revisa la información e intenta nuevamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const fieldProps = (field: ProveedorField) => ({
        id: `provider-${field}`,
        value: values[field],
        disabled: isSaving,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateField(field, event.target.value),
        "aria-invalid": errors[field] ? true : undefined,
        "aria-describedby": errors[field] ? `provider-${field}-error` : undefined,
        "aria-required": true,
        required: true,
    });

    const label = (field: ProveedorField, text: string) => (
        <FieldLabel htmlFor={`provider-${field}`}>{text}: <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
    );

    const error = (field: ProveedorField) => (errors[field] ? <FieldError id={`provider-${field}-error`}>{errors[field]}</FieldError> : null);

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<UserPlus size={22} strokeWidth={2} />}
            title={isEdit ? "Editar Proveedor" : "Registrar Proveedor"}
            description={isEdit
                ? "Modifica la información del proveedor existente. Los campos con * son obligatorios."
                : "Completa la información para registrar un nuevo proveedor. Los campos con * son obligatorios."}
            className="sm:max-w-200"
            footer={
                <>
                    <Button variant="outline" size="xl" disabled={isSaving} onClick={() => handleOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" disabled={isSaving} onClick={handleSubmit} aria-busy={isSaving}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> {isSaving ? "Guardando..." : "Guardar"}</>
                            : <><UserPlus size={20} strokeWidth={2.5} /> {isSaving ? "Creando..." : "Crear Proveedor"}</>}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                {saveError && (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                )}

                <FormSection icon={<IdCard size={16} strokeWidth={2.5} />} title="Identificación">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                        <Field data-invalid={errors.nombres ? true : undefined}>
                            {label("nombres", "Nombres")}
                            <Input maxLength={150} {...fieldProps("nombres")} />
                            {error("nombres")}
                        </Field>
                        <Field data-invalid={errors.apellido ? true : undefined}>
                            {label("apellido", "Apellidos")}
                            <Input maxLength={150} {...fieldProps("apellido")} />
                            {error("apellido")}
                        </Field>
                        <Field data-invalid={errors.tipoDocumento ? true : undefined}>
                            {label("tipoDocumento", "Tipo de Documento")}
                            <Select items={DOCUMENT_TYPES} value={values.tipoDocumento || null} onValueChange={(value) => updateField("tipoDocumento", (value as string | null) ?? "")} disabled={isSaving}>
                                <SelectTrigger
                                    id="provider-tipoDocumento"
                                    className="w-full"
                                    aria-required="true"
                                    aria-invalid={errors.tipoDocumento ? true : undefined}
                                    aria-describedby={errors.tipoDocumento ? "provider-tipoDocumento-error" : undefined}
                                >
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {error("tipoDocumento")}
                        </Field>
                        <Field data-invalid={errors.nmrDocumento ? true : undefined}>
                            {label("nmrDocumento", "Número de Documento")}
                            <Input type="number" inputMode="numeric" min={1} step={1} {...fieldProps("nmrDocumento")} />
                            {error("nmrDocumento")}
                        </Field>
                        <Field data-invalid={errors.identidadDocUrl ? true : undefined} className="sm:col-span-2">
                            {label("identidadDocUrl", "Documento de identidad (URL)")}
                            <Input type="url" placeholder="https://..." {...fieldProps("identidadDocUrl")} />
                            {error("identidadDocUrl")}
                            <FieldDescription className="text-[12px]">Pega el enlace del archivo compartido (Drive, OneDrive, etc.).</FieldDescription>
                        </Field>
                    </div>
                </FormSection>

                <Separator />

                <FormSection icon={<Phone size={16} strokeWidth={2.5} />} title="Contacto y producción">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                        <Field data-invalid={errors.telefono ? true : undefined}>
                            {label("telefono", "Teléfono")}
                            <Input type="tel" inputMode="numeric" {...fieldProps("telefono")} />
                            {error("telefono")}
                        </Field>
                        <Field data-invalid={errors.email ? true : undefined}>
                            {label("email", "Email")}
                            <Input type="email" maxLength={320} {...fieldProps("email")} />
                            {error("email")}
                        </Field>
                        <Field data-invalid={errors.zona ? true : undefined}>
                            {label("zona", "Zona")}
                            <Input {...fieldProps("zona")} />
                            {error("zona")}
                        </Field>
                        <Field data-invalid={errors.codigoLugarProduccion ? true : undefined}>
                            {label("codigoLugarProduccion", "Código Lugar de Producción")}
                            <Input type="number" inputMode="numeric" min={1} step={1} {...fieldProps("codigoLugarProduccion")} />
                            {error("codigoLugarProduccion")}
                        </Field>
                    </div>
                    <p className="text-[12.5px] text-ink-muted">Las frutas, exámenes y certificados se gestionan desde el detalle del proveedor.</p>
                </FormSection>
            </div>
        </AppModal>
    );
}
