import { useEffect, useRef, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { FileText, Trash2, X, Save, Pencil } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import {
    createCertificadoCampana,
    deleteCertificadoCampana,
    getCertificadosCampana,
    updateCertificadoCampana,
} from "@/modules/campaigns/api/certificado-campana.api";
import type { CampaignCertificateFieldErrors, CampaignCertificateValues } from "@/modules/campaigns/api/campaign-mutations.validation";
import {
    createCampaignMutationGuard,
    hasCampaignCertificateChanges,
    toCampaignCertificatePayload,
    toCampaignCertificateUpdatePayload,
    validateCampaignCertificate,
} from "@/modules/campaigns/api/campaign-mutations.validation";
import { formatFecha } from "@/modules/campaigns/api/fecha.util";
import type { CertificadoCampana } from "@/modules/campaigns/api/certificado-campana.mapper";

const CERTIFICATION_TYPES = ["Global GAP", "Fairtrade (Comercio Justo)", "Orgánica", "Rainforest Alliance"];

interface CampaignCertificationsModalProps {
    open: boolean;
    campaniaId: number | null;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const EMPTY_FORM: CampaignCertificateValues = {
    nombre: "",
    documentoUrl: "",
    reciboUrl: "",
    costo: "",
    fechaVencimiento: "",
    estado: "",
};

const STATUS_LABELS = {
    vigente: "Vigente",
    "por vencer": "Por vencer",
    vencida: "Vencida",
} as const;

function toFormValues(certificate: CertificadoCampana): CampaignCertificateValues {
    return {
        nombre: certificate.nombre,
        documentoUrl: certificate.documentoUrl,
        reciboUrl: certificate.reciboUrl,
        costo: String(certificate.costo),
        fechaVencimiento: formatFecha(certificate.fechaVencimiento),
        estado: certificate.estado,
    };
}

export default function CampaignCertificationsModal({ open, campaniaId, onOpenChange, onSuccess }: CampaignCertificationsModalProps) {
    const [certificados, setCertificados] = useState<CertificadoCampana[]>([]);
    const [values, setValues] = useState<CampaignCertificateValues>(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState<CampaignCertificateFieldErrors>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const guard = useRef(createCampaignMutationGuard());

    useEffect(() => {
        let active = true;
        if (!open || campaniaId === null) {
            return () => { active = false; };
        }

        getCertificadosCampana(campaniaId)
            .then((items) => { if (active) setCertificados(items); })
            .catch(() => { if (active) setLoadError("No se pudieron cargar las certificaciones de esta campaña."); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [open, campaniaId]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSaving) return;
        onOpenChange(nextOpen);
    };

    const updateField = (field: keyof CampaignCertificateValues, value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        setRequestError(null);
        setSuccess(null);
        setInfo(null);
    };

    const startCreate = () => {
        setValues(EMPTY_FORM);
        setEditingId(null);
        setFieldErrors({});
        setRequestError(null);
        setSuccess(null);
        setInfo(null);
    };

    const startEdit = (certificate: CertificadoCampana) => {
        setValues(toFormValues(certificate));
        setEditingId(certificate.certificadoId);
        setFieldErrors({});
        setRequestError(null);
        setSuccess(null);
        setInfo(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement> | React.MouseEvent) => {
        if ('preventDefault' in event) event.preventDefault();
        if (campaniaId === null || isLoading || !guard.current.acquire()) return;
        const originalCertificate = editingId === null
            ? undefined
            : certificados.find((certificate) => certificate.certificadoId === editingId);
        if (editingId !== null && !originalCertificate) {
            guard.current.release();
            setRequestError("No se encontró la certificación. Recarga la lista e intenta nuevamente.");
            return;
        }
        const original = originalCertificate ? toFormValues(originalCertificate) : undefined;
        const errors = validateCampaignCertificate(values, editingId !== null, original);
        setFieldErrors(errors);
        setRequestError(null);
        setSuccess(null);
        setInfo(null);
        if (Object.keys(errors).length > 0) {
            guard.current.release();
            return;
        }
        if (editingId !== null && original && !hasCampaignCertificateChanges(values, original)) {
            setInfo("No hay cambios para guardar.");
            guard.current.release();
            return;
        }

        setIsSaving(true);
        try {
            if (editingId === null) {
                const created = await createCertificadoCampana(campaniaId, toCampaignCertificatePayload(values));
                setCertificados((current) => [...current, created]);
                setSuccess("La certificación se registró correctamente.");
            } else {
                const updated = await updateCertificadoCampana(campaniaId, editingId, toCampaignCertificateUpdatePayload(values));
                setCertificados((current) => current.map((certificate) => certificate.certificadoId === updated.certificadoId ? updated : certificate));
                setSuccess("La certificación se actualizó correctamente.");
            }
            setValues(EMPTY_FORM);
            setEditingId(null);
            setFieldErrors({});
            onSuccess?.();
        } catch {
            setRequestError("No se pudo guardar la certificación. Revisa los datos e intenta nuevamente.");
        } finally {
            guard.current.release();
            setIsSaving(false);
        }
    };

    const handleDelete = async (certificadoId: number) => {
        if (campaniaId === null || !guard.current.acquire()) return;
        setIsSaving(true);
        setRequestError(null);
        setSuccess(null);
        setInfo(null);
        try {
            await deleteCertificadoCampana(campaniaId, certificadoId);
            setCertificados((current) => current.filter((certificate) => certificate.certificadoId !== certificadoId));
            if (editingId === certificadoId) startCreate();
            setSuccess("La certificación se eliminó correctamente.");
        } catch {
            setRequestError("No se pudo eliminar la certificación. Intenta nuevamente.");
        } finally {
            guard.current.release();
            setIsSaving(false);
        }
    };

    const required = editingId === null;

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<FileText size={22} strokeWidth={2} />}
            title="Registrar Certificación"
            description="Añade los documentos de certificación necesarios para esta campaña."
            className="sm:max-w-[700px]"
            footer={
                <>
                    <Button type="button" variant="outline" size="xl" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                        <X size={20} strokeWidth={2.5} /> Cerrar
                    </Button>
                    <Button type="button" size="xl" onClick={handleSubmit} disabled={isSaving || isLoading || campaniaId === null}>
                        <Save size={20} strokeWidth={2.5} /> {isSaving ? "Guardando..." : editingId === null ? "Registrar" : "Guardar"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Certificados registrados */}
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <FieldLabel>Certificados Registrados:</FieldLabel>
                    </div>
                    
                    {isLoading && <p className="text-[13px] text-ink-muted">Cargando certificaciones...</p>}
                    {loadError && <p className="text-[13px] text-destructive">{loadError}</p>}
                    
                    {!isLoading && !loadError && certificados.length === 0 ? (
                        <p className="text-[13px] text-ink-muted">Esta campaña aún no tiene certificados registrados.</p>
                    ) : (
                        <ul className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                            {certificados.map((certificado) => (
                                <li
                                    key={certificado.certificadoId}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5 bg-white"
                                >
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[13.5px] font-bold text-ink truncate">{certificado.nombre}</span>
                                        <span className="text-[11.5px] text-ink-muted">
                                            Vence: {format(certificado.fechaVencimiento, "dd/MM/yyyy")} · {STATUS_LABELS[certificado.estado]}
                                        </span>
                                        <a
                                            href={certificado.documentoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[11.5px] text-brand underline truncate hover:text-brand-dark"
                                        >
                                            Ver documento
                                        </a>
                                    </div>
                                    <div className="flex shrink-0 gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(certificado)}
                                            disabled={isSaving || isLoading}
                                            className="hover:bg-brand-surface hover:text-brand rounded-full p-1.5 transition-colors text-ink-muted shrink-0 disabled:opacity-50"
                                        >
                                            <Pencil size={16} strokeWidth={2} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleDelete(certificado.certificadoId)}
                                            disabled={isSaving || isLoading}
                                            className="hover:bg-destructive/10 hover:text-destructive rounded-full p-1.5 transition-colors text-ink-muted shrink-0 disabled:opacity-50"
                                        >
                                            <Trash2 size={16} strokeWidth={2} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                    <h3 className="text-sm font-bold text-ink">{editingId === null ? "Nueva certificación" : "Editar certificación"}</h3>
                    {editingId !== null && (
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" disabled={isSaving} onClick={startCreate}>
                            Cancelar edición
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <Field>
                        <FieldLabel>Certificación:{required && <span className="text-destructive">*</span>}</FieldLabel>
                        <Select value={values.nombre} onValueChange={(value) => updateField("nombre", value ?? "")} disabled={isSaving}>
                            <SelectTrigger className="w-full !h-11 rounded-lg border-border shadow-none text-ink font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {CERTIFICATION_TYPES.map((type) => (
                                    <SelectItem key={type} value={type} className="rounded-lg">{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldErrors.nombre && <p className="text-xs text-destructive mt-1">{fieldErrors.nombre}</p>}
                    </Field>

                    <Field>
                        <FieldLabel>Fecha Vencimiento:{required && <span className="text-destructive">*</span>}</FieldLabel>
                        <Input
                            type="date"
                            value={values.fechaVencimiento}
                            onChange={(event) => updateField("fechaVencimiento", event.target.value)}
                            disabled={isSaving}
                        />
                        {fieldErrors.fechaVencimiento && <p className="text-xs text-destructive mt-1">{fieldErrors.fechaVencimiento}</p>}
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <Field>
                        <FieldLabel>Costo:{required && <span className="text-destructive">*</span>}</FieldLabel>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={values.costo}
                            onChange={(event) => updateField("costo", event.target.value)}
                            disabled={isSaving}
                        />
                        {fieldErrors.costo && <p className="text-xs text-destructive mt-1">{fieldErrors.costo}</p>}
                    </Field>

                    <Field>
                        <FieldLabel>Estado:{required && <span className="text-destructive">*</span>}</FieldLabel>
                        <Select value={values.estado} onValueChange={(value) => updateField("estado", value ?? "")} disabled={isSaving}>
                            <SelectTrigger className="w-full !h-11 rounded-lg border-border shadow-none text-ink font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vigente">Vigente</SelectItem>
                                <SelectItem value="por vencer">Por vencer</SelectItem>
                                <SelectItem value="vencida">Vencida</SelectItem>
                            </SelectContent>
                        </Select>
                        {fieldErrors.estado && <p className="text-xs text-destructive mt-1">{fieldErrors.estado}</p>}
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <Field>
                        <FieldLabel>URL del documento:{required && <span className="text-destructive">*</span>}</FieldLabel>
                        <Input
                            type="url"
                            value={values.documentoUrl}
                            onChange={(event) => updateField("documentoUrl", event.target.value)}
                            disabled={isSaving}
                        />
                        {fieldErrors.documentoUrl && <p className="text-xs text-destructive mt-1">{fieldErrors.documentoUrl}</p>}
                    </Field>
                    
                    <Field>
                        <FieldLabel>URL del recibo:{required && <span className="text-destructive">*</span>}</FieldLabel>
                        <Input
                            type="url"
                            value={values.reciboUrl}
                            onChange={(event) => updateField("reciboUrl", event.target.value)}
                            disabled={isSaving}
                        />
                        {fieldErrors.reciboUrl && <p className="text-xs text-destructive mt-1">{fieldErrors.reciboUrl}</p>}
                    </Field>
                </div>

                {(requestError || info || success) && (
                    <div className="flex flex-col gap-1">
                        {requestError && <p role="alert" className="text-sm text-destructive font-medium">{requestError}</p>}
                        {info && <p role="status" aria-live="polite" className="text-sm text-ink-muted font-medium">{info}</p>}
                        {success && <p role="status" aria-live="polite" className="text-sm text-brand font-medium">{success}</p>}
                    </div>
                )}
            </div>
        </AppModal>
    );
}
