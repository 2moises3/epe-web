import { useState } from "react";
import { Save, UserPlus, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import type { ProveedorInput } from "@/modules/providers/api/proveedor.dto";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import type { ProveedorField, ProveedorFieldErrors } from "@/modules/providers/api/proveedor.validation";
import { validateProveedorInput } from "@/modules/providers/api/proveedor.validation";
import { createProviderFormSession } from "@/modules/providers/api/provider-lifecycle";
import { createInFlightGuard, submitValidatedProveedor } from "@/modules/providers/api/proveedor-submission";

interface ProviderFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "create" | "edit";
    provider?: Proveedor | null;
    mutationGuard: ReturnType<typeof createInFlightGuard>;
    onSave: (providerId: number | null, input: ProveedorInput) => Promise<Proveedor>;
}

export default function ProviderFormModal({ open, onOpenChange, mode = "create", provider, mutationGuard, onSave }: ProviderFormModalProps) {
    const isEdit = mode === "edit";
    const initialSession = createProviderFormSession(provider);
    const [values, , set] = useModalForm(open, initialSession.values);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<ProveedorFieldErrors>(initialSession.errors);
    const [saveError, setSaveError] = useState<string | null>(initialSession.saveError);

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
            if (result.status === "invalid") {
                setErrors(result.errors);
                return;
            }
            if (result.status === "busy") return;
            onOpenChange(false);
        } catch {
            setSaveError("No se pudieron guardar los cambios. Revisa la información e intenta nuevamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const fieldError = (field: ProveedorField) => errors[field] ? <FieldError id={`${field}-error`}>{errors[field]}</FieldError> : null;
    const fieldProps = (field: ProveedorField) => ({
        "aria-invalid": Boolean(errors[field]),
        "aria-describedby": errors[field] ? `${field}-error` : undefined,
        "aria-required": true,
        required: true,
    });

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<UserPlus size={22} strokeWidth={2} />}
            title={isEdit ? "Editar proveedor" : "Registrar proveedor"}
            description="Completa los campos obligatorios según el registro de proveedores."
            className="sm:max-w-225"
            footer={
                <>
                    <Button variant="outline" size="xl" disabled={isSaving} onClick={() => handleOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" disabled={isSaving} onClick={handleSubmit} aria-busy={isSaving}>
                        {isSaving ? "Guardando…" : isEdit ? <><Save size={20} strokeWidth={2.5} /> Guardar</> : <><UserPlus size={20} strokeWidth={2.5} /> Crear proveedor</>}
                    </Button>
                </>
            }
        >
            <p className="mb-4 text-sm text-ink-muted"><span aria-hidden="true">*</span> Campos obligatorios.</p>
            {saveError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field data-invalid={Boolean(errors.nombres)}>
                    <FieldLabel htmlFor="provider-nombres">Nombres <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-nombres" value={values.nombres} onChange={(event) => updateField("nombres", event.target.value)} maxLength={150} {...fieldProps("nombres")} />{fieldError("nombres")}
                </Field>
                <Field data-invalid={Boolean(errors.apellido)}>
                    <FieldLabel htmlFor="provider-apellido">Apellidos <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-apellido" value={values.apellido} onChange={(event) => updateField("apellido", event.target.value)} maxLength={150} {...fieldProps("apellido")} />{fieldError("apellido")}
                </Field>
                <Field data-invalid={Boolean(errors.tipoDocumento)}>
                    <FieldLabel htmlFor="provider-tipo-documento">Tipo de documento <span aria-hidden="true">*</span></FieldLabel>
                    <Select value={values.tipoDocumento} onValueChange={(value) => updateField("tipoDocumento", value ?? "")}>
                        <SelectTrigger id="provider-tipo-documento" aria-required="true" aria-invalid={Boolean(errors.tipoDocumento)} aria-describedby={errors.tipoDocumento ? "tipoDocumento-error" : undefined}>
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DNI">DNI</SelectItem>
                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                            <SelectItem value="Carnet de extranjeria">Carnet de extranjería</SelectItem>
                        </SelectContent>
                    </Select>{fieldError("tipoDocumento")}
                </Field>
                <Field data-invalid={Boolean(errors.nmrDocumento)}>
                    <FieldLabel htmlFor="provider-documento">Número de documento <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-documento" type="number" min={1} step={1} value={values.nmrDocumento} onChange={(event) => updateField("nmrDocumento", event.target.value)} {...fieldProps("nmrDocumento")} />{fieldError("nmrDocumento")}
                </Field>
                <Field data-invalid={Boolean(errors.identidadDocUrl)}>
                    <FieldLabel htmlFor="provider-identidad-url">URL del documento de identidad <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-identidad-url" type="url" value={values.identidadDocUrl} onChange={(event) => updateField("identidadDocUrl", event.target.value)} {...fieldProps("identidadDocUrl")} />{fieldError("identidadDocUrl")}
                </Field>
                <Field data-invalid={Boolean(errors.zona)}>
                    <FieldLabel htmlFor="provider-zona">Zona <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-zona" value={values.zona} onChange={(event) => updateField("zona", event.target.value)} {...fieldProps("zona")} />{fieldError("zona")}
                </Field>
                <Field data-invalid={Boolean(errors.telefono)}>
                    <FieldLabel htmlFor="provider-telefono">Teléfono <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-telefono" type="number" min={1} step={1} value={values.telefono} onChange={(event) => updateField("telefono", event.target.value)} {...fieldProps("telefono")} />{fieldError("telefono")}
                </Field>
                <Field data-invalid={Boolean(errors.email)}>
                    <FieldLabel htmlFor="provider-email">Correo electrónico <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-email" type="email" maxLength={320} value={values.email} onChange={(event) => updateField("email", event.target.value)} {...fieldProps("email")} />{fieldError("email")}
                </Field>
                <Field data-invalid={Boolean(errors.codigoLugarProduccion)}>
                    <FieldLabel htmlFor="provider-codigo">Código de lugar de producción <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="provider-codigo" type="number" min={1} step={1} value={values.codigoLugarProduccion} onChange={(event) => updateField("codigoLugarProduccion", event.target.value)} {...fieldProps("codigoLugarProduccion")} />{fieldError("codigoLugarProduccion")}
                </Field>
            </div>
        </AppModal>
    );
}
