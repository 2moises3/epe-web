import { useRef, useState } from "react";
import { X, UserPlus, Save, AlertCircle } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm } from "@/shared/hooks/useModalForm";
import FormField from "@/shared/components/FormField";
import InputField from "@/shared/components/InputField";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { createClienteNegocio, updateClienteNegocio } from "@/modules/clients/api/cliente-negocio.api";
import type { ClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.dto";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import { toClienteNegocioInput, validateClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.validation";
import { createInFlightGuard } from "@/modules/clients/api/in-flight-guard";
import { submitValidatedClienteNegocio } from "@/modules/clients/api/client-submission";

const CLIENT_TYPES = [
    { value: "exportador", label: "Exportador" },
    { value: "industria", label: "Industria" },
];

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
            title={isEdit ? "Editar Cliente" : "Registrar Cliente"}
            description={isEdit
                ? "Modifica la información del cliente existente. Los campos con * son obligatorios."
                : "Completa la información para registrar un nuevo cliente. Los campos con * son obligatorios."}
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSubmit} disabled={isSaving} aria-busy={isSaving}>
                        {isSaving ? "Guardando..." : isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> Guardar</>
                            : <><UserPlus size={20} strokeWidth={2.5} /> Crear Cliente</>}
                    </Button>
                </>
            }
        >
            {requestError && (
                <Alert variant="destructive" className="mb-5">
                    <AlertCircle />
                    <AlertDescription>{requestError}</AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6" aria-busy={isSaving}>
                <InputField id="client-company" label="Empresa:" className="sm:col-span-2" required value={values.nombreEmpresa} onChange={set("nombreEmpresa")} error={fieldError("nombreEmpresa") || undefined} />
                <InputField id="client-contact" label="Nombre de contacto:" required value={values.nombreContacto} onChange={set("nombreContacto")} error={fieldError("nombreContacto") || undefined} />
                <InputField id="client-phone" label="Teléfono:" required value={values.telefono} onChange={set("telefono")} error={fieldError("telefono") || undefined} />
                <InputField id="client-ruc" label="RUC:" required value={values.ruc} onChange={set("ruc")} error={fieldError("ruc") || undefined} />
                <InputField id="client-email" label="Correo corporativo:" type="email" required value={values.correoCorporativo} onChange={set("correoCorporativo")} error={fieldError("correoCorporativo") || undefined} />
                <InputField id="client-location" label="Ubicación:" required value={values.ubicacion} onChange={set("ubicacion")} error={fieldError("ubicacion") || undefined} />
                <FormField id="client-type" label="Tipo de cliente:" required error={fieldError("tipoCliente") || undefined}>
                    <Select items={CLIENT_TYPES} value={values.tipoCliente || null} onValueChange={(value) => set("tipoCliente")((value ?? "") as ClienteNegocioInput["tipoCliente"])}>
                        <SelectTrigger id="client-type" className="w-full" aria-required="true" aria-invalid={Boolean(fieldError("tipoCliente"))} aria-describedby={fieldError("tipoCliente") ? "client-type-error" : undefined}>
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exportador">Exportador</SelectItem>
                            <SelectItem value="industria">Industria</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>
            </div>
        </AppModal>
    );
}
