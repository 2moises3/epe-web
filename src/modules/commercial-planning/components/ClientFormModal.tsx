import { useRef, useState } from "react";
import { X, UserPlus, Save } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { createClienteNegocio, updateClienteNegocio } from "@/modules/clients/api/cliente-negocio.api";
import type { ClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.dto";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import { toClienteNegocioInput, validateClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.validation";
import { createInFlightGuard } from "@/modules/clients/api/in-flight-guard";
import { submitValidatedClienteNegocio } from "@/modules/clients/api/client-submission";

const EMPTY_CLIENT: ClienteNegocioInput = {
    nombreEmpresa: "", nombreContacto: "", telefono: "", ruc: "",
    correoCorporativo: "", ubicacion: "", tipoCliente: "" as ClienteNegocioInput["tipoCliente"],
};

interface ClientFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (client: ClienteNegocio) => void;
    mode?: "create" | "edit";
    clientId?: number;
    initialValues?: Partial<ClienteNegocioInput>;
}

export default function ClientFormModal({
    open, onOpenChange, onSuccess, mode = "create", clientId, initialValues,
}: ClientFormModalProps) {
    const isEdit = mode === "edit";
    const [values, , set] = useModalForm<ClienteNegocioInput>(open, { ...EMPTY_CLIENT, ...initialValues });
    const formIdentity = `${open}:${mode}:${clientId ?? "new"}`;
    const [feedback, setFeedback] = useState<{
        identity: string;
        errors: Partial<Record<keyof ClienteNegocioInput, string>>;
        requestError: string | null;
    }>({ identity: "", errors: {}, requestError: null });
    const [isSaving, setIsSaving] = useState(false);
    const savingGuard = useRef(createInFlightGuard());
    const errors = feedback.identity === formIdentity ? feedback.errors : {};
    const requestError = feedback.identity === formIdentity ? feedback.requestError : null;

    const handleOpenChange = (nextOpen: boolean) => {
        if (savingGuard.current.isInFlight) return;
        setFeedback({ identity: "", errors: {}, requestError: null });
        onOpenChange(nextOpen);
    };

    const handleSubmit = async () => {
        const input = toClienteNegocioInput(values);
        let requestStarted = false;
        setFeedback({ identity: formIdentity, errors: {}, requestError: null });
        try {
            const result = await submitValidatedClienteNegocio(
                input,
                validateClienteNegocioInput,
                savingGuard.current,
                (validatedInput) => isEdit && clientId
                    ? updateClienteNegocio(clientId, validatedInput)
                    : createClienteNegocio(validatedInput),
                () => {
                    requestStarted = true;
                    setIsSaving(true);
                },
            );
            if (result.status === "invalid") {
                setFeedback({ identity: formIdentity, errors: result.errors, requestError: null });
                return;
            }
            if (result.status === "busy") return;
            onSuccess?.(result.value);
        } catch {
            setFeedback({ identity: formIdentity, errors: {}, requestError: "No se pudo guardar el cliente. Verifica la conexión e inténtalo nuevamente." });
        } finally {
            if (requestStarted) setIsSaving(false);
        }
    };

    const fieldError = (field: keyof ClienteNegocioInput) => errors[field];

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<UserPlus size={22} strokeWidth={2} />}
            title={isEdit ? "Editar cliente" : "Registrar cliente"}
            description={isEdit ? "Actualiza la información del cliente." : "Completa los datos para registrar un cliente."}
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSubmit} disabled={isSaving} aria-busy={isSaving}>
                        {isSaving ? "Guardando..." : isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> Guardar cambios</>
                            : <><UserPlus size={20} strokeWidth={2.5} /> Crear cliente</>}
                    </Button>
                </>
            }
        >
            <p className="mb-4 text-sm text-ink-muted">Los campos con <span aria-hidden="true" className="font-bold text-destructive">*</span> son obligatorios.</p>
            {requestError && <p role="alert" className="mb-4 text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6" aria-busy={isSaving}>
                <Field className="sm:col-span-2" data-invalid={Boolean(fieldError("nombreEmpresa"))}>
                    <FieldLabel htmlFor="client-company">Empresa <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="client-company" value={values.nombreEmpresa} onChange={(e) => set("nombreEmpresa")(e.target.value)} required aria-invalid={Boolean(fieldError("nombreEmpresa"))} aria-describedby={fieldError("nombreEmpresa") ? "client-company-error" : undefined} />
                    {fieldError("nombreEmpresa") && <p id="client-company-error" className="text-sm text-destructive">{fieldError("nombreEmpresa")}</p>}
                </Field>
                <Field data-invalid={Boolean(fieldError("nombreContacto"))}>
                    <FieldLabel htmlFor="client-contact">Nombre de contacto <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="client-contact" value={values.nombreContacto} onChange={(e) => set("nombreContacto")(e.target.value)} required aria-invalid={Boolean(fieldError("nombreContacto"))} aria-describedby={fieldError("nombreContacto") ? "client-contact-error" : undefined} />
                    {fieldError("nombreContacto") && <p id="client-contact-error" className="text-sm text-destructive">{fieldError("nombreContacto")}</p>}
                </Field>
                <Field data-invalid={Boolean(fieldError("telefono"))}>
                    <FieldLabel htmlFor="client-phone">Teléfono <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="client-phone" value={values.telefono} onChange={(e) => set("telefono")(e.target.value)} required aria-invalid={Boolean(fieldError("telefono"))} aria-describedby={fieldError("telefono") ? "client-phone-error" : undefined} />
                    {fieldError("telefono") && <p id="client-phone-error" className="text-sm text-destructive">{fieldError("telefono")}</p>}
                </Field>
                <Field data-invalid={Boolean(fieldError("ruc"))}>
                    <FieldLabel htmlFor="client-ruc">RUC <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="client-ruc" value={values.ruc} onChange={(e) => set("ruc")(e.target.value)} required aria-invalid={Boolean(fieldError("ruc"))} aria-describedby={fieldError("ruc") ? "client-ruc-error" : undefined} />
                    {fieldError("ruc") && <p id="client-ruc-error" className="text-sm text-destructive">{fieldError("ruc")}</p>}
                </Field>
                <Field data-invalid={Boolean(fieldError("correoCorporativo"))}>
                    <FieldLabel htmlFor="client-email">Correo corporativo <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="client-email" type="email" value={values.correoCorporativo} onChange={(e) => set("correoCorporativo")(e.target.value)} required aria-invalid={Boolean(fieldError("correoCorporativo"))} aria-describedby={fieldError("correoCorporativo") ? "client-email-error" : undefined} />
                    {fieldError("correoCorporativo") && <p id="client-email-error" className="text-sm text-destructive">{fieldError("correoCorporativo")}</p>}
                </Field>
                <Field data-invalid={Boolean(fieldError("ubicacion"))}>
                    <FieldLabel htmlFor="client-location">Ubicación <span aria-hidden="true">*</span></FieldLabel>
                    <Input id="client-location" value={values.ubicacion} onChange={(e) => set("ubicacion")(e.target.value)} required aria-invalid={Boolean(fieldError("ubicacion"))} aria-describedby={fieldError("ubicacion") ? "client-location-error" : undefined} />
                    {fieldError("ubicacion") && <p id="client-location-error" className="text-sm text-destructive">{fieldError("ubicacion")}</p>}
                </Field>
                <Field data-invalid={Boolean(fieldError("tipoCliente"))}>
                    <FieldLabel htmlFor="client-type">Tipo de cliente <span aria-hidden="true">*</span></FieldLabel>
                    <Select value={values.tipoCliente} onValueChange={(value) => set("tipoCliente")((value ?? "") as ClienteNegocioInput["tipoCliente"])}>
                        <SelectTrigger id="client-type" className="w-full" aria-required="true" aria-invalid={Boolean(fieldError("tipoCliente"))} aria-describedby={fieldError("tipoCliente") ? "client-type-error" : undefined}>
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exportador">Exportador</SelectItem>
                            <SelectItem value="industria">Industria</SelectItem>
                        </SelectContent>
                    </Select>
                    {fieldError("tipoCliente") && <p id="client-type-error" className="text-sm text-destructive">{fieldError("tipoCliente")}</p>}
                </Field>
            </div>
        </AppModal>
    );
}
