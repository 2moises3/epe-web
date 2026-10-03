import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Save, X, ShieldCheck, Pencil, Trash2, Plus, ExternalLink, AlertCircle } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import ConfirmModal from "@/shared/components/ConfirmModal";
import FileDropzone from "@/shared/components/FileDropzone";
import FormSection from "@/shared/components/FormSection";
import RowActions from "@/shared/components/RowActions";
import StatusBadge from "@/shared/components/StatusBadge";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { getUploadErrorMessage, uploadDocument } from "@/shared/api/uploadDocument";
import {
    createCertificadoCampana,
    deleteCertificadoCampana,
    getCertificadosCampana,
    updateCertificadoCampana,
} from "@/modules/campaigns/api/certificado-campana.api";
import {
    createCampaignMutationGuard,
    hasCampaignCertificateChanges,
    toCampaignCertificatePayload,
    toCampaignCertificateUpdatePayload,
    validateCampaignCertificate,
    type CampaignCertificateFieldErrors,
    type CampaignCertificateValues,
} from "@/modules/campaigns/api/campaign-mutations.validation";
import { formatFecha } from "@/modules/campaigns/api/fecha.util";
import type { CertificadoCampana } from "@/modules/campaigns/api/certificado-campana.mapper";

const CERTIFICATION_TYPES = ["Global GAP", "Fairtrade (Comercio Justo)", "Orgánica", "Rainforest Alliance", "Internacional", "Nacional"];

const STATUS_OPTIONS = [
    { value: "vigente", label: "Vigente" },
    { value: "por vencer", label: "Por vencer" },
    { value: "vencida", label: "Vencida" },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUS_OPTIONS.map((option) => [option.value, option.label]));

type DocumentField = "documentoUrl" | "reciboUrl";
type DocumentFiles = Record<DocumentField, File | null>;
const NO_FILES: DocumentFiles = { documentoUrl: null, reciboUrl: null };

/** Marcador para validar el resto del formulario antes de subir: al guardar, el archivo real lo reemplaza por su URL */
const UPLOAD_PENDING_URL = "https://pending-upload.invalid";

const EMPTY_FORM: CampaignCertificateValues = {
    nombre: "",
    documentoUrl: "",
    reciboUrl: "",
    costo: "",
    fechaVencimiento: "",
    estado: "",
};

interface CampaignCertificationsModalProps {
    open: boolean;
    campaniaId: number | null;
    onOpenChange: (open: boolean) => void;
    /** Se llama cuando el backend confirmó el alta o la edición de una certificación */
    onSuccess?: () => void;
}

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

