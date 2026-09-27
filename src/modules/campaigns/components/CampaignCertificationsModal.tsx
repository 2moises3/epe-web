import { useEffect, useRef, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { FileText, Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[500px] sm:max-w-2xl p-8 rounded-2xl bg-white border-none shadow-2xl gap-0" aria-busy={isSaving || isLoading}>
                <DialogHeader className="mb-6">
                    <div className="flex items-start gap-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                            <FileText size={24} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-ink">Gestionar certificaciones de campaña</DialogTitle>
                            <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                Registra los datos y enlaces de los documentos; este formulario no carga archivos.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {isLoading && <p role="status" className="mb-4 text-sm text-ink-muted">Cargando certificaciones...</p>}
                {loadError && <p role="alert" className="mb-4 text-sm text-destructive">{loadError}</p>}
                {!isLoading && !loadError && certificados.length === 0 && (
                    <p className="mb-4 text-[13px] text-gray-500">Esta campaña aún no tiene certificados registrados.</p>
                )}
                {!isLoading && !loadError && certificados.length > 0 && (
                    <ul className="mb-6 flex max-h-52 flex-col gap-2 overflow-y-auto">
                        {certificados.map((certificado) => (
                            <li key={certificado.certificadoId} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-2.5">
                                <div className="flex min-w-0 flex-col overflow-hidden">
                                    <span className="truncate text-[13.5px] font-bold text-[#1a2f22]">{certificado.nombre}</span>
                                    <span className="text-[11.5px] text-gray-500">Vence: {format(certificado.fechaVencimiento, "dd/MM/yyyy")} · {STATUS_LABELS[certificado.estado]}</span>
                                    <a href={certificado.documentoUrl} target="_blank" rel="noreferrer" className="truncate text-[11.5px] text-[#5D9634] underline">Ver documento</a>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <Button type="button" variant="outline" size="icon-sm" aria-label={`Editar ${certificado.nombre}`} disabled={isSaving || isLoading} onClick={() => startEdit(certificado)}>
                                        <Pencil aria-hidden="true" />
                                    </Button>
                                    <Button type="button" variant="destructive" size="icon-sm" aria-label={`Eliminar ${certificado.nombre}`} disabled={isSaving || isLoading} onClick={() => void handleDelete(certificado.certificadoId)}>
                                        <Trash2 aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-ink">{editingId === null ? "Nueva certificación" : "Editar certificación"}</h3>
                        {editingId !== null && <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={startCreate}>Cancelar edición</Button>}
                    </div>
                    {required && <p className="text-xs text-ink-muted">Los campos marcados con <span aria-hidden="true" className="text-destructive">*</span> son obligatorios.</p>}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Nombre" id="certificate-name" error={fieldErrors.nombre} required={required}>
                            <Input id="certificate-name" value={values.nombre} maxLength={255} required={required} aria-required={required} aria-invalid={Boolean(fieldErrors.nombre)} aria-describedby={fieldErrors.nombre ? "certificate-name-error" : undefined} disabled={isSaving} onChange={(event) => updateField("nombre", event.target.value)} />
                        </Field>
                        <Field label="Costo" id="certificate-cost" error={fieldErrors.costo} required={required}>
                            <Input id="certificate-cost" type="number" min="0" step="0.01" value={values.costo} required={required} aria-required={required} aria-invalid={Boolean(fieldErrors.costo)} aria-describedby={fieldErrors.costo ? "certificate-cost-error" : undefined} disabled={isSaving} onChange={(event) => updateField("costo", event.target.value)} />
                        </Field>
                        <Field label="URL del documento" id="certificate-document-url" error={fieldErrors.documentoUrl} required={required}>
                            <Input id="certificate-document-url" type="url" value={values.documentoUrl} required={required} aria-required={required} aria-invalid={Boolean(fieldErrors.documentoUrl)} aria-describedby={fieldErrors.documentoUrl ? "certificate-document-url-error" : undefined} disabled={isSaving} onChange={(event) => updateField("documentoUrl", event.target.value)} />
                        </Field>
                        <Field label="URL del recibo" id="certificate-receipt-url" error={fieldErrors.reciboUrl} required={required}>
                            <Input id="certificate-receipt-url" type="url" value={values.reciboUrl} required={required} aria-required={required} aria-invalid={Boolean(fieldErrors.reciboUrl)} aria-describedby={fieldErrors.reciboUrl ? "certificate-receipt-url-error" : undefined} disabled={isSaving} onChange={(event) => updateField("reciboUrl", event.target.value)} />
                        </Field>
                        <Field label="Fecha de vencimiento" id="certificate-expiry" error={fieldErrors.fechaVencimiento} required={required}>
                            <Input id="certificate-expiry" type="date" value={values.fechaVencimiento} required={required} aria-required={required} aria-invalid={Boolean(fieldErrors.fechaVencimiento)} aria-describedby={fieldErrors.fechaVencimiento ? "certificate-expiry-error" : undefined} disabled={isSaving} onChange={(event) => updateField("fechaVencimiento", event.target.value)} />
                        </Field>
                        <Field label="Estado" id="certificate-state" error={fieldErrors.estado} required={required}>
                            <Select value={values.estado} onValueChange={(value) => updateField("estado", value ?? "")} disabled={isSaving}>
                                <SelectTrigger id="certificate-state" aria-required={required} aria-invalid={Boolean(fieldErrors.estado)} aria-describedby={fieldErrors.estado ? "certificate-state-error" : undefined}>
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vigente">Vigente</SelectItem>
                                    <SelectItem value="por vencer">Por vencer</SelectItem>
                                    <SelectItem value="vencida">Vencida</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    {requestError && <p role="alert" className="text-sm text-destructive">{requestError}</p>}
                    {info && <p role="status" aria-live="polite" className="text-sm text-ink-muted">{info}</p>}
                    {success && <p role="status" aria-live="polite" className="text-sm text-brand">{success}</p>}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" disabled={isSaving} onClick={() => handleOpenChange(false)}>Cerrar</Button>
                        <Button type="submit" disabled={isSaving || isLoading || campaniaId === null} aria-busy={isSaving}>
                            {isSaving ? "Guardando..." : editingId === null ? "Registrar certificación" : "Guardar cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, id, error, required, children }: { label: string; id: string; error?: string; required: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-xs font-semibold text-ink">
                {label}{required && <> <span aria-hidden="true" className="text-destructive">*</span></>}
            </label>
            {children}
            {error && <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
