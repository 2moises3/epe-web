import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
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
    updateCertificadoProveedor,
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
    toCertificadoProveedorInput,
    toExamenProveedorInput,
    validateCertificadoProveedor,
    validateCertificadoProveedorFile,
    validateExamenProveedor,
} from "@/modules/providers/api/provider-subresources.validation";
import { createProviderSubresourceOperationGate } from "@/modules/providers/api/provider-subresources.guard";

type Props = { providerId: number; onMutatingChange: (mutating: boolean) => void };
type FormTarget = "exam" | "certificate" | null;

function dateInputValue(value: string): string {
    return value.slice(0, 10);
}

function FieldInput({ id, label, value, error, disabled, type = "text", maxLength, onChange }: {
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
    return <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={id}>{label} <span aria-hidden="true">*</span></FieldLabel>
        <Input id={id} type={type} value={value} maxLength={maxLength} required aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
        {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>;
}

function ApiDocumentLink({ url }: { url: string }) {
    return <a className="break-all text-sm font-medium text-brand underline" href={url} target="_blank" rel="noreferrer">Abrir documento</a>;
}

export default function ProviderSubresources({ providerId, onMutatingChange }: Props) {
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

    useEffect(() => {
        const timeout = window.setTimeout(() => { void loadSubresources(); }, 0);
        return () => {
            window.clearTimeout(timeout);
            loadSequence.current += 1;
        };
    }, [loadSubresources]);

    const runMutation = async (successMessage: string, failureMessage: string, mutate: () => Promise<void>) => {
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
        await runMutation("Fruta quitada correctamente.", "No se pudo quitar la fruta del proveedor.", async () => {
            await unassignProveedorFruta(providerId, item.frutaId);
            setFruits((current) => current.filter((fruit) => fruit.frutaId !== item.frutaId));
        });
    };

    const startExamForm = (exam?: ExamenProveedorDto) => {
        setFormTarget("exam");
        setEditingExamId(exam?.examenProveedorId ?? null);
        setExamValues(exam ? { fecha: dateInputValue(exam.fecha), tipoExamen: exam.tipoExamen, resultado: exam.resultado, origen: exam.origen, observacion: exam.observacion, documentoUrl: exam.documentoUrl } : createEmptyExamenProveedorValues());
        setExamErrors({});
        setFeedback(null);
        setRequestError(null);
    };

    const saveExam = async () => {
        const nextErrors = validateExamenProveedor(examValues);
        setExamErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        const payload = toExamenProveedorInput(examValues);
        const success = await runMutation(editingExamId === null ? "Examen creado correctamente." : "Examen actualizado correctamente.", "No se pudo guardar el examen. Revisa los datos e inténtalo nuevamente.", async () => {
            const saved = editingExamId === null
                ? await createExamenProveedor(providerId, payload)
                : await updateExamenProveedor(providerId, editingExamId, payload);
            setExams((current) => editingExamId === null ? [saved, ...current] : current.map((item) => item.examenProveedorId === saved.examenProveedorId ? saved : item));
        });
        if (success) setFormTarget(null);
    };

    const removeExam = async (exam: ExamenProveedorDto) => {
        if (!window.confirm(`¿Eliminar el examen ${exam.tipoExamen}?`)) return;
        await runMutation("Examen eliminado correctamente.", "No se pudo eliminar el examen.", async () => {
            await deleteExamenProveedor(providerId, exam.examenProveedorId);
            setExams((current) => current.filter((item) => item.examenProveedorId !== exam.examenProveedorId));
        });
    };

    const startCertificateForm = (certificate?: CertificadoProveedorDto) => {
        setFormTarget("certificate");
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
        setCertificateFileError(fileError ?? (editingCertificateId === null && !certificateFile ? "Selecciona el archivo del certificado." : null));
        if (Object.keys(nextErrors).length || fileError || (editingCertificateId === null && !certificateFile)) return;
        const certificateId = editingCertificateId;
        const success = await runMutation(certificateId === null ? "Certificado creado correctamente." : "Certificado actualizado correctamente.", "No se pudo guardar el certificado. Revisa los datos e inténtalo nuevamente.", async () => {
            const saved = certificateId === null
                ? await createCertificadoProveedorWithFile(providerId, certificateFile!, certificateValues, setCertificateStage)
                : await updateCertificadoProveedor(providerId, certificateId, toCertificadoProveedorInput(certificateValues, certificates.find((item) => item.certificadoProveedorId === certificateId)!.documentoArchivoId));
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
        setEditingCertificateId(certificate.certificadoProveedorId);
        startCertificateForm(certificate);
    };

    const removeCertificate = async (certificate: CertificadoProveedorDto) => {
        if (!window.confirm(`¿Eliminar el certificado ${certificate.nombre}?`)) return;
        await runMutation("Certificado eliminado correctamente.", "No se pudo eliminar el certificado.", async () => {
            await deleteCertificadoProveedor(providerId, certificate.certificadoProveedorId);
            setCertificates((current) => current.filter((item) => item.certificadoProveedorId !== certificate.certificadoProveedorId));
        });
    };

    return <section aria-label="Frutas, exámenes y certificados del proveedor" className="mt-5 border-t border-border pt-5">
        <h3 className="mb-4 text-base font-bold text-ink">Frutas, exámenes y certificados</h3>
        {feedback && <p role="status" aria-live="polite" className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{feedback}</p>}
        {requestError && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{requestError}</p>}
        {loading && <p role="status" aria-live="polite" className="mb-3 text-sm text-ink-muted">Cargando información relacionada…</p>}

        <section className="mb-5 rounded-xl border border-border p-4" aria-labelledby="provider-fruits-title">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 id="provider-fruits-title" className="font-semibold text-ink">Frutas</h4>
                {errors.fruits && <Button variant="outline" size="sm" onClick={() => void loadSubresources()} disabled={loading || isMutating}>Reintentar</Button>}
            </div>
            {errors.fruits ? <p role="alert" className="text-sm text-red-700">{errors.fruits}</p> : <>
                {!loading && fruits.length === 0 && <p className="mb-3 text-sm text-ink-muted">No hay frutas asociadas a este proveedor.</p>}
                {fruits.length > 0 && <ul className="mb-3 space-y-2">{fruits.map((item) => <li key={item.frutaId} className="flex items-center justify-between gap-3 rounded-lg bg-surface-page px-3 py-2 text-sm"><span>{item.fruta.name}</span><Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => void removeFruit(item)}>Quitar</Button></li>)}</ul>}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium" htmlFor="provider-fruit-select">Fruta para asociar <span aria-hidden="true">*</span></label>
                    <select id="provider-fruit-select" className="h-10 w-full min-w-0 rounded-lg border border-border bg-white px-3 text-sm" value={selectedFruitId} required aria-required="true" disabled={loading || isMutating || fruitCatalog.every((fruit) => fruits.some((item) => item.frutaId === fruit.frutaId))} onChange={(event) => setSelectedFruitId(event.target.value)}>
                        <option value="">Seleccionar fruta</option>
                        {fruitCatalog.filter((fruit) => !fruits.some((item) => item.frutaId === fruit.frutaId)).map((fruit) => <option key={fruit.frutaId} value={fruit.frutaId}>{fruit.name}</option>)}
                    </select>
                    </div>
                    <Button variant="outline" disabled={!selectedFruitId || isMutating || loading} aria-busy={isMutating} onClick={() => void addFruit()}>{isMutating ? "Guardando…" : "Asociar fruta"}</Button>
                </div>
            </>}
        </section>

        <section className="mb-5 rounded-xl border border-border p-4" aria-labelledby="provider-exams-title">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 id="provider-exams-title" className="font-semibold text-ink">Exámenes</h4>
                <div className="flex gap-2">
                    {errors.exams && <Button variant="outline" size="sm" onClick={() => void loadSubresources()} disabled={loading || isMutating}>Reintentar</Button>}
                    <Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => startExamForm()}>Agregar examen</Button>
                </div>
            </div>
            {errors.exams ? <p role="alert" className="text-sm text-red-700">{errors.exams}</p> : exams.length === 0 && !loading ? <p className="text-sm text-ink-muted">No hay exámenes registrados.</p> : <ul className="space-y-3">{exams.map((exam) => <li key={exam.examenProveedorId} className="rounded-lg bg-surface-page p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 text-sm"><p className="font-semibold">{exam.tipoExamen} · {exam.resultado}</p><p>Fecha: {dateInputValue(exam.fecha)} · Origen: {exam.origen}</p><p>{exam.observacion}</p><ApiDocumentLink url={exam.documentoUrl} /></div>
                    <div className="flex gap-2"><Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => startExamForm(exam)}>Editar</Button><Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => void removeExam(exam)}>Eliminar</Button></div>
                </div>
            </li>)}</ul>}
            {formTarget === "exam" && <div className="mt-4 rounded-lg border border-border p-3">
                <p className="mb-3 text-xs text-ink-muted"><span aria-hidden="true">*</span> Campos obligatorios.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <FieldInput id="provider-exam-date" label="Fecha" value={examValues.fecha} error={examErrors.fecha} disabled={operationsBusy} type="date" onChange={(fecha) => updateExamField("fecha", fecha)} />
                    <FieldInput id="provider-exam-type" label="Tipo de examen" value={examValues.tipoExamen} error={examErrors.tipoExamen} disabled={operationsBusy} maxLength={150} onChange={(tipoExamen) => updateExamField("tipoExamen", tipoExamen)} />
                    <Field data-invalid={Boolean(examErrors.resultado)}>
                        <FieldLabel htmlFor="provider-exam-result">Resultado <span aria-hidden="true">*</span></FieldLabel>
                        <Select value={examValues.resultado} onValueChange={(resultado) => updateExamField("resultado", resultado ?? "")}>
                            <SelectTrigger id="provider-exam-result" aria-required="true" aria-invalid={Boolean(examErrors.resultado)} aria-describedby={examErrors.resultado ? "provider-exam-result-error" : undefined} disabled={operationsBusy}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent><SelectItem value="positivo">Positivo</SelectItem><SelectItem value="negativo">Negativo</SelectItem></SelectContent>
                        </Select>
                        {examErrors.resultado && <FieldError id="provider-exam-result-error">{examErrors.resultado}</FieldError>}
                    </Field>
                    <FieldInput id="provider-exam-origin" label="Origen" value={examValues.origen} error={examErrors.origen} disabled={operationsBusy} maxLength={255} onChange={(origen) => updateExamField("origen", origen)} />
                    <FieldInput id="provider-exam-document" label="URL del documento" value={examValues.documentoUrl} error={examErrors.documentoUrl} disabled={operationsBusy} type="url" onChange={(documentoUrl) => updateExamField("documentoUrl", documentoUrl)} />
                    <Field data-invalid={Boolean(examErrors.observacion)} className="sm:col-span-2">
                        <FieldLabel htmlFor="provider-exam-observation">Observación <span aria-hidden="true">*</span></FieldLabel>
                        <textarea id="provider-exam-observation" className="min-h-20 rounded-lg border border-border bg-white p-3 text-sm" value={examValues.observacion} required aria-required="true" aria-invalid={Boolean(examErrors.observacion)} aria-describedby={examErrors.observacion ? "provider-exam-observation-error" : undefined} disabled={operationsBusy} onChange={(event) => updateExamField("observacion", event.target.value)} />
                        {examErrors.observacion && <FieldError id="provider-exam-observation-error">{examErrors.observacion}</FieldError>}
                    </Field>
                </div>
                <div className="mt-3 flex justify-end gap-2"><Button variant="outline" size="sm" disabled={isMutating} onClick={() => setFormTarget(null)}>Cancelar</Button><Button size="sm" disabled={operationsBusy} aria-busy={isMutating} onClick={() => void saveExam()}>{isMutating ? "Guardando…" : "Guardar examen"}</Button></div>
            </div>}
        </section>

        <section className="rounded-xl border border-border p-4" aria-labelledby="provider-certificates-title">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 id="provider-certificates-title" className="font-semibold text-ink">Certificados</h4>
                <div className="flex gap-2">
                    {errors.certificates && <Button variant="outline" size="sm" onClick={() => void loadSubresources()} disabled={loading || isMutating}>Reintentar</Button>}
                    <Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => { setEditingCertificateId(null); startCertificateForm(); }}>Agregar certificado</Button>
                </div>
            </div>
            {errors.certificates ? <p role="alert" className="text-sm text-red-700">{errors.certificates}</p> : certificates.length === 0 && !loading ? <p className="text-sm text-ink-muted">No hay certificados registrados.</p> : <ul className="space-y-3">{certificates.map((certificate) => <li key={certificate.certificadoProveedorId} className="rounded-lg bg-surface-page p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 text-sm"><p className="font-semibold">{certificate.nombre}</p><p>Revisión SENASA: {dateInputValue(certificate.fechaRevisionSenasa)}</p><Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => void downloadCertificate(certificate)}>Descargar documento</Button></div>
                    <div className="flex gap-2"><Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => startCertificateEdit(certificate)}>Editar</Button><Button variant="outline" size="sm" disabled={operationsBusy} onClick={() => void removeCertificate(certificate)}>Eliminar</Button></div>
                </div>
            </li>)}</ul>}
            {formTarget === "certificate" && <div className="mt-4 rounded-lg border border-border p-3">
                <p className="mb-3 text-xs text-ink-muted"><span aria-hidden="true">*</span> Campos obligatorios.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <FieldInput id="provider-certificate-date" label="Fecha de revisión SENASA" value={certificateValues.fechaRevisionSenasa} error={certificateErrors.fechaRevisionSenasa} disabled={operationsBusy} type="date" onChange={(fechaRevisionSenasa) => updateCertificateField("fechaRevisionSenasa", fechaRevisionSenasa)} />
                    <FieldInput id="provider-certificate-name" label="Nombre" value={certificateValues.nombre} error={certificateErrors.nombre} disabled={operationsBusy} maxLength={255} onChange={(nombre) => updateCertificateField("nombre", nombre)} />
                    <Field data-invalid={Boolean(certificateFileError)} className="sm:col-span-2">
                        <FieldLabel htmlFor="provider-certificate-document">Archivo del certificado {editingCertificateId === null && <span aria-hidden="true">*</span>}</FieldLabel>
                        <Input id="provider-certificate-document" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required={editingCertificateId === null} aria-required={editingCertificateId === null} aria-invalid={Boolean(certificateFileError)} aria-describedby={certificateFileError ? "provider-certificate-document-error" : "provider-certificate-document-help"} disabled={operationsBusy || editingCertificateId !== null} onChange={(event) => {
                            const selected = event.target.files?.[0] ?? null;
                            setCertificateFile(selected);
                            setCertificateFileError(selected ? validateCertificadoProveedorFile(selected) ?? null : editingCertificateId === null ? "Selecciona el archivo del certificado." : null);
                        }} />
                        {certificateFileError ? <FieldError id="provider-certificate-document-error">{certificateFileError}</FieldError> : <p id="provider-certificate-document-help" className="text-xs text-ink-muted">PDF, JPEG, PNG o WebP; máximo 10 MB.{editingCertificateId !== null ? " La sustitución del archivo está fuera de este flujo; se conservará el documento actual." : ""}</p>}
                    </Field>
                </div>
                {certificateStage && <p role="status" aria-live="polite" className="mt-3 text-sm text-ink-muted">{certificateStage}</p>}
                <div className="mt-3 flex justify-end gap-2"><Button variant="outline" size="sm" disabled={isMutating} onClick={() => { setFormTarget(null); setEditingCertificateId(null); }}>Cancelar</Button><Button size="sm" disabled={operationsBusy} aria-busy={isMutating} onClick={() => void saveCertificate()}>{isMutating ? "Guardando…" : "Guardar certificado"}</Button></div>
            </div>}
        </section>
    </section>;
}
