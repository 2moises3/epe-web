import { useCallback, useEffect, useRef, useState } from "react";
import { Apple, FlaskConical, ShieldCheck, Plus, Pencil, Trash2, Save, X, RotateCw, ExternalLink, CircleCheck, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";
import FormSection from "@/shared/components/FormSection";
import RemovableChip from "@/shared/components/RemovableChip";
import RowActions from "@/shared/components/RowActions";
import StatusBadge from "@/shared/components/StatusBadge";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { TABLE_HEAD_BG } from "@/shared/components/DataTableRow";
import {
    assignProveedorFruta,
    createCertificadoProveedorWithFile,
    createExamenProveedor,
    deleteCertificadoProveedor,
    deleteExamenProveedor,
    getCertificadosProveedor,
    getCertificadoProveedorDownloadUrl,
    getExamenesProveedor,
    getFrutasCatalogo,
    getFrutasProveedor,
    unassignProveedorFruta,
    updateCertificadoProveedorWithFile,
    updateExamenProveedor,
} from "@/modules/providers/api/provider-subresources.api";
import type {
    CertificadoProveedorDto,
    CertificadoProveedorValues,
    ExamenProveedorDto,
    ExamenProveedorValues,
    FrutaDto,
    ProveedorFrutaDto,
} from "@/modules/providers/api/provider-subresources.dto";
import {
    createEmptyCertificadoProveedorValues,
    createEmptyExamenProveedorValues,
    toExamenProveedorInput,
    validateCertificadoProveedor,
    validateCertificadoProveedorFile,
    validateExamenProveedor,
} from "@/modules/providers/api/provider-subresources.validation";
import { createProviderSubresourceOperationGate } from "@/modules/providers/api/provider-subresources.guard";

type Props = { providerId: number; onMutatingChange: (mutating: boolean) => void };
type Tab = "frutas" | "examenes" | "certificados";
type FormTarget = "exam" | "certificate" | null;
type PendingDelete =
    | { kind: "exam"; exam: ExamenProveedorDto }
    | { kind: "certificate"; certificate: CertificadoProveedorDto }
    | null;

/** El backend envía fechas ISO completas: para el input y la tabla solo sirve la parte de fecha */
const dateInputValue = (value: string) => value.slice(0, 10);
const displayDate = (value: string) => dateInputValue(value).split("-").reverse().join("/");

function RequiredField({ id, label, value, error, disabled, type = "text", maxLength, onChange }: {
    id: string;
    label: string;
    value: string;
    error?: string;
    disabled: boolean;
    type?: string;
    maxLength?: number;
    onChange: (value: string) => void;
}) {
    const errorId = `${id}-error`;
    return (
        <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={id}>{label} <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
            <Input
                id={id}
                type={type}
                value={value}
                maxLength={maxLength}
                placeholder={type === "url" ? "https://..." : undefined}
                required
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && <FieldError id={errorId}>{error}</FieldError>}
        </Field>
    );
}

function SectionError({ message, onRetry, disabled }: { message: string; onRetry: () => void; disabled: boolean }) {
    return (
        <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                {message}
                <Button variant="outline" size="sm" onClick={onRetry} disabled={disabled}><RotateCw size={14} /> Reintentar</Button>
            </AlertDescription>
        </Alert>
    );
}

