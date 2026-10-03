import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Users, ShoppingBag, Scale, Pencil, Trash2, Save, X, ExternalLink, AlertCircle } from "lucide-react";
import CampaignDirectoryModal from "@/modules/campaigns/components/CampaignDirectoryModal";
import CampaignDirectoryTable, { DirectoryIdentity, DirectoryContact } from "@/modules/campaigns/components/CampaignDirectoryTable";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import ConfirmModal from "@/shared/components/ConfirmModal";
import FileDropzone from "@/shared/components/FileDropzone";
import FormSection from "@/shared/components/FormSection";
import RowActions from "@/shared/components/RowActions";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { getUploadErrorMessage, uploadDocument } from "@/shared/api/uploadDocument";
import { getCampana } from "@/modules/campaigns/api/campaign.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import {
    deleteClienteNegocioCampana,
    getClientesNegocioCampana,
    updateClienteNegocioCampana,
} from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";
import {
    createCampaignMutationGuard,
    hasCampaignClientChanges,
    toCampaignClientUpdatePayload,
    validateCampaignClientUpdate,
    type CampaignClientFieldErrors,
    type CampaignClientUpdateValues,
} from "@/modules/campaigns/api/campaign-mutations.validation";
import { formatFecha } from "@/modules/campaigns/api/fecha.util";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";

interface CampaignManagementClientsModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
}

const TIPO_CLIENTE_LABEL: Record<string, string> = {
    exportador: "Exportador",
    industria: "Industria",
};

const EDIT_FIELDS: Array<{ field: keyof CampaignClientUpdateValues; label: string; type: "number" | "date" }> = [
    { field: "cantidadKg", label: "Cantidad kg", type: "number" },
    { field: "kilosAcordados", label: "Kilos acordados", type: "number" },
    { field: "fechaRegistro", label: "Fecha de registro", type: "date" },
];

type DocumentField = "documentoUrl" | "fichaTecnicaUrl";
type DocumentFiles = Record<DocumentField, File | null>;
const NO_FILES: DocumentFiles = { documentoUrl: null, fichaTecnicaUrl: null };

function toUpdateValues(client: ClienteNegocioCampana): CampaignClientUpdateValues {
    return {
        documentoUrl: client.documentoUrl,
        fechaRegistro: formatFecha(client.fechaRegistro),
        fichaTecnicaUrl: client.fichaTecnicaUrl,
        cantidadKg: String(client.cantidadKg),
        kilosAcordados: String(client.kilosAcordados),
    };
}

const clientName = (client: ClienteNegocioCampana) => client.clienteNegocio?.nombreEmpresa ?? "Cliente";

