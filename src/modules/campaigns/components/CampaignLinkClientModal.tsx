import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { X, Users, FileSignature } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import FileDropzone from "@/shared/components/FileDropzone";
import FormField from "@/shared/components/FormField";
import InputField from "@/shared/components/InputField";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import { getUploadErrorMessage, uploadDocument } from "@/shared/api/uploadDocument";
import { getClientesNegocio } from "@/modules/clients/api/cliente-negocio.api";
import { getClienteNegocioContratos } from "@/modules/clients/api/cliente-negocio-contratos.api";
import { getCampanas } from "@/modules/campaigns/api/campaign.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import { createClienteNegocioCampana, getClientesNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import {
    createCampaignMutationGuard,
    toCampaignClientCreatePayload,
    validateCampaignClientCreate,
    type CampaignClientCreateErrors,
    type CampaignClientCreateValues,
} from "@/modules/campaigns/api/campaign-mutations.validation";

interface CampaignLinkClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Se llama solo cuando el backend confirmó el vínculo */
    onSave?: () => void;
    /** Desde una campaña: la campaña queda fija y se elige el cliente */
    campaniaId?: number | null;
    /** Desde un cliente ("Añadir contrato"): el cliente queda fijo y se elige la campaña */
    cliente?: ClienteNegocio | null;
}

const emptyValues = (clienteNegocioId = ""): CampaignClientCreateValues => ({
    clienteNegocioId,
    cantidadKg: "",
    kilosAcordados: "",
    fechaRegistro: format(new Date(), "yyyy-MM-dd"),
    documentoUrl: "",
    fichaTecnicaUrl: "",
});

type DocumentField = "documentoUrl" | "fichaTecnicaUrl";
type DocumentFiles = Record<DocumentField, File | null>;
const NO_FILES: DocumentFiles = { documentoUrl: null, fichaTecnicaUrl: null };

/** Marcador para validar el resto del formulario antes de subir: los archivos reales se validan aparte y se suben al guardar */
const UPLOAD_PENDING_URL = "https://pending-upload.invalid";

const CAMPAIGN_STATUS_LABEL: Record<string, string> = { planificacion: "Planificado", "en proceso": "En proceso", terminado: "Terminado" };

/**
 * Vínculo cliente-campaña (contrato) con su requerimiento. Sirve desde la campaña (se elige el cliente)
 * o desde el cliente (se elige la campaña). Un vínculo por envío, con éxito solo tras confirmar el backend.
 */
