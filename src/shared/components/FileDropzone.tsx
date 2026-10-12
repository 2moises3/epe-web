import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Upload, Eye, X, Pencil, Image as ImageIcon } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import Hint from "@/shared/components/Hint";
import { cn } from "@/lib/utils";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";
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

export interface FileDropzoneProps {
    label: string;
    /** Oculta la etiqueta visible (sigue disponible para lectores de pantalla) cuando el bloque ya tiene su propio título */
    hideLabel?: boolean;
    hint?: string;
    accept?: string;
    file: File | null;
    onChange: (file: File | null) => void;
    /** Variante de visualización: "default" (caja vertical centrada) o "horizontal" (barra compacta h-11 alineada con inputs) */
    variant?: "default" | "horizontal";
    className?: string;
    disabled?: boolean;
    /** Modo visualizador: muestra el archivo con su vista previa, sin poder quitarlo ni reemplazarlo */
    readOnly?: boolean;
    /** Con un archivo ya puesto, cambia "quitar" por "reemplazar": abre el selector y entrega el nuevo archivo por `onChange` */
    replaceable?: boolean;
    hasColon?: boolean;
    optional?: boolean;
    required?: boolean;
}

/**
 * Botón de adjuntar que, al elegir un archivo, se convierte en una tarjeta con nombre + peso
 * y dos acciones: ver una vista previa (PDF o imagen) y quitarlo para adjuntar otro.
 * Soporta variante "default" (vertical amplia) y "horizontal" (compacta h-11 para filas de formularios).
 * Con `readOnly` sirve de visualizador: solo la tarjeta con el archivo y su vista previa.
 * Con `replaceable` (edición) la tarjeta ofrece un lápiz para cambiar el archivo en vez de quitarlo.
 */
