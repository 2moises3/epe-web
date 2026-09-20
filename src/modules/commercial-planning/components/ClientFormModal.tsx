import { useState } from "react";
import { X, UserPlus, Save } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { createClienteNegocio, updateClienteNegocio } from "@/modules/clients/api/cliente-negocio.api";
import type { TipoCliente } from "@/modules/clients/api/cliente-negocio.dto";
import { clientFormSchema } from "@/modules/clients/api/client-form.schema";
import { getBadRequestFieldErrors, getZodFieldErrors, type FormFieldErrors } from "@/shared/validation/api-form-errors";
import FieldError from "@/shared/components/FieldError";

export interface ClientFormValues {
    name: string;
    empresa: string;
    telefono: string;
    ruc: string;
    email: string;
    ubicacion: string;
    tipo: TipoCliente | "";
}

const EMPTY_CLIENT: ClientFormValues = {
    name: "", empresa: "", telefono: "", ruc: "", email: "", ubicacion: "", tipo: "",
};

interface ClientFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<ClientFormValues>;
    clientId?: number;
}

/** Alta y edición de un cliente: mismos campos, solo cambian los textos y los valores iniciales. */
export default function ClientFormModal({
    open,
    onOpenChange,
    onSuccess,
    mode = "create",
    initialValues,
    clientId,
}: ClientFormModalProps) {
    const isEdit = mode === "edit";
    // Al abrir y al cerrar vuelve a los valores de origen: en alta queda vacío, en edición carga el cliente
    const [values, , set] = useModalForm<ClientFormValues>(open, { ...EMPTY_CLIENT, ...initialValues });
    const [errors, setErrors] = useState<FormFieldErrors>({});
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const validation = clientFormSchema.safeParse(values);
        if (!validation.success) {
            setErrors(getZodFieldErrors(validation.error));
            return;
        }
        setSaving(true);
        setErrors({});
        try {
            const payload = {
                nombreContacto: values.name.trim(),
                nombreEmpresa: values.empresa.trim(),
                telefono: values.telefono.trim(),
                ruc: values.ruc.trim(),
                correoCorporativo: values.email.trim(),
                ubicacion: values.ubicacion.trim(),
                tipoCliente: validation.data.tipo,
            };
            if (isEdit && clientId) await updateClienteNegocio(clientId, payload);
            else await createClienteNegocio(payload);
            onSuccess?.();
        } catch (requestError) {
            setErrors(getBadRequestFieldErrors(requestError, {
                nombreContacto: "name", nombreEmpresa: "empresa", telefono: "telefono", ruc: "ruc",
                correoCorporativo: "email", ubicacion: "ubicacion", tipoCliente: "tipo",
            }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Editar Cliente" : "Registrar Cliente"}
            description={isEdit
                ? "Modifica la información del cliente existente."
                : "Completa la información para registrar un nuevo cliente."}
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSave} disabled={saving}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> Guardar</>
                            : <><UserPlus size={20} strokeWidth={2.5} /> Crear Cliente</>}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Field className="sm:col-span-2">
                    <FieldLabel>Nombres Completos:</FieldLabel>
                    <Input value={values.name} onChange={(e) => { set("name")(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }} />
                    <FieldError message={errors.name} />
                </Field>

                <Field>
                    <FieldLabel>Empresa:</FieldLabel>
                    <Input value={values.empresa} onChange={(e) => { set("empresa")(e.target.value); setErrors((p) => ({ ...p, empresa: undefined })); }} />
                    <FieldError message={errors.empresa} />
                </Field>
                <Field>
                    <FieldLabel>Teléfono:</FieldLabel>
                    <Input value={values.telefono} onChange={(e) => { set("telefono")(e.target.value); setErrors((p) => ({ ...p, telefono: undefined })); }} />
                    <FieldError message={errors.telefono} />
                </Field>

                <Field>
                    <FieldLabel>RUC:</FieldLabel>
                    <Input value={values.ruc} onChange={(e) => { set("ruc")(e.target.value); setErrors((p) => ({ ...p, ruc: undefined })); }} />
                    <FieldError message={errors.ruc} />
                </Field>
                <Field>
                    <FieldLabel>Correo Corporativo:</FieldLabel>
                    <Input value={values.email} onChange={(e) => { set("email")(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }} />
                    <FieldError message={errors.email} />
                </Field>

                <Field>
                    <FieldLabel>Ubicación:</FieldLabel>
                    <Input value={values.ubicacion} onChange={(e) => { set("ubicacion")(e.target.value); setErrors((p) => ({ ...p, ubicacion: undefined })); }} />
                    <FieldError message={errors.ubicacion} />
                </Field>
                <Field>
                    <FieldLabel>Tipo de Cliente:</FieldLabel>
                    <Select value={values.tipo} onValueChange={(v) => { set("tipo")(v ?? ""); setErrors((p) => ({ ...p, tipo: undefined })); }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exportador">Exportador</SelectItem>
                            <SelectItem value="industria">Industria</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError message={errors.tipo} />
                </Field>
            </div>
            {errors._form && <p role="alert" className="mt-4 text-sm text-red-600">{errors._form}</p>}
        </AppModal>
    );
}