export default function CampaignLinkClientModal({ open, onOpenChange, onSave, campaniaId = null, cliente = null }: CampaignLinkClientModalProps) {
    const isContractMode = cliente !== null;
    const [values, setValues] = useState<CampaignClientCreateValues>(emptyValues);
    const [errors, setErrors] = useState<CampaignClientCreateErrors>({});
    const [files, setFiles] = useState<DocumentFiles>(NO_FILES);
    const [formError, setFormError] = useState<string | null>(null);
    const [clientes, setClientes] = useState<ClienteNegocio[]>([]);
    const [campanas, setCampanas] = useState<Campana[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState("");
    const [campaignError, setCampaignError] = useState<string | undefined>();
    // Ids ya vinculados del otro lado: clientes de la campaña, o campañas del cliente
    const [linkedIds, setLinkedIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const guard = useRef(createCampaignMutationGuard());

    const clienteId = cliente?.clienteNegocioId ?? null;

    // Cada apertura es una sesión nueva: formulario limpio y catálogo recién leído
    useEffect(() => {
        if (!open) return;
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValues(emptyValues(clienteId !== null ? String(clienteId) : ""));
        setFiles(NO_FILES);
        setSelectedCampaignId("");
        setCampaignError(undefined);
        setErrors({});
        setFormError(null);
        setIsLoading(true);

        const request = clienteId !== null
            ? Promise.all([getCampanas(), getClienteNegocioContratos(clienteId)]).then(([campaigns, contracts]) => {
                if (!active) return;
                setCampanas(campaigns.filter((campaign) => campaign.estado !== "terminado"));
                setLinkedIds(new Set(contracts.contratos.map((contract) => contract.campaniaId)));
            })
            : Promise.all([
                getClientesNegocio(),
                campaniaId ? getClientesNegocioCampana(campaniaId) : Promise.resolve([]),
            ]).then(([catalog, relations]) => {
                if (!active) return;
                setClientes(catalog);
                setLinkedIds(new Set(relations.map((relation) => relation.clienteNegocioId)));
            });

        request
            .catch(() => { if (active) setFormError("No se pudieron cargar los datos del formulario. Cierra y vuelve a abrirlo."); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [open, campaniaId, clienteId]);

    const update = (field: keyof CampaignClientCreateValues, value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setFormError(null);
    };

    const updateFile = (field: DocumentField, file: File | null) => {
        setFiles((current) => ({ ...current, [field]: file }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setFormError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSaving) return;
        onOpenChange(nextOpen);
    };

    const targetCampaignId = isContractMode ? Number(selectedCampaignId) || null : campaniaId;

    const handleSubmit = async () => {
        if (isSaving) return;
        const validation = validateCampaignClientCreate({ ...values, documentoUrl: UPLOAD_PENDING_URL, fichaTecnicaUrl: UPLOAD_PENDING_URL });
        if (!files.documentoUrl) validation.documentoUrl = isContractMode ? "Adjunta el contrato." : "Adjunta el documento de requerimientos.";
        if (!files.fichaTecnicaUrl) validation.fichaTecnicaUrl = "Adjunta la ficha técnica.";
        const missingCampaign = targetCampaignId === null ? "Selecciona una campaña." : undefined;
        setCampaignError(missingCampaign);
        if (Object.keys(validation).length > 0 || missingCampaign || targetCampaignId === null || !files.documentoUrl || !files.fichaTecnicaUrl) {
            setErrors(validation);
            setFormError("Revisa los campos marcados antes de vincular.");
            return;
        }
        if (!guard.current.acquire()) return;
        setIsSaving(true);
        setFormError(null);
        try {
            // El backend guarda enlaces: primero se suben los archivos y recién entonces se registra el vínculo
            let urls: Pick<CampaignClientCreateValues, DocumentField>;
            try {
                urls = {
                    documentoUrl: await uploadDocument(files.documentoUrl),
                    fichaTecnicaUrl: await uploadDocument(files.fichaTecnicaUrl),
                };
            } catch (uploadError) {
                setFormError(getUploadErrorMessage(uploadError));
                return;
            }
            await createClienteNegocioCampana(targetCampaignId, toCampaignClientCreatePayload({ ...values, ...urls }));
            onSave?.();
        } catch {
            setFormError("No se pudo vincular el cliente. Revisa los datos e inténtalo nuevamente.");
        } finally {
            guard.current.release();
            setIsSaving(false);
        }
    };

    const campaignOptions = campanas
        .filter((campaign) => !linkedIds.has(campaign.campaniaId))
        .map((campaign) => ({ value: String(campaign.campaniaId), label: `${campaign.nombre} · ${CAMPAIGN_STATUS_LABEL[campaign.estado] ?? campaign.estado}` }));

    const clientOptions = clientes
        .filter((cliente) => !linkedIds.has(cliente.clienteNegocioId))
        .map((cliente) => ({ value: String(cliente.clienteNegocioId), label: cliente.nombreEmpresa }));

    /** Props comunes de un campo de texto del formulario: id, valor, error y cambio enlazados al estado */
    const bind = (field: keyof CampaignClientCreateValues) => ({
        id: `link-client-${field}`,
        required: true,
        value: values[field],
        error: errors[field],
        disabled: isSaving,
        onChange: (next: string) => update(field, next),
    });

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={isContractMode ? <FileSignature size={22} strokeWidth={2} /> : <Users size={22} strokeWidth={2} />}
            title={isContractMode ? "Añadir Contrato" : "Vincular Cliente"}
            description={isContractMode
                ? `Vincula a ${cliente?.nombreEmpresa ?? "este cliente"} con una campaña y registra su contrato. Los campos con * son obligatorios.`
                : "Registra el cliente y su requerimiento para esta campaña. Los campos con * son obligatorios."}
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSubmit} disabled={isSaving || isLoading || (!isContractMode && !campaniaId)} aria-busy={isSaving}>
                        {isContractMode ? <FileSignature size={20} strokeWidth={2.5} /> : <Users size={20} strokeWidth={2.5} />}
                        {isSaving ? "Guardando..." : isContractMode ? "Añadir contrato" : "Vincular cliente"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-5">
                {/* Cliente + Cantidad */}
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_10rem] gap-4 items-start">
                    {isContractMode ? (
                        <FormField label="Seleccionar Campaña:" required error={campaignError}>
                            <Combobox
                                options={campaignOptions}
                                value={selectedCampaignId}
                                onChange={(value) => { setSelectedCampaignId(value); setCampaignError(undefined); setFormError(null); }}
                                placeholder={isLoading ? "Cargando campañas..." : "Selecciona una campaña"}
                                emptyMessage="No hay campañas disponibles para este cliente"
                                disabled={isLoading || isSaving}
                            />
                        </FormField>
                    ) : (
                        <FormField label="Seleccionar Cliente:" required error={errors.clienteNegocioId}>
                            <Combobox
                                options={clientOptions}
                                value={values.clienteNegocioId}
                                onChange={(value) => update("clienteNegocioId", value)}
                                placeholder={isLoading ? "Cargando clientes..." : "Selecciona un cliente"}
                                emptyMessage="No hay clientes disponibles para vincular"
                                disabled={isLoading || isSaving}
                            />
                        </FormField>
                    )}

                    <InputField {...bind("cantidadKg")} label="Cantidad kg:" step="0.001" min={0} placeholder="0" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField {...bind("kilosAcordados")} label="Kilos acordados:" step="0.001" min={0} placeholder="0" />
                    <InputField id="link-client-fechaRegistro" type="date" label="Fecha de registro:" required value={String(values.fechaRegistro || "")} error={errors.fechaRegistro} onChange={(val) => update("fechaRegistro", val)} />
                </div>

                {/* Adjuntar */}
                <FormField error={errors.documentoUrl}>
                    <FileDropzone
                        label={isContractMode ? "Contrato" : "Requerimientos"}
                        hint={isContractMode ? "PDF · Máx. 10 MB" : "PDF, Excel · Máx. 10 MB"}
                        file={files.documentoUrl}
                        onChange={(file) => updateFile("documentoUrl", file)}
                    />
                </FormField>

                <FormField error={errors.fichaTecnicaUrl}>
                    <FileDropzone
                        label="Ficha Técnica"
                        hint="PDF, Excel · Máx. 10 MB"
                        file={files.fichaTecnicaUrl}
                        onChange={(file) => updateFile("fichaTecnicaUrl", file)}
                    />
                </FormField>

                {/* Error general del formulario (no de un campo); solo se dibuja si existe, para que no afecte el gap */}
                {formError && <FormField error={formError} />}
            </div>
        </AppModal>
    );
}