export default function FileDropzone({
    label,
    hideLabel,
    hint = "PDF · Máx. 10 MB",
    accept = "application/pdf,image/*",
    file,
    onChange,
    variant = "default",
    className,
    disabled = false,
    readOnly = false,
    replaceable = false,
    hasColon,
    optional,
    required,
}: FileDropzoneProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const inputId = `file-dropzone-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const replaceInputRef = useRef<HTMLInputElement>(null);

    // El objeto URL solo tiene sentido mientras dure este archivo; se libera al cambiarlo o desmontar
    const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [objectUrl]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            onChange(droppedFile);
        }
    };

    /** Ojo (vista previa) y, según el modo, lápiz para reemplazar o X para quitar. `compact` es la variante horizontal. */
    const renderActions = (compact: boolean) => {
        const box = compact ? "h-7 w-7 rounded-md" : "h-9 w-9 rounded-lg";
        const iconSize = compact ? 14 : 17;
        return (
            <>
                <Hint label="Ver archivo">
                    <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        aria-label="Ver archivo"
                        className={cn("flex items-center justify-center text-ink-muted transition-colors hover:bg-card hover:text-brand active:scale-95 cursor-pointer", box)}
                    >
                        <Eye size={iconSize} strokeWidth={2.5} />
                    </button>
                </Hint>
                {replaceable && !readOnly && (
                    <Hint label="Reemplazar archivo">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => replaceInputRef.current?.click()}
                            aria-label="Reemplazar archivo"
                            className={cn("flex items-center justify-center text-ink-muted transition-colors hover:bg-card hover:text-brand active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50", box)}
                        >
                            <Pencil size={iconSize} strokeWidth={2.5} />
                        </button>
                    </Hint>
                )}
                {!replaceable && !readOnly && (
                    <Hint label="Quitar">
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            aria-label="Quitar archivo"
                            className={cn("flex items-center justify-center text-ink-muted transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95 cursor-pointer", box)}
                        >
                            <X size={iconSize} strokeWidth={2.5} />
                        </button>
                    </Hint>
                )}
            </>
        );
    };

    const colonChar = hasColon !== undefined ? (hasColon ? ":" : "") : (required || optional ? "" : ":");
    const isHorizontal = variant === "horizontal";
    const FileIcon = file && isImage(file) ? ImageIcon : FileText;

    return (
        <div className={cn("flex flex-col gap-2.5", className)}>
            <label htmlFor={inputId} className={cn("text-[13px] font-semibold text-ink flex items-center gap-1.5 leading-snug", hideLabel && "sr-only")}>
                <span>{label}{colonChar}</span>
                {required && <span className="text-destructive font-bold">*</span>}
                {optional && <span className="font-normal text-ink-muted/70 text-[11.5px] lowercase">(Opcional)</span>}
            </label>

            {!file && readOnly ? (
                <div className="flex h-11 items-center rounded-lg border border-border/60 bg-card px-3 text-[13px] font-medium text-ink-muted">Sin documento adjunto</div>
            ) : !file ? (
                isHorizontal ? (
                    <label
                        htmlFor={inputId}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "group relative flex h-11 w-full min-w-[280px] cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-dashed border-border px-3.5 transition-colors hover:border-brand/40 hover:bg-brand-surface/40 has-[:focus-visible]:border-brand has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-brand/30",
                            isDragging && "border-brand bg-brand-surface/70",
                            disabled && "pointer-events-none opacity-50"
                        )}
                    >
                        <input
                            id={inputId}
                            type="file"
                            accept={accept}
                            disabled={disabled}
                            className="sr-only"
                            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                        />
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-page text-ink-muted transition-colors group-hover:border-brand/30 group-hover:text-brand">
                                <Upload size={14} strokeWidth={2.5} />
                            </span>
                            <span className="truncate text-[13px] font-semibold text-ink group-hover:text-brand transition-colors">
                                Haz clic para adjuntar
                            </span>
                        </div>
                        {hint && (
                            <span className="shrink-0 text-[11px] font-medium text-ink-muted/80 pl-2">
                                {hint}
                            </span>
                        )}
                    </label>
                ) : (
                    <label
                        htmlFor={inputId}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-brand/30 hover:bg-brand-surface/40 has-[:focus-visible]:border-brand has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-brand/30",
                            isDragging && "border-brand bg-brand-surface/70",
                            disabled && "pointer-events-none opacity-50"
                        )}
                    >
                        <input
                            id={inputId}
                            type="file"
                            accept={accept}
                            disabled={disabled}
                            className="sr-only"
                            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                        />
                        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-page text-ink-muted transition-colors group-hover:border-brand/30 group-hover:text-brand">
                            <Upload size={18} strokeWidth={2.5} />
                        </span>
                        <span className="text-[14px] font-bold text-ink">Haz clic para adjuntar</span>
                        <span className="text-[12px] font-medium text-ink-muted">{hint}</span>
                    </label>
                )
            ) : (
                isHorizontal ? (
                    <div className="flex h-11 w-full min-w-[280px] items-center justify-between gap-2.5 rounded-lg border border-brand-border bg-brand-surface/40 px-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <span 
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white border border-transparent bg-clip-padding"
                                style={BRAND_ACTIVE_SURFACE}
                            >
                                <FileIcon size={14} strokeWidth={2.5} />
                            </span>
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className="truncate text-[13px] font-bold text-ink">{file.name}</span>
                                <span className="shrink-0 text-[11px] font-medium text-ink-muted">({formatFileSize(file.size)})</span>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">{renderActions(true)}</div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-surface/40 p-3">
                        <span 
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white border border-transparent bg-clip-padding"
                            style={BRAND_ACTIVE_SURFACE}
                        >
                            <FileIcon size={20} strokeWidth={2.5} />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[13.5px] font-bold text-ink">{file.name}</span>
                            <span className="text-[12px] font-medium text-ink-muted">{formatFileSize(file.size)}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">{renderActions(false)}</div>
                    </div>
                )
            )}

            {replaceable && file && (
                <input
                    ref={replaceInputRef}
                    id={inputId}
                    type="file"
                    accept={accept}
                    disabled={disabled}
                    className="sr-only"
                    onChange={(event) => {
                        const next = event.target.files?.[0];
                        if (next) onChange(next);
                        event.target.value = "";
                    }}
                />
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
                    <div className={cn("w-full overflow-hidden rounded-xl border border-border bg-surface-page", !isPdf(file) && !isImage(file) && "flex min-h-[40vh] items-center justify-center p-6")}>
                        {isPdf(file) ? (
                            <iframe src={objectUrl} title={file.name} className="h-[70vh] w-full" />
                        ) : isImage(file) ? (
                            <div className="flex max-h-[70vh] w-full items-center justify-center bg-muted p-4">
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