/** Certificaciones de la campaña: registrar una nueva, editar o eliminar las existentes. */
export default function CampaignCertificationsModal({ open, campaniaId, onOpenChange, onSuccess }: CampaignCertificationsModalProps) {
    const [certificados, setCertificados] = useState<CertificadoCampana[]>([]);
    const [values, setValues] = useState<CampaignCertificateValues>(EMPTY_FORM);
    // Archivos elegidos: al registrar son obligatorios; al editar son opcionales y, sin elegir uno, se conserva el actual
    const [files, setFiles] = useState<DocumentFiles>(NO_FILES);
    const [fieldErrors, setFieldErrors] = useState<CampaignCertificateFieldErrors>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
    const [deleting, setDeleting] = useState<{ open: boolean; certificate: CertificadoCampana | null }>({ open: false, certificate: null });
    const guard = useRef(createCampaignMutationGuard());

    useEffect(() => {
        if (!open || campaniaId === null) return;
        let active = true;
        getCertificadosCampana(campaniaId)
            .then((items) => { if (active) setCertificados(items); })
            .catch(() => { if (active) setLoadError("No se pudieron cargar las certificaciones de esta campaña."); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [open, campaniaId]);

    const isEdit = editingId !== null;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSaving) return;
        onOpenChange(nextOpen);
    };

    const updateField = (field: keyof CampaignCertificateValues, value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        setMessage(null);
    };

    const updateFile = (field: DocumentField, file: File | null) => {
        setFiles((current) => ({ ...current, [field]: file }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        setMessage(null);
    };

    const startCreate = () => {
        setValues(EMPTY_FORM);
        setFiles(NO_FILES);
        setEditingId(null);
        setFieldErrors({});
        setMessage(null);
    };

    const startEdit = (certificate: CertificadoCampana) => {
        setValues(toFormValues(certificate));
        setFiles(NO_FILES);
        setEditingId(certificate.certificadoId);
        setFieldErrors({});
        setMessage(null);
    };

    const handleSubmit = async () => {
        if (campaniaId === null || isLoading || !guard.current.acquire()) return;
        const originalCertificate = isEdit ? certificados.find((certificate) => certificate.certificadoId === editingId) : undefined;
        if (isEdit && !originalCertificate) {
            guard.current.release();
            setMessage({ tone: "error", text: "No se encontró la certificación. Cierra y vuelve a abrir el formulario." });
            return;
        }
        const original = originalCertificate ? toFormValues(originalCertificate) : undefined;
        // Cada archivo elegido cuenta como su URL pendiente; sin archivo, al editar vale la URL que ya tenía
        const checked = {
            ...values,
            documentoUrl: files.documentoUrl ? UPLOAD_PENDING_URL : values.documentoUrl,
            reciboUrl: files.reciboUrl ? UPLOAD_PENDING_URL : values.reciboUrl,
        };
        const errors = validateCampaignCertificate(checked, isEdit, original);
        if (!isEdit && !files.reciboUrl) errors.reciboUrl = "Adjunta el recibo de pago.";
        if (!isEdit && !files.documentoUrl) errors.documentoUrl = "Adjunta el documento de certificación.";
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            guard.current.release();
            return;
        }
        if (isEdit && original && !hasCampaignCertificateChanges(values, original) && !files.documentoUrl && !files.reciboUrl) {
            setMessage({ tone: "info", text: "No hay cambios para guardar." });
            guard.current.release();
            return;
        }

        setIsSaving(true);
        setMessage(null);
        try {
            // El backend guarda enlaces: los archivos elegidos se suben primero y su URL va en el registro
            const withUrls = { ...values };
            try {
                if (files.documentoUrl) withUrls.documentoUrl = await uploadDocument(files.documentoUrl);
                if (files.reciboUrl) withUrls.reciboUrl = await uploadDocument(files.reciboUrl);
            } catch (uploadError) {
                setMessage({ tone: "error", text: getUploadErrorMessage(uploadError) });
                return;
            }
            if (isEdit && editingId !== null) {
                await updateCertificadoCampana(campaniaId, editingId, toCampaignCertificateUpdatePayload(withUrls));
            } else {
                await createCertificadoCampana(campaniaId, toCampaignCertificatePayload(withUrls));
            }
            onSuccess?.();
        } catch {
            setMessage({ tone: "error", text: "No se pudo guardar la certificación. Revisa los datos e intenta nuevamente." });
        } finally {
            guard.current.release();
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const certificate = deleting.certificate;
        if (campaniaId === null || !certificate || !guard.current.acquire()) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await deleteCertificadoCampana(campaniaId, certificate.certificadoId);
            setCertificados((current) => current.filter((item) => item.certificadoId !== certificate.certificadoId));
            if (editingId === certificate.certificadoId) startCreate();
        } catch {
            setMessage({ tone: "error", text: `No se pudo eliminar la certificación ${certificate.nombre}.` });
        } finally {
            guard.current.release();
            setIsSaving(false);
        }
    };

    // Si la certificación que se edita tiene un nombre fuera del catálogo, se agrega para poder mostrarlo
    const nameOptions = values.nombre && !CERTIFICATION_TYPES.includes(values.nombre) ? [values.nombre, ...CERTIFICATION_TYPES] : CERTIFICATION_TYPES;
    const required = !isEdit ? <span aria-hidden="true" className="text-destructive">*</span> : null;
    const invalid = (field: keyof CampaignCertificateValues) => (fieldErrors[field] ? true : undefined);
    const errorFor = (field: keyof CampaignCertificateValues) => (fieldErrors[field] ? <FieldError>{fieldErrors[field]}</FieldError> : null);

    return (
        <>
            <AppModal
                open={open}
                onOpenChange={handleOpenChange}
                icon={<ShieldCheck size={22} strokeWidth={2} />}
                title={isEdit ? "Editar Certificación" : "Registrar Certificación"}
                description="Registra las certificaciones y documentos de la campaña."
                className="sm:max-w-175"
                footer={
                    <>
                        <Button variant="outline" size="xl" onClick={() => (isEdit ? startCreate() : handleOpenChange(false))} disabled={isSaving}>
                            <X size={20} strokeWidth={2.5} /> {isEdit ? "Cancelar edición" : "Cancelar"}
                        </Button>
                        <Button size="xl" onClick={handleSubmit} disabled={isSaving || isLoading || campaniaId === null} aria-busy={isSaving}>
                            {isEdit ? <Save size={20} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
                            {isSaving ? "Guardando..." : isEdit ? "Guardar" : "Registrar"}
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Field data-invalid={invalid("nombre")}>
                            <FieldLabel>Certificación: {required}</FieldLabel>
                            <Select value={values.nombre || null} onValueChange={(value) => updateField("nombre", (value as string | null) ?? "")} disabled={isSaving}>
                                <SelectTrigger className="w-full" aria-invalid={invalid("nombre")}>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nameOptions.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errorFor("nombre")}
                        </Field>

                        <Field data-invalid={invalid("fechaVencimiento")}>
                            <FieldLabel>Fecha Vencimiento: {required}</FieldLabel>
                            <DatePicker 
                                value={values.fechaVencimiento} 
                                disabled={isSaving} 
                                aria-invalid={invalid("fechaVencimiento")} 
                                onChange={(val) => updateField("fechaVencimiento", val)} 
                            />
                            {errorFor("fechaVencimiento")}
                        </Field>

                        <Field data-invalid={invalid("costo")}>
                            <FieldLabel>Costo: {required}</FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink-muted">$</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={values.costo}
                                    disabled={isSaving}
                                    aria-invalid={invalid("costo")}
                                    onChange={(event) => updateField("costo", event.target.value)}
                                    className="pl-7"
                                />
                            </div>
                            {errorFor("costo")}
                        </Field>

                        <Field data-invalid={invalid("estado")}>
                            <FieldLabel>Estado: {required}</FieldLabel>
                            <Select items={STATUS_OPTIONS} value={values.estado || null} onValueChange={(value) => updateField("estado", (value as string | null) ?? "")} disabled={isSaving}>
                                <SelectTrigger className="w-full" aria-invalid={invalid("estado")}>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errorFor("estado")}
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="flex flex-col gap-2">
                            <FileDropzone
                                label="Recibo de pago"
                                hint={isEdit ? "Opcional: reemplaza el archivo actual · PDF, imagen" : "PDF, imagen · Máx. 10 MB"}
                                file={files.reciboUrl}
                                onChange={(file) => updateFile("reciboUrl", file)}
                            />
                            {errorFor("reciboUrl")}
                        </div>
                        <div className="flex flex-col gap-2">
                            <FileDropzone
                                label="Documento de certificación"
                                hint={isEdit ? "Opcional: reemplaza el archivo actual · PDF" : "PDF · Máx. 10 MB"}
                                file={files.documentoUrl}
                                onChange={(file) => updateFile("documentoUrl", file)}
                            />
                            {errorFor("documentoUrl")}
                        </div>
                    </div>

                    <div className={`transition-all duration-300 overflow-hidden ${message ? "opacity-100 max-h-16" : "opacity-0 max-h-0"}`}>
                        <p role={message?.tone === "error" ? "alert" : "status"} className={`flex items-center gap-2 text-[13px] font-medium ${message?.tone === "error" ? "text-destructive" : "text-ink-muted"}`}>
                            <AlertCircle size={14} className="shrink-0" /> {message?.text}
                        </p>
                    </div>

                    <Separator />

                    <FormSection icon={<ShieldCheck size={16} strokeWidth={2.5} />} title="Certificaciones registradas" aside={`${certificados.length} en esta campaña`}>
                        {isLoading ? (
                            <p role="status" className="text-[13px] text-ink-muted">Cargando certificaciones...</p>
                        ) : loadError ? (
                            <p role="alert" className="text-[13px] font-medium text-destructive">{loadError}</p>
                        ) : certificados.length === 0 ? (
                            <p className="text-[13px] text-ink-muted">Esta campaña aún no tiene certificaciones registradas.</p>
                        ) : (
                            <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                                {certificados.map((certificado) => (
                                    <li
                                        key={certificado.certificadoId}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${editingId === certificado.certificadoId ? "border-brand bg-brand-surface/50" : "border-border bg-white"}`}
                                    >
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                                            <ShieldCheck size={18} strokeWidth={2} />
                                        </span>
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <span className="truncate text-[13.5px] font-bold text-ink">{certificado.nombre}</span>
                                            <span className="flex flex-wrap items-center gap-x-2 text-[12px] text-ink-muted">
                                                Vence {format(certificado.fechaVencimiento, "dd/MM/yyyy")}
                                                <a href={certificado.documentoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                                                    Documento <ExternalLink size={11} aria-hidden="true" />
                                                </a>
                                            </span>
                                        </div>
                                        <StatusBadge status={STATUS_LABEL[certificado.estado] ?? certificado.estado} />
                                        <RowActions
                                            primary={[
                                                { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => startEdit(certificado) },
                                                { label: "Eliminar", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: () => setDeleting({ open: true, certificate: certificado }) },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </FormSection>
                </div>
            </AppModal>

            <ConfirmModal
                open={deleting.open}
                onOpenChange={(nextOpen) => setDeleting((current) => ({ ...current, open: nextOpen }))}
                icon={<Trash2 size={28} strokeWidth={2.25} />}
                title="¿Eliminar certificación?"
                description={<>Se eliminará la certificación <strong className="font-bold text-ink">{deleting.certificate?.nombre}</strong> de esta campaña. Esta acción no se puede deshacer.</>}
                confirmLabel="Sí, eliminar"
                onConfirm={() => void handleDelete()}
            />
        </>
    );
}
