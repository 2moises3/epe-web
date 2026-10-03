import { useEffect, useRef, useState, type FormEvent } from "react";
import { Users, UserCheck, ShoppingBag, Pencil, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement> | React.MouseEvent) => {
        if ('preventDefault' in event) event.preventDefault();
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

    const activeCount = clients.length;
    const totalReq = clients.reduce((total, client) => total + client.cantidadKg, 0);

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<Users size={22} strokeWidth={2} />}
            title="Gestión de Clientes"
            description="Clientes comerciales vinculados a esta campaña."
            className="sm:max-w-[700px]"
            footer={
                <Button variant="outline" size="xl" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                    <X size={20} strokeWidth={2.5} /> Cerrar
                </Button>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Stats Header */}
                <div className="grid grid-cols-3 gap-3 bg-surface-page rounded-xl p-3 border border-border">
                    <div className="flex flex-col gap-1 px-3">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Clientes vinculados</span>
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-brand" />
                            <span className="text-lg font-black text-ink">{clients.length}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 px-3 border-l border-border">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Clientes activos</span>
                        <div className="flex items-center gap-2">
                            <UserCheck size={16} className="text-status-success" />
                            <span className="text-lg font-black text-ink">{activeCount}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 px-3 border-l border-border">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Requerimientos</span>
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={16} className="text-brand" />
                            <span className="text-lg font-black text-ink">{totalReq.toLocaleString()} kg</span>
                        </div>
                    </div>
                </div>

                {isLoading && <p className="text-[13px] text-ink-muted">Cargando clientes...</p>}
                {loadError && <p className="text-[13px] text-destructive">{loadError}</p>}
                {!isLoading && !loadError && clients.length === 0 && (
                    <p className="text-[13px] text-ink-muted">Esta campaña aún no tiene clientes vinculados.</p>
                )}

                {/* Client List */}
                <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {clients.map((client) => (
                        <div key={client.clienteNegocioCampanaId} className="flex flex-col gap-3 pb-5 border-b border-border last:border-0 last:pb-0">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-full bg-brand-surface border border-brand/20 flex items-center justify-center shrink-0">
                                    <span className="text-[16px] font-bold text-brand">{client.clienteNegocio?.nombreEmpresa?.charAt(0)?.toUpperCase() ?? "?"}</span>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <h4 className="text-[14.5px] font-bold text-ink">{client.clienteNegocio?.nombreEmpresa ?? "-"}</h4>
                                            <p className="text-[12px] text-brand font-semibold">
                                                {client.clienteNegocio ? TIPO_CLIENTE_LABEL[client.clienteNegocio.tipoCliente] ?? client.clienteNegocio.tipoCliente : "-"}
                                            </p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" disabled={isSaving || isLoading} onClick={() => handleEdit(client)}>
                                            <Pencil size={14} className="mr-1.5" aria-hidden="true" /> Editar relación
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-muted font-medium mt-1">
                                        <span>{client.clienteNegocio?.nombreContacto ?? "-"}</span>
                                        <span className="text-border">·</span>
                                        <span>{client.clienteNegocio?.correoCorporativo ?? "-"}</span>
                                        <span className="text-border">·</span>
                                        <span className="text-ink font-bold">{client.cantidadKg} kg actuales</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[12px] mt-1.5">
                                        <a href={client.documentoUrl} target="_blank" rel="noreferrer" className="text-brand underline hover:text-brand-dark">Doc. requerimientos</a>
                                        <a href={client.fichaTecnicaUrl} target="_blank" rel="noreferrer" className="text-brand underline hover:text-brand-dark">Ficha técnica</a>
                                    </div>
                                </div>
                            </div>

                            {editingId === client.clienteNegocioCampanaId && values && (
                                <form className="grid grid-cols-1 gap-4 rounded-xl border border-brand/20 bg-brand-surface/30 p-5 sm:grid-cols-2 mt-2" onSubmit={handleSubmit} noValidate>
                                    <p className="sm:col-span-2 text-xs text-ink-muted mb-1">Los campos son opcionales según el contrato de actualización. Completa solo los que quieras cambiar.</p>
                                    
                                    <Field label="Documento de requerimientos URL" id="client-document-url" error={fieldErrors.documentoUrl}>
                                        <Input id="client-document-url" type="url" value={values.documentoUrl} disabled={isSaving} aria-invalid={Boolean(fieldErrors.documentoUrl)} aria-describedby={fieldErrors.documentoUrl ? "client-document-url-error" : undefined} onChange={(event) => updateField("documentoUrl", event.target.value)} className="bg-white" />
                                    </Field>
                                    
                                    <Field label="Ficha técnica URL" id="client-technical-url" error={fieldErrors.fichaTecnicaUrl}>
                                        <Input id="client-technical-url" type="url" value={values.fichaTecnicaUrl} disabled={isSaving} aria-invalid={Boolean(fieldErrors.fichaTecnicaUrl)} aria-describedby={fieldErrors.fichaTecnicaUrl ? "client-technical-url-error" : undefined} onChange={(event) => updateField("fichaTecnicaUrl", event.target.value)} className="bg-white" />
                                    </Field>

                                    <Field label="Cantidad kg" id="client-quantity" error={fieldErrors.cantidadKg}>
                                        <Input id="client-quantity" type="number" min="0" step="0.001" value={values.cantidadKg} disabled={isSaving} aria-invalid={Boolean(fieldErrors.cantidadKg)} aria-describedby={fieldErrors.cantidadKg ? "client-quantity-error" : undefined} onChange={(event) => updateField("cantidadKg", event.target.value)} className="bg-white" />
                                    </Field>
                                    
                                    <Field label="Kilos acordados" id="client-agreed-kilos" error={fieldErrors.kilosAcordados}>
                                        <Input id="client-agreed-kilos" type="number" min="0" step="0.001" value={values.kilosAcordados} disabled={isSaving} aria-invalid={Boolean(fieldErrors.kilosAcordados)} aria-describedby={fieldErrors.kilosAcordados ? "client-agreed-kilos-error" : undefined} onChange={(event) => updateField("kilosAcordados", event.target.value)} className="bg-white" />
                                    </Field>

                                    <Field label="Fecha de registro" id="client-registration-date" error={fieldErrors.fechaRegistro}>
                                        <Input id="client-registration-date" type="date" value={values.fechaRegistro} disabled={isSaving} aria-invalid={Boolean(fieldErrors.fechaRegistro)} aria-describedby={fieldErrors.fechaRegistro ? "client-registration-date-error" : undefined} onChange={(event) => updateField("fechaRegistro", event.target.value)} className="bg-white" />
                                    </Field>

                                    {requestError && <p role="alert" className="sm:col-span-2 text-sm text-destructive">{requestError}</p>}
                                    <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                                        <Button type="button" variant="outline" disabled={isSaving} onClick={() => { setEditingId(null); setValues(null); setFieldErrors({}); setRequestError(null); }}>Cancelar edición</Button>
                                        <Button type="button" onClick={handleSubmit} disabled={isSaving} aria-busy={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>

                {(info || success) && (
                    <div className="flex flex-col gap-1 pt-2">
                        {info && <p role="status" aria-live="polite" className="text-[13px] font-medium text-ink-muted">{info}</p>}
                        {success && <p role="status" aria-live="polite" className="text-[13px] font-medium text-brand">{success}</p>}
                    </div>
                )}
            </div>
        </AppModal>
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