/** Frutas, exámenes y certificados del proveedor, cada uno en su pestaña, contra sus rutas del backend. */
export default function ProviderSubresources({ providerId, onMutatingChange }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("frutas");
    const [fruits, setFruits] = useState<ProveedorFrutaDto[]>([]);
    const [fruitCatalog, setFruitCatalog] = useState<FrutaDto[]>([]);
    const [exams, setExams] = useState<ExamenProveedorDto[]>([]);
    const [certificates, setCertificates] = useState<CertificadoProveedorDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string | null>>({ fruits: null, exams: null, certificates: null });
    const [feedback, setFeedback] = useState<string | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [isMutating, setIsMutating] = useState(false);
    const [selectedFruitId, setSelectedFruitId] = useState("");
    const [formTarget, setFormTarget] = useState<FormTarget>(null);
    const [editingExamId, setEditingExamId] = useState<number | null>(null);
    const [examValues, setExamValues] = useState<ExamenProveedorValues>(createEmptyExamenProveedorValues);
    const [examErrors, setExamErrors] = useState<Partial<Record<keyof ExamenProveedorValues, string>>>({});
    const [certificateValues, setCertificateValues] = useState<CertificadoProveedorValues>(createEmptyCertificadoProveedorValues);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [certificateFileError, setCertificateFileError] = useState<string | null>(null);
    const [certificateStage, setCertificateStage] = useState<string | null>(null);
    const [certificateErrors, setCertificateErrors] = useState<Partial<Record<keyof CertificadoProveedorValues, string>>>({});
    const [editingCertificateId, setEditingCertificateId] = useState<number | null>(null);
    const [pendingDelete, setPendingDelete] = useState<{ open: boolean; target: PendingDelete }>({ open: false, target: null });
    const operationGate = useRef(createProviderSubresourceOperationGate());
    const loadSequence = useRef(0);
    const operationsBusy = loading || isMutating;

    const loadSubresources = useCallback(async () => {
        if (!operationGate.current.beginLoad()) return false;
        const request = ++loadSequence.current;
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                Promise.all([getFrutasCatalogo(), getFrutasProveedor(providerId)]),
                getExamenesProveedor(providerId),
                getCertificadosProveedor(providerId),
            ]);
            if (request !== loadSequence.current) return false;
            setErrors({
                fruits: results[0].status === "rejected" ? "No se pudieron cargar las frutas del proveedor." : null,
                exams: results[1].status === "rejected" ? "No se pudieron cargar los exámenes." : null,
                certificates: results[2].status === "rejected" ? "No se pudieron cargar los certificados." : null,
            });
            if (results[0].status === "fulfilled") {
                setFruitCatalog(results[0].value[0]);
                setFruits(results[0].value[1]);
            }
            if (results[1].status === "fulfilled") setExams(results[1].value);
            if (results[2].status === "fulfilled") setCertificates(results[2].value);
            return true;
        } finally {
            operationGate.current.endLoad();
            if (request === loadSequence.current) setLoading(false);
        }
    }, [providerId]);

    useEffect(() => {
        const timeout = window.setTimeout(() => { void loadSubresources(); }, 0);
        return () => {
            window.clearTimeout(timeout);
            loadSequence.current += 1;
        };
    }, [loadSubresources]);

    const updateExamField = <FieldName extends keyof ExamenProveedorValues>(field: FieldName, value: ExamenProveedorValues[FieldName]) => {
        setExamValues((current) => ({ ...current, [field]: value }));
        setExamErrors((current) => ({ ...current, [field]: undefined }));
        setRequestError(null);
    };

    const updateCertificateField = <FieldName extends keyof CertificadoProveedorValues>(field: FieldName, value: CertificadoProveedorValues[FieldName]) => {
        setCertificateValues((current) => ({ ...current, [field]: value }));
        setCertificateErrors((current) => ({ ...current, [field]: undefined }));
        setRequestError(null);
    };

    /** Una operación por vez; el éxito se informa solo si el backend respondió bien (eliminar no muestra éxito) */
    const runMutation = async (successMessage: string | null, failureMessage: string, mutate: () => Promise<void>) => {
        if (!operationGate.current.beginMutation()) return false;
        setIsMutating(true);
        onMutatingChange(true);
        setFeedback(null);
        setRequestError(null);
        try {
            await mutate();
            setFeedback(successMessage);
            return true;
        } catch (error) {
            setRequestError(error instanceof Error ? error.message : failureMessage);
            return false;
        } finally {
            operationGate.current.endMutation();
            setIsMutating(false);
            onMutatingChange(false);
        }
    };

    const addFruit = async () => {
        const frutaId = Number(selectedFruitId);
        if (!Number.isInteger(frutaId) || frutaId < 1 || fruits.some((item) => item.frutaId === frutaId)) return;
        await runMutation("Fruta asociada correctamente.", "No se pudo asociar la fruta. Actualiza la lista e inténtalo nuevamente.", async () => {
            const added = await assignProveedorFruta(providerId, frutaId);
            setFruits((current) => [...current, added]);
            setSelectedFruitId("");
        });
    };

    const removeFruit = async (item: ProveedorFrutaDto) => {
        await runMutation(null, "No se pudo quitar la fruta del proveedor.", async () => {
            await unassignProveedorFruta(providerId, item.frutaId);
            setFruits((current) => current.filter((fruit) => fruit.frutaId !== item.frutaId));
        });
    };

    const startExamForm = (exam?: ExamenProveedorDto) => {
        setFormTarget("exam");
        setEditingExamId(exam?.examenProveedorId ?? null);
        setExamValues(exam
            ? { fecha: dateInputValue(exam.fecha), tipoExamen: exam.tipoExamen, resultado: exam.resultado, origen: exam.origen, observacion: exam.observacion, documentoUrl: exam.documentoUrl }
            : createEmptyExamenProveedorValues());
        setExamErrors({});
        setFeedback(null);
        setRequestError(null);
    };

    const saveExam = async () => {
        const nextErrors = validateExamenProveedor(examValues);
        setExamErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        const payload = toExamenProveedorInput(examValues);
        const success = await runMutation(editingExamId === null ? "Examen registrado correctamente." : "Examen actualizado correctamente.", "No se pudo guardar el examen. Revisa los datos e inténtalo nuevamente.", async () => {
            const saved = editingExamId === null
                ? await createExamenProveedor(providerId, payload)
                : await updateExamenProveedor(providerId, editingExamId, payload);
            setExams((current) => (editingExamId === null ? [saved, ...current] : current.map((item) => (item.examenProveedorId === saved.examenProveedorId ? saved : item))));
        });
        if (success) setFormTarget(null);
    };

    const removeExam = async (exam: ExamenProveedorDto) => {
        await runMutation(null, "No se pudo eliminar el examen.", async () => {
            await deleteExamenProveedor(providerId, exam.examenProveedorId);
            setExams((current) => current.filter((item) => item.examenProveedorId !== exam.examenProveedorId));
        });
    };

    const startCertificateForm = (certificate?: CertificadoProveedorDto) => {
        setFormTarget("certificate");
        setEditingCertificateId(certificate?.certificadoProveedorId ?? null);
        setCertificateValues(certificate ? { fechaRevisionSenasa: dateInputValue(certificate.fechaRevisionSenasa), nombre: certificate.nombre } : createEmptyCertificadoProveedorValues());
        setCertificateFile(null);
        setCertificateFileError(null);
        setCertificateStage(null);
        setCertificateErrors({});
        setFeedback(null);
        setRequestError(null);
    };

    const saveCertificate = async () => {
        const nextErrors = validateCertificadoProveedor(certificateValues);
        setCertificateErrors(nextErrors);
        const fileError = certificateFile ? validateCertificadoProveedorFile(certificateFile) : null;
        setCertificateFileError(fileError ?? (!certificateFile ? "Selecciona el archivo del certificado." : null));
        if (Object.keys(nextErrors).length || fileError || !certificateFile) return;
        const certificateId = editingCertificateId;
        const success = await runMutation(certificateId === null ? "Certificado registrado correctamente." : "Certificado actualizado correctamente.", "No se pudo guardar el certificado. Revisa los datos e inténtalo nuevamente.", async () => {
            const saved = certificateId === null
                ? await createCertificadoProveedorWithFile(providerId, certificateFile, certificateValues, setCertificateStage)
                : await updateCertificadoProveedorWithFile(providerId, certificateId, certificateFile, certificateValues, setCertificateStage);
            setCertificates((current) => certificateId === null ? [saved, ...current] : current.map((item) => item.certificadoProveedorId === saved.certificadoProveedorId ? saved : item));
        });
        setCertificateStage(null);
        if (success) { setFormTarget(null); setEditingCertificateId(null); setCertificateFile(null); }
    };

    const downloadCertificate = async (certificate: CertificadoProveedorDto) => {
        const pendingWindow = window.open("about:blank", "_blank");
        try {
            const downloadUrl = await getCertificadoProveedorDownloadUrl(providerId, certificate.certificadoProveedorId);
            if (pendingWindow) { pendingWindow.opener = null; pendingWindow.location.href = downloadUrl; }
            else window.location.assign(downloadUrl);
        } catch {
            pendingWindow?.close();
            setRequestError("No se pudo obtener el enlace de descarga del certificado.");
        }
    };

    const startCertificateEdit = (certificate: CertificadoProveedorDto) => {
        startCertificateForm(certificate);
    };

    const removeCertificate = async (certificate: CertificadoProveedorDto) => {
        await runMutation(null, "No se pudo eliminar el certificado.", async () => {
            await deleteCertificadoProveedor(providerId, certificate.certificadoProveedorId);
            setCertificates((current) => current.filter((item) => item.certificadoProveedorId !== certificate.certificadoProveedorId));
        });
    };

    const confirmDelete = () => {
        const target = pendingDelete.target;
        if (!target) return;
        if (target.kind === "exam") void removeExam(target.exam);
        else void removeCertificate(target.certificate);
    };

    const availableFruits = fruitCatalog.filter((fruit) => !fruits.some((item) => item.frutaId === fruit.frutaId));
    const fruitItems = availableFruits.map((fruit) => ({ value: String(fruit.frutaId), label: fruit.name }));

    const tabs: SegmentedTabItem[] = [
        { id: "frutas", label: "Frutas", icon: Apple, count: fruits.length },
        { id: "examenes", label: "Exámenes", icon: FlaskConical, count: exams.length },
        { id: "certificados", label: "Certificados", icon: ShieldCheck, count: certificates.length },
    ];

    const changeTab = (value: string) => {
        setActiveTab(value as Tab);
        setFormTarget(null);
        setFeedback(null);
        setRequestError(null);
    };

    return (
        <section aria-label="Frutas, exámenes y certificados del proveedor" className="mt-6 flex flex-col gap-4">
            <SegmentedTabs tabs={tabs} value={activeTab} onChange={changeTab} />

            {feedback && (
                <Alert variant="success" role="status">
                    <CircleCheck />
                    <AlertDescription className="text-brand-dark">{feedback}</AlertDescription>
                </Alert>
            )}
            {requestError && (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>{requestError}</AlertDescription>
                </Alert>
            )}
            {loading && <p role="status" aria-live="polite" className="text-[13px] text-ink-muted">Cargando información relacionada…</p>}

            {activeTab === "frutas" && (
                <FormSection icon={<Apple size={16} strokeWidth={2.5} />} title="Frutas que produce">
                    {errors.fruits ? (
                        <SectionError message={errors.fruits} onRetry={() => void loadSubresources()} disabled={operationsBusy} />
                    ) : (
                        <>
                            {!loading && fruits.length === 0
                                ? <p className="text-[13px] text-ink-muted">No hay frutas asociadas a este proveedor.</p>
                                : (
                                    <div className="flex flex-wrap gap-2">
                                        {fruits.map((item) => (
                                            <RemovableChip
                                                key={item.frutaId}
                                                dot
                                                label={item.fruta.name}
                                                onRemove={operationsBusy ? undefined : () => void removeFruit(item)}
                                                className="gap-3 rounded-full py-2"
                                            />
                                        ))}
                                    </div>
                                )}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <Field className="flex-1">
                                    <FieldLabel htmlFor="provider-fruit-select">Fruta para asociar:</FieldLabel>
                                    <Select items={fruitItems} value={selectedFruitId || null} onValueChange={(value) => setSelectedFruitId((value as string | null) ?? "")} disabled={operationsBusy || availableFruits.length === 0}>
                                        <SelectTrigger id="provider-fruit-select" className="w-full">
                                            <SelectValue placeholder={availableFruits.length === 0 ? "Ya tiene todas las frutas del catálogo" : "Seleccionar fruta"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fruitItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Button size="xl" disabled={!selectedFruitId || operationsBusy} aria-busy={isMutating} onClick={() => void addFruit()}>
                                    <Plus size={18} strokeWidth={2.5} /> Asociar fruta
                                </Button>
                            </div>
                        </>
                    )}
                </FormSection>
            )}

            {activeTab === "examenes" && (
                <FormSection
                    icon={<FlaskConical size={16} strokeWidth={2.5} />}
                    title="Exámenes de laboratorio"
                    aside={<Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => startExamForm()}><Plus size={14} /> Registrar examen</Button>}
                >
                    {errors.exams ? (
                        <SectionError message={errors.exams} onRetry={() => void loadSubresources()} disabled={operationsBusy} />
                    ) : exams.length === 0 && !loading ? (
                        <p className="text-[13px] text-ink-muted">No hay exámenes registrados.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-border bg-white">
                            <Table className="min-w-150">
                                <TableHeader className={TABLE_HEAD_BG}>
                                    <TableRow className="border-b border-border hover:bg-transparent">
                                        <TableHead className="h-12 px-4 font-semibold text-ink">Análisis</TableHead>
                                        <TableHead className="h-12 font-semibold text-ink">Resultado</TableHead>
                                        <TableHead className="h-12 font-semibold text-ink">Fecha</TableHead>
                                        <TableHead className="h-12 font-semibold text-ink">Origen</TableHead>
                                        <TableHead className="h-12 px-4 text-right font-semibold text-ink">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exams.map((exam) => (
                                        <TableRow key={exam.examenProveedorId} className="border-b border-border hover:bg-surface-page/60">
                                            <TableCell className="px-4 py-3">
                                                <p className="font-semibold text-ink">{exam.tipoExamen}</p>
                                                <a href={exam.documentoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline">
                                                    Documento <ExternalLink size={11} aria-hidden="true" />
                                                </a>
                                            </TableCell>
                                            <TableCell><StatusBadge status={exam.resultado === "positivo" ? "Positivo" : "Negativo"} /></TableCell>
                                            <TableCell className="font-medium text-ink-body">{displayDate(exam.fecha)}</TableCell>
                                            <TableCell className="font-medium text-ink-body">{exam.origen}</TableCell>
                                            <TableCell className="px-4">
                                                <RowActions primary={[
                                                    { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: operationsBusy ? undefined : () => startExamForm(exam) },
                                                    { label: "Eliminar", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: operationsBusy ? undefined : () => setPendingDelete({ open: true, target: { kind: "exam", exam } }) },
                                                ]} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {formTarget === "exam" && (
                        <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface/40 p-4">
                            <p className="text-[13px] font-bold text-ink">{editingExamId === null ? "Nuevo examen" : "Editar examen"}</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <RequiredField id="provider-exam-date" label="Fecha" value={examValues.fecha} error={examErrors.fecha} disabled={operationsBusy} type="date" onChange={(fecha) => updateExamField("fecha", fecha)} />
                                <RequiredField id="provider-exam-type" label="Tipo de examen" value={examValues.tipoExamen} error={examErrors.tipoExamen} disabled={operationsBusy} maxLength={150} onChange={(tipoExamen) => updateExamField("tipoExamen", tipoExamen)} />
                                <Field data-invalid={examErrors.resultado ? true : undefined}>
                                    <FieldLabel htmlFor="provider-exam-result">Resultado <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                                    <Select
                                        items={[{ value: "positivo", label: "Positivo" }, { value: "negativo", label: "Negativo" }]}
                                        value={examValues.resultado || null}
                                        onValueChange={(resultado) => updateExamField("resultado", (resultado as string | null) ?? "")}
                                        disabled={operationsBusy}
                                    >
                                        <SelectTrigger id="provider-exam-result" className="w-full" aria-required="true" aria-invalid={examErrors.resultado ? true : undefined} aria-describedby={examErrors.resultado ? "provider-exam-result-error" : undefined}>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="positivo">Positivo</SelectItem>
                                            <SelectItem value="negativo">Negativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {examErrors.resultado && <FieldError id="provider-exam-result-error">{examErrors.resultado}</FieldError>}
                                </Field>
                                <RequiredField id="provider-exam-origin" label="Origen" value={examValues.origen} error={examErrors.origen} disabled={operationsBusy} maxLength={255} onChange={(origen) => updateExamField("origen", origen)} />
                                <div className="sm:col-span-2">
                                    <RequiredField id="provider-exam-document" label="Documento del examen (URL)" value={examValues.documentoUrl} error={examErrors.documentoUrl} disabled={operationsBusy} type="url" onChange={(documentoUrl) => updateExamField("documentoUrl", documentoUrl)} />
                                </div>
                                <Field data-invalid={examErrors.observacion ? true : undefined} className="sm:col-span-2">
                                    <FieldLabel htmlFor="provider-exam-observation">Observación <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                                    <Textarea
                                        id="provider-exam-observation"
                                        className="min-h-24 resize-none rounded-xl"
                                        value={examValues.observacion}
                                        required
                                        aria-required="true"
                                        aria-invalid={examErrors.observacion ? true : undefined}
                                        aria-describedby={examErrors.observacion ? "provider-exam-observation-error" : undefined}
                                        disabled={operationsBusy}
                                        onChange={(event) => updateExamField("observacion", event.target.value)}
                                    />
                                    {examErrors.observacion && <FieldError id="provider-exam-observation-error">{examErrors.observacion}</FieldError>}
                                </Field>
                            </div>
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button variant="outline" disabled={isMutating} onClick={() => setFormTarget(null)}><X size={18} strokeWidth={2.5} /> Cancelar</Button>
                                <Button disabled={operationsBusy} aria-busy={isMutating} onClick={() => void saveExam()}><Save size={18} strokeWidth={2.5} /> {isMutating ? "Guardando…" : "Guardar examen"}</Button>
                            </div>
                        </div>
                    )}
                </FormSection>
            )}

            {activeTab === "certificados" && (
                <FormSection
                    icon={<ShieldCheck size={16} strokeWidth={2.5} />}
                    title="Certificados del proveedor"
                    aside={<Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => startCertificateForm()}><Plus size={14} /> Registrar certificado</Button>}
                >
                    {errors.certificates ? (
                        <SectionError message={errors.certificates} onRetry={() => void loadSubresources()} disabled={operationsBusy} />
                    ) : certificates.length === 0 && !loading ? (
                        <p className="text-[13px] text-ink-muted">No hay certificados registrados.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {certificates.map((certificate) => (
                                <li key={certificate.certificadoProveedorId} className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                                        <ShieldCheck size={18} strokeWidth={2} />
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-[13.5px] font-bold text-ink">{certificate.nombre}</span>
                                        <span className="flex flex-wrap items-center gap-x-2 text-[12px] text-ink-muted">
                                            Revisión SENASA {displayDate(certificate.fechaRevisionSenasa)}
                                            <Button variant="link" size="sm" disabled={operationsBusy} onClick={() => void downloadCertificate(certificate)}>
                                                Descargar documento <ExternalLink size={11} aria-hidden="true" />
                                            </Button>
                                        </span>
                                    </div>
                                    <RowActions primary={[
                                        { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: operationsBusy ? undefined : () => startCertificateEdit(certificate) },
                                        { label: "Eliminar", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: operationsBusy ? undefined : () => setPendingDelete({ open: true, target: { kind: "certificate", certificate } }) },
                                    ]} />
                                </li>
                            ))}
                        </ul>
                    )}

                    {formTarget === "certificate" && (
                        <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface/40 p-4">
                            <p className="text-[13px] font-bold text-ink">{editingCertificateId === null ? "Nuevo certificado" : "Editar certificado"}</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <RequiredField id="provider-certificate-name" label="Nombre" value={certificateValues.nombre} error={certificateErrors.nombre} disabled={operationsBusy} maxLength={255} onChange={(nombre) => updateCertificateField("nombre", nombre)} />
                                <RequiredField id="provider-certificate-date" label="Fecha de revisión SENASA" value={certificateValues.fechaRevisionSenasa} error={certificateErrors.fechaRevisionSenasa} disabled={operationsBusy} type="date" onChange={(fechaRevisionSenasa) => updateCertificateField("fechaRevisionSenasa", fechaRevisionSenasa)} />
                                <Field data-invalid={certificateFileError ? true : undefined} className="sm:col-span-2">
                                    <FieldLabel htmlFor="provider-certificate-document">Archivo del certificado <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                                    <Input id="provider-certificate-document" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required aria-required="true" aria-invalid={certificateFileError ? true : undefined} aria-describedby={certificateFileError ? "provider-certificate-document-error" : "provider-certificate-document-help"} disabled={operationsBusy} onChange={(event) => {
                                        const selected = event.target.files?.[0] ?? null;
                                        setCertificateFile(selected);
                                        setCertificateFileError(selected ? validateCertificadoProveedorFile(selected) ?? null : "Selecciona el archivo del certificado.");
                                    }} />
                                    {certificateFileError ? <FieldError id="provider-certificate-document-error">{certificateFileError}</FieldError> : <p id="provider-certificate-document-help" className="text-xs text-ink-muted">PDF, JPEG, PNG o WebP; máximo 10 MB. Al editar, el nuevo archivo reemplaza el documento del certificado.</p>}
                                </Field>
                            </div>
                            {certificateStage && <p role="status" aria-live="polite" className="text-sm text-ink-muted">{certificateStage}</p>}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button variant="outline" disabled={isMutating} onClick={() => { setFormTarget(null); setEditingCertificateId(null); }}><X size={18} strokeWidth={2.5} /> Cancelar</Button>
                                <Button disabled={operationsBusy} aria-busy={isMutating} onClick={() => void saveCertificate()}><Save size={18} strokeWidth={2.5} /> {isMutating ? "Guardando…" : "Guardar certificado"}</Button>
                            </div>
                        </div>
                    )}
                </FormSection>
            )}

            <ConfirmModal
                open={pendingDelete.open}
                onOpenChange={(open) => setPendingDelete((current) => ({ ...current, open }))}
                icon={<Trash2 size={28} strokeWidth={2.25} />}
                title={pendingDelete.target?.kind === "certificate" ? "¿Eliminar certificado?" : "¿Eliminar examen?"}
                description={pendingDelete.target?.kind === "certificate"
                    ? <>Se eliminará el certificado <strong className="font-bold text-ink">{pendingDelete.target.certificate.nombre}</strong> del proveedor.</>
                    : <>Se eliminará el examen <strong className="font-bold text-ink">{pendingDelete.target?.kind === "exam" ? pendingDelete.target.exam.tipoExamen : ""}</strong> del proveedor.</>}
                confirmLabel="Sí, eliminar"
                onConfirm={confirmDelete}
            />
        </section>
    );
}
