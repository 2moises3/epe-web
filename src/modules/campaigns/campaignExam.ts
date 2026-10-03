/**
 * Examen de laboratorio registrado desde la lista de proveedores de la campaña.
 *
 * El backend sí guarda exámenes por proveedor, pero exige la URL de un documento y este formulario
 * adjunta un archivo (todavía no hay almacenamiento de archivos). Mientras tanto la página los guarda
 * en memoria (se pierden al recargar) y los muestra junto a los exámenes que ya existen en el backend.
 * TODO(api): enviar con `createExamenProveedor` cuando el documento pueda subirse como URL.
 */
export type ExamResult = "positivo" | "negativo";

export interface ExamValues {
    fecha: string;
    tipoExamen: string;
    resultado: ExamResult | "";
    origen: string;
    observacion: string;
    archivo: File | null;
}

/** Examen ya registrado (solo en memoria) */
export interface LocalExam {
    id: string;
    proveedorId: number;
    fecha: string;
    tipoExamen: string;
    resultado: ExamResult;
    origen: string;
    observacion: string;
    archivoNombre: string | null;
}

export type ExamErrors = Partial<Record<"fecha" | "tipoExamen" | "resultado" | "origen", string>>;

export const EMPTY_EXAM: ExamValues = { fecha: "", tipoExamen: "", resultado: "", origen: "", observacion: "", archivo: null };

export const EXAM_TYPES = [
    { value: "suelo", label: "Análisis de suelo" },
    { value: "foliar", label: "Análisis foliar" },
    { value: "agua", label: "Análisis de agua" },
    { value: "sanidad", label: "Análisis de sanidad" },
];

export function validateExam(values: ExamValues): ExamErrors {
    const errors: ExamErrors = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fecha)) errors.fecha = "Ingresa la fecha del examen.";
    if (!values.tipoExamen) errors.tipoExamen = "Selecciona el tipo de examen.";
    if (values.resultado !== "positivo" && values.resultado !== "negativo") errors.resultado = "Selecciona un resultado.";
    if (!values.origen.trim()) errors.origen = "Ingresa el origen del examen.";
    else if (values.origen.trim().length > 255) errors.origen = "El origen admite hasta 255 caracteres.";
    return errors;
}
