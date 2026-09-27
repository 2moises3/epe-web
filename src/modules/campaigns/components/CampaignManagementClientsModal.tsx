import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { getClientesNegocioCampana, updateClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { CampaignClientUpdateValues } from "@/modules/campaigns/api/campaign-mutations.validation";
import {
    createCampaignMutationGuard,
    hasCampaignClientChanges,
    toCampaignClientUpdatePayload,
    validateCampaignClientUpdate,
} from "@/modules/campaigns/api/campaign-mutations.validation";
import type { CampaignClientFieldErrors } from "@/modules/campaigns/api/campaign-mutations.validation";
import { formatFecha } from "@/modules/campaigns/api/fecha.util";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";

interface CampaignManagementClientsModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
}

const TIPO_CLIENTE_LABEL: Record<string, string> = {
    exportador: "Exportador",
    industria: "Industria",
};

function toUpdateValues(client: ClienteNegocioCampana): CampaignClientUpdateValues {
    return {
        documentoUrl: client.documentoUrl,
        fechaRegistro: formatFecha(client.fechaRegistro),
        fichaTecnicaUrl: client.fichaTecnicaUrl,
        cantidadKg: String(client.cantidadKg),
        kilosAcordados: String(client.kilosAcordados),
    };
}

function CampaignManagementClientsModalContent({ open, campaniaId, onOpenChange }: CampaignManagementClientsModalProps) {
    const [clients, setClients] = useState<ClienteNegocioCampana[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [values, setValues] = useState<CampaignClientUpdateValues | null>(null);
    const [fieldErrors, setFieldErrors] = useState<CampaignClientFieldErrors>({});
    const [requestError, setRequestError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const guard = useRef(createCampaignMutationGuard());

    useEffect(() => {
        let active = true;
        if (!open || !campaniaId) {
            return () => { active = false; };
        }

        getClientesNegocioCampana(campaniaId)
            .then((items) => { if (active) setClients(items); })
            .catch(() => { if (active) setLoadError("No se pudieron cargar los clientes de esta campaña."); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [open, campaniaId]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSaving) return;
        onOpenChange(nextOpen);
    };

    const handleEdit = (client: ClienteNegocioCampana) => {
        setEditingId(client.clienteNegocioCampanaId);
        setValues(toUpdateValues(client));
        setFieldErrors({});
        setRequestError(null);
        setSuccess(null);
        setInfo(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!campaniaId || editingId === null || !values || !guard.current.acquire()) return;
        const client = clients.find((item) => item.clienteNegocioCampanaId === editingId);
        if (!client) {
            guard.current.release();
            setRequestError("No se encontró la relación del cliente. Recarga la lista e intenta nuevamente.");
            return;
        }
        const original = toUpdateValues(client);
        const errors = validateCampaignClientUpdate(values, original);
        setFieldErrors(errors);
        setRequestError(null);
        setSuccess(null);
        setInfo(null);
        if (Object.keys(errors).length > 0) {
            guard.current.release();
            return;
        }
        if (!hasCampaignClientChanges(values, original)) {
            setInfo("No hay cambios para guardar.");
            guard.current.release();
            return;
        }

        setIsSaving(true);
        try {
            const updated = await updateClienteNegocioCampana(
                campaniaId,
                editingId,
                toCampaignClientUpdatePayload(values),
            );
            setClients((current) => current.map((client) =>
                client.clienteNegocioCampanaId === updated.clienteNegocioCampanaId ? updated : client,
            ));
            setEditingId(null);
            setValues(null);
            setSuccess("La relación del cliente se actualizó correctamente.");
        } catch {
            setRequestError("No se pudo actualizar la relación. Revisa los datos e intenta nuevamente.");
        } finally {
            guard.current.release();
            setIsSaving(false);
        }
    };

    const updateField = (field: keyof CampaignClientUpdateValues, value: string) => {
        setValues((current) => current ? { ...current, [field]: value } : current);
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        setRequestError(null);
        setInfo(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[600px] md:max-w-3xl p-8 rounded-2xl bg-white border-none shadow-2xl gap-6" aria-busy={isSaving || isLoading}>
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-[22px] font-bold text-ink">Gestión de Clientes</DialogTitle>
                    <p className="text-[13px] font-medium text-ink-muted">{clients.length} clientes registrados</p>
                </DialogHeader>

                {isLoading && <p role="status" className="text-sm text-ink-muted">Cargando clientes...</p>}
                {loadError && <p role="alert" className="text-sm text-destructive">{loadError}</p>}
                {!isLoading && !loadError && clients.length === 0 && (
                    <p className="text-[13px] text-ink-muted">Esta campaña aún no tiene clientes vinculados.</p>
                )}

                <div className="flex flex-col gap-6 mt-2 max-h-[400px] overflow-y-auto pr-2">
                    {clients.map((client) => (
                        <div key={client.clienteNegocioCampanaId} className="flex flex-col gap-3 pb-6 border-b border-border last:border-0 last:pb-0">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center shrink-0">
                                    <span className="text-[15px] font-bold text-brand">{client.clienteNegocio?.nombreEmpresa?.charAt(0)?.toUpperCase() ?? "?"}</span>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <h4 className="text-[14px] font-bold text-ink">{client.clienteNegocio?.nombreEmpresa ?? "-"}</h4>
                                            <p className="text-[12px] text-muted-foreground font-medium">
                                                {client.clienteNegocio ? TIPO_CLIENTE_LABEL[client.clienteNegocio.tipoCliente] ?? client.clienteNegocio.tipoCliente : "-"}
                                            </p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" disabled={isSaving || isLoading} onClick={() => handleEdit(client)}>
                                            <Pencil aria-hidden="true" /> Editar relación
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-[12px] text-ink-muted font-medium mt-1">
                                        <span>{client.clienteNegocio?.nombreContacto ?? "-"}</span>
                                        <span className="text-border">·</span>
                                        <span>{client.clienteNegocio?.correoCorporativo ?? "-"}</span>
                                        <span className="text-border">·</span>
                                        <span>{client.cantidadKg} kg actuales</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs">
                                        <a href={client.documentoUrl} target="_blank" rel="noreferrer" className="text-brand underline">Documento de requerimientos</a>
                                        <a href={client.fichaTecnicaUrl} target="_blank" rel="noreferrer" className="text-brand underline">Ficha técnica</a>
                                    </div>
                                </div>
                            </div>

                            {editingId === client.clienteNegocioCampanaId && values && (
                                <form className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface-page p-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
                                    <p className="sm:col-span-2 text-xs text-ink-muted">Los campos son opcionales según el contrato de actualización. Completa solo los que quieras cambiar.</p>
                                    <Field label="Documento de requerimientos URL" id="client-document-url" error={fieldErrors.documentoUrl}>
                                        <Input id="client-document-url" type="url" value={values.documentoUrl} disabled={isSaving} aria-invalid={Boolean(fieldErrors.documentoUrl)} aria-describedby={fieldErrors.documentoUrl ? "client-document-url-error" : undefined} onChange={(event) => updateField("documentoUrl", event.target.value)} />
                                    </Field>
                                    <Field label="Fecha de registro" id="client-registration-date" error={fieldErrors.fechaRegistro}>
                                        <Input id="client-registration-date" type="date" value={values.fechaRegistro} disabled={isSaving} aria-invalid={Boolean(fieldErrors.fechaRegistro)} aria-describedby={fieldErrors.fechaRegistro ? "client-registration-date-error" : undefined} onChange={(event) => updateField("fechaRegistro", event.target.value)} />
                                    </Field>
                                    <Field label="Ficha técnica URL" id="client-technical-url" error={fieldErrors.fichaTecnicaUrl}>
                                        <Input id="client-technical-url" type="url" value={values.fichaTecnicaUrl} disabled={isSaving} aria-invalid={Boolean(fieldErrors.fichaTecnicaUrl)} aria-describedby={fieldErrors.fichaTecnicaUrl ? "client-technical-url-error" : undefined} onChange={(event) => updateField("fichaTecnicaUrl", event.target.value)} />
                                    </Field>
                                    <Field label="Cantidad kg" id="client-quantity" error={fieldErrors.cantidadKg}>
                                        <Input id="client-quantity" type="number" min="0" step="0.001" value={values.cantidadKg} disabled={isSaving} aria-invalid={Boolean(fieldErrors.cantidadKg)} aria-describedby={fieldErrors.cantidadKg ? "client-quantity-error" : undefined} onChange={(event) => updateField("cantidadKg", event.target.value)} />
                                    </Field>
                                    <Field label="Kilos acordados" id="client-agreed-kilos" error={fieldErrors.kilosAcordados}>
                                        <Input id="client-agreed-kilos" type="number" min="0" step="0.001" value={values.kilosAcordados} disabled={isSaving} aria-invalid={Boolean(fieldErrors.kilosAcordados)} aria-describedby={fieldErrors.kilosAcordados ? "client-agreed-kilos-error" : undefined} onChange={(event) => updateField("kilosAcordados", event.target.value)} />
                                    </Field>
                                    {requestError && <p role="alert" className="sm:col-span-2 text-sm text-destructive">{requestError}</p>}
                                    <div className="sm:col-span-2 flex justify-end gap-2">
                                        <Button type="button" variant="outline" disabled={isSaving} onClick={() => { setEditingId(null); setValues(null); setFieldErrors({}); setRequestError(null); }}>Cancelar edición</Button>
                                        <Button type="submit" disabled={isSaving} aria-busy={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
                {info && <p role="status" aria-live="polite" className="text-sm text-ink-muted">{info}</p>}
                {success && <p role="status" aria-live="polite" className="text-sm text-brand">{success}</p>}
            </DialogContent>
        </Dialog>
    );
}

export default function CampaignManagementClientsModal(props: CampaignManagementClientsModalProps) {
    const key = `${props.campaniaId ?? "invalid"}-${props.open ? "open" : "closed"}`;
    return <CampaignManagementClientsModalContent key={key} {...props} />;
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-xs font-semibold text-ink">{label}</label>
            {children}
            {error && <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
