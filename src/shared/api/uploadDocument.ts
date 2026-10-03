/**
 * Punto único para convertir un archivo elegido por el usuario en la URL que guarda el backend.
 *
 * El backend solo almacena enlaces (contratos, fichas técnicas, certificados, documentos de identidad...),
 * así que todo formulario con una zona de subir archivo pasa por `uploadDocument` justo antes de guardar.
 *
 * TODO(api): todavía no hay servicio de archivos (se integrará uno tipo Cloudinary). Cuando exista, solo
 * hay que implementar esta función: subir el archivo y devolver su URL pública. Ningún formulario cambia.
 * Mientras tanto falla con `FileUploadUnavailableError` y los formularios muestran un aviso claro, sin guardar nada.
 */
export class FileUploadUnavailableError extends Error {
    constructor() {
        super("El servicio de archivos aún no está conectado.");
        this.name = "FileUploadUnavailableError";
    }
}

export async function uploadDocument(file: File): Promise<string> {
    void file;
    throw new FileUploadUnavailableError();
}

/** Mensaje para mostrar en un formulario cuando falló la subida de un archivo */
export function getUploadErrorMessage(error: unknown): string {
    return error instanceof FileUploadUnavailableError
        ? "El servicio de archivos aún no está conectado, por eso no se puede guardar con archivos adjuntos todavía."
        : "No se pudo subir el archivo. Inténtalo nuevamente.";
}