/** Clientes vinculados a la campaña: consultar, editar los datos del vínculo y quitarlo. */
export default function CampaignManagementClientsModal({ open, campaniaId, onOpenChange }: CampaignManagementClientsModalProps) {
    const [campaign, setCampaign] = useState<Campana | null>(null);
    const [clients, setClients] = useState<ClienteNegocioCampana[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [editing, setEditing] = useState<{ client: ClienteNegocioCampana; values: CampaignClientUpdateValues } | null>(null);
    // Archivos nuevos al editar: son opcionales, sin elegir uno se conserva el documento actual
    const [newFiles, setNewFiles] = useState<DocumentFiles>(NO_FILES);
    const [fieldErrors, setFieldErrors] = useState<CampaignClientFieldErrors>({});
    const [formMessage, setFormMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [removing, setRemoving] = useState<{ open: boolean; client: ClienteNegocioCampana | null }>({ open: false, client: null });
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const guard = useRef(createCampaignMutationGuard());

    // Cada apertura es una sesión nueva con la campaña y sus clientes recién leídos
    useEffect(() => {
        if (!open || !campaniaId) return;
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        setLoadError(null);
        setEditing(null);
        setFieldErrors({});
        setFormMessage(null);
        setRemoveError(null);
        Promise.all([getCampana(campaniaId), getClientesNegocioCampana(campaniaId)])
            .then(([campana, relations]) => {
                if (!active) return;
                setCampaign(campana);
                setClients(relations);
            })
            .catch(() => { if (active) setLoadError("No se pudieron cargar los clientes de esta campaña."); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [open, campaniaId]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSaving) return;
        onOpenChange(nextOpen);
    };

    const startEdit = (client: ClienteNegocioCampana) => {
        setEditing({ client, values: toUpdateValues(client) });
        setNewFiles(NO_FILES);
        setFieldErrors({});
        setFormMessage(null);
    };

    const cancelEdit = () => {
        setEditing(null);
        setNewFiles(NO_FILES);
        setFieldErrors({});
        setFormMessage(null);
    };

    const updateFile = (field: DocumentField, file: File | null) => {
        setNewFiles((current) => ({ ...current, [field]: file }));
        setFormMessage(null);
    };

    const updateField = (field: keyof CampaignClientUpdateValues, value: string) => {
        setEditing((current) => (current ? { ...current, values: { ...current.values, [field]: value } } : current));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        setFormMessage(null);
    };

    const handleSave = async () => {
        if (!campaniaId || !editing || !guard.current.acquire()) return;
        const original = toUpdateValues(editing.client);
        const errors = validateCampaignClientUpdate(editing.values, original);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            guard.current.release();
            return;
        }
        if (!hasCampaignClientChanges(editing.values, original) && !newFiles.documentoUrl && !newFiles.fichaTecnicaUrl) {
            setFormMessage({ tone: "info", text: "No hay cambios para guardar." });
            guard.current.release();
            return;
        }
        setIsSaving(true);
        try {
            // El backend guarda enlaces: los archivos nuevos se suben primero y su URL reemplaza a la actual
            const values = { ...editing.values };
            try {
                if (newFiles.documentoUrl) values.documentoUrl = await uploadDocument(newFiles.documentoUrl);
                if (newFiles.fichaTecnicaUrl) values.fichaTecnicaUrl = await uploadDocument(newFiles.fichaTecnicaUrl);
            } catch (uploadError) {
                setFormMessage({ tone: "error", text: getUploadErrorMessage(uploadError) });
                return;
            }
            const updated = await updateClienteNegocioCampana(campaniaId, editing.client.clienteNegocioCampanaId, toCampaignClientUpdatePayload(values));
            setClients((current) => current.map((client) => (client.clienteNegocioCampanaId === updated.clienteNegocioCampanaId ? updated : client)));
            setEditing(null);
            setIsSuccessOpen(true);
        } catch {
            setFormMessage({ tone: "error", text: "No se pudo actualizar el vínculo. Revisa los datos e intenta nuevamente." });
        } finally {
            guard.current.release();
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        const client = removing.client;
        if (!campaniaId || !client || !guard.current.acquire()) return;
        setRemoveError(null);
        try {
            await deleteClienteNegocioCampana(campaniaId, client.clienteNegocioCampanaId);
            setClients((current) => current.filter((item) => item.clienteNegocioCampanaId !== client.clienteNegocioCampanaId));
            if (editing?.client.clienteNegocioCampanaId === client.clienteNegocioCampanaId) setEditing(null);
        } catch {
            setRemoveError(`No se pudo quitar a ${clientName(client)} de la campaña.`);
        } finally {
            guard.current.release();
        }
    };

    const totalKg = clients.reduce((total, client) => total + (Number(client.cantidadKg) || 0), 0);
    const totalAgreed = clients.reduce((total, client) => total + (Number(client.kilosAcordados) || 0), 0);

    return (
        <>
            <CampaignDirectoryModal
                open={open}
                onOpenChange={handleOpenChange}
                title="Gestión de Clientes"
                campaign={campaign}
                description="Clientes comerciales vinculados a esta campaña."
                icon={Users}
                empty={!isLoading && !loadError && clients.length === 0}
                stats={[
                    { label: "Clientes", value: clients.length, icon: Users, hint: "vinculados" },
                    { label: "Cantidad requerida", value: `${formatCampaignNumber(totalKg)} kg`, icon: ShoppingBag, hint: "en total" },
                    { label: "Kilos acordados", value: `${formatCampaignNumber(totalAgreed)} kg`, icon: Scale, hint: "en contratos" },
                ]}
            >
                {loadError && (
                    <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[13px] font-medium text-destructive">
                        <AlertCircle size={16} className="shrink-0" /> {loadError}
                    </p>
                )}
                {removeError && (
                    <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[13px] font-medium text-destructive">
                        <AlertCircle size={16} className="shrink-0" /> {removeError}
                    </p>
                )}

                {editing && (
                    <div className="mb-5 rounded-2xl border border-brand-border bg-brand-surface/40 p-4">
                        <FormSection icon={<Pencil size={16} strokeWidth={2.5} />} title={`Editar vínculo con ${clientName(editing.client)}`} aside="Solo se guardan los campos que cambies">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {EDIT_FIELDS.slice(0, 3).map(({ field, label, type }) => (
                                    <Field key={field} data-invalid={fieldErrors[field] ? true : undefined}>
                                        <FieldLabel htmlFor={`client-relation-${field}`}>{label}:</FieldLabel>
                                        <Input
                                            id={`client-relation-${field}`}
                                            type={type}
                                            min={type === "number" ? 0 : undefined}
                                            step={type === "number" ? "0.001" : undefined}
                                            value={editing.values[field]}
                                            disabled={isSaving}
                                            aria-invalid={fieldErrors[field] ? true : undefined}
                                            onChange={(event) => updateField(field, event.target.value)}
                                        />
                                        {fieldErrors[field] && <FieldError>{fieldErrors[field]}</FieldError>}
                                    </Field>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FileDropzone
                                    label="Requerimientos"
                                    hint="Opcional: reemplaza el archivo actual · PDF, Excel"
                                    file={newFiles.documentoUrl}
                                    onChange={(file) => updateFile("documentoUrl", file)}
                                />
                                <FileDropzone
                                    label="Ficha Técnica"
                                    hint="Opcional: reemplaza el archivo actual · PDF, Excel"
                                    file={newFiles.fichaTecnicaUrl}
                                    onChange={(file) => updateFile("fichaTecnicaUrl", file)}
                                />
                            </div>
                            {formMessage && (
                                <p role={formMessage.tone === "error" ? "alert" : "status"} className={`text-[13px] font-medium ${formMessage.tone === "error" ? "text-destructive" : "text-ink-muted"}`}>
                                    {formMessage.text}
                                </p>
                            )}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
                                    <X size={18} strokeWidth={2.5} /> Cancelar
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving} aria-busy={isSaving}>
                                    <Save size={18} strokeWidth={2.5} /> {isSaving ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </div>
                        </FormSection>
                    </div>
                )}

                {isLoading ? (
                    <p role="status" className="py-8 text-center text-sm text-ink-muted">Cargando clientes...</p>
                ) : (
                    <CampaignDirectoryTable
                        label="clientes"
                        columns={["Cliente", "Requerimiento", "Documentos", "Contacto comercial", "Acciones"]}
                        rows={clients.map((client, index) => ({
                            id: client.clienteNegocioCampanaId,
                            name: clientName(client),
                            category: client.clienteNegocio ? TIPO_CLIENTE_LABEL[client.clienteNegocio.tipoCliente] ?? client.clienteNegocio.tipoCliente : "—",
                            search: `${client.clienteNegocio?.nombreContacto ?? ""} ${client.clienteNegocio?.correoCorporativo ?? ""}`,
                            cells: [
                                <DirectoryIdentity
                                    name={clientName(client)}
                                    subtitle={client.clienteNegocio ? TIPO_CLIENTE_LABEL[client.clienteNegocio.tipoCliente] ?? client.clienteNegocio.tipoCliente : "—"}
                                    index={index}
                                />,
                                <div>
                                    <strong className="whitespace-nowrap text-sm text-ink">{formatCampaignNumber(Number(client.cantidadKg))} kg</strong>
                                    <p className="mt-1 text-[10px]">{formatCampaignNumber(Number(client.kilosAcordados))} kg acordados · {format(client.fechaRegistro, "dd/MM/yyyy")}</p>
                                </div>,
                                <div className="flex flex-col gap-1 text-[11px]">
                                    <a href={client.documentoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                                        Requerimientos <ExternalLink size={11} aria-hidden="true" />
                                    </a>
                                    <a href={client.fichaTecnicaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                                        Ficha técnica <ExternalLink size={11} aria-hidden="true" />
                                    </a>
                                </div>,
                                <DirectoryContact
                                    name={client.clienteNegocio?.nombreContacto ?? "—"}
                                    value={client.clienteNegocio?.correoCorporativo ?? "—"}
                                    href={`mailto:${client.clienteNegocio?.correoCorporativo ?? ""}`}
                                />,
                                <RowActions
                                    primary={[
                                        { label: "Editar vínculo", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => startEdit(client) },
                                        { label: "Quitar de la campaña", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: () => setRemoving({ open: true, client }) },
                                    ]}
                                />,
                            ],
                        }))}
                    />
                )}
            </CampaignDirectoryModal>

            <ConfirmModal
                open={removing.open}
                onOpenChange={(nextOpen) => setRemoving((current) => ({ ...current, open: nextOpen }))}
                icon={<Trash2 size={28} strokeWidth={2.25} />}
                title="¿Quitar cliente de la campaña?"
                description={<>Se quitará a <strong className="font-bold text-ink">{removing.client ? clientName(removing.client) : ""}</strong> de esta campaña junto con su requerimiento. El cliente seguirá registrado en Planificación Comercial.</>}
                confirmLabel="Sí, quitar"
                onConfirm={() => void handleRemove()}
            />

            <CampaignSuccessModal open={isSuccessOpen} onOpenChange={setIsSuccessOpen} mode="edit" />
        </>
    );
}
