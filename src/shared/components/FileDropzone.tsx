import { useEffect, useMemo, useState } from "react";
import { FileText, Upload, Eye, X, Image as ImageIcon } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import Hint from "@/shared/components/Hint";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(file: File) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImage(file: File) {
    return file.type.startsWith("image/");
}

interface FileDropzoneProps {
    label: string;
    /** Oculta la etiqueta visible (sigue disponible para lectores de pantalla) cuando el bloque ya tiene su propio título */
    hideLabel?: boolean;
    hint?: string;
    accept?: string;
    file: File | null;
    onChange: (file: File | null) => void;
}

/**
 * Botón de adjuntar que, al elegir un archivo, se convierte en una tarjeta con nombre + peso
 * y dos acciones: ver una vista previa (PDF o imagen) y quitarlo para adjuntar otro.
 */
export default function FileDropzone({ label, hideLabel, hint = "PDF · Máx. 10 MB", accept = "application/pdf,image/*", file, onChange }: FileDropzoneProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const inputId = `file-dropzone-${label.replace(/\s+/g, "-").toLowerCase()}`;

    // El objeto URL solo tiene sentido mientras dure este archivo; se libera al cambiarlo o desmontar
    const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [objectUrl]);

    const FileIcon = file && isImage(file) ? ImageIcon : FileText;

    return (
        <div className="flex flex-col gap-2.5">
            <label htmlFor={inputId} className={cn("text-[13px] font-semibold text-ink", hideLabel && "sr-only")}>
                {label}:
            </label>

            {!file ? (
                <label
                    htmlFor={inputId}
                    className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-brand/30 hover:bg-brand-surface/40"
                >
                    <input
                        id={inputId}
                        type="file"
                        accept={accept}
                        className="sr-only"
                        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                    />
                    <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-page text-ink-muted transition-colors group-hover:border-brand/30 group-hover:text-brand">
                        <Upload size={18} strokeWidth={2.5} />
                    </span>
                    <span className="text-[14px] font-bold text-ink">Haz clic para adjuntar</span>
                    <span className="text-[12px] font-medium text-ink-muted">{hint}</span>
                </label>
            ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface/40 p-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-white text-brand">
                        <FileIcon size={20} strokeWidth={2} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13.5px] font-bold text-ink">{file.name}</span>
                        <span className="text-[12px] font-medium text-ink-muted">{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Hint label="Ver archivo">
                            <button
                                type="button"
                                onClick={() => setPreviewOpen(true)}
                                aria-label="Ver archivo"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white hover:text-brand active:scale-95"
                            >
                                <Eye size={17} strokeWidth={2.5} />
                            </button>
                        </Hint>
                        <Hint label="Quitar">
                            <button
                                type="button"
                                onClick={() => onChange(null)}
                                aria-label="Quitar archivo"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
                            >
                                <X size={17} strokeWidth={2.5} />
                            </button>
                        </Hint>
                    </div>
                </div>
            )}

            {file && objectUrl && (
                <AppModal
                    open={previewOpen}
                    onOpenChange={setPreviewOpen}
                    icon={<Eye size={22} strokeWidth={2} />}
                    title="Vista Previa"
                    description={`${file.name} (${formatFileSize(file.size)})`}
                    className="sm:max-w-190"
                >
                    <div className={cn("w-full overflow-hidden rounded-xl border border-border bg-surface-page", !isPdf(file) && !isImage(file) && "flex minh-[-40vh] items-center justify-center p-6")}>
                        {isPdf(file) ? (
                            <iframe src={objectUrl} title={file.name} className="h-[70vh] w-full" />
                        ) : isImage(file) ? (
                            <div className="flex maxh-[-70vh] w-full items-center justify-center bg-black/5 p-4">
                                <img src={objectUrl} alt={file.name} className="max-h-full max-w-full rounded shadow-sm" />
                            </div>
                        ) : (
                            <p className="text-[13.5px] font-medium">Vista previa no disponible para este tipo de archivo.</p>
                        )}
                    </div>
                </AppModal>
            )}
        </div>
    );
}
