// Tipos y utilidades de archivos adjuntos, compartidos por el campo de archivo y el visualizador

export interface StoredFile {
    name: string;
    url: string;
    size?: number;
    type?: string;
}

/** Archivo recién elegido o referencia a un archivo ya guardado por el backend. */
export type FileSource = File | StoredFile;

export function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isStoredFile(file: FileSource): file is StoredFile {
    return "url" in file;
}

export function isPdf(file: FileSource) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function isImage(file: FileSource) {
    return file.type?.startsWith("image/") ?? /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name);
}
