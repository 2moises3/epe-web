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
    identificacionMuestra: string;
    fechaEnvioMuestra: string;
    estadoEnvioResultado: string;
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
    identificacionMuestra: string;
    fechaEnvioMuestra: string;
    estadoEnvioResultado: string;
    observacion: string;
    archivoNombre: string | null;
}

export type ExamErrors = Partial<Record<"fecha" | "tipoExamen" | "resultado" | "origen" | "identificacionMuestra" | "fechaEnvioMuestra" | "estadoEnvioResultado" | "archivo", string>>;

export const EMPTY_EXAM: ExamValues = { fecha: "", tipoExamen: "", resultado: "positivo", origen: "", identificacionMuestra: "", fechaEnvioMuestra: "", estadoEnvioResultado: "", observacion: "", archivo: null };

export const EXAM_TYPES = [
    { value: "suelo", label: "Análisis de suelo" },
    { value: "foliar", label: "Análisis foliar" },
    { value: "agua", label: "Análisis de agua" },
    { value: "sanidad", label: "Análisis de sanidad" },
];

export const ESTADOS_ENVIO_RESULTADO = [
    { value: "Pendiente", label: "Pendiente" },
    { value: "En proceso", label: "En proceso" },
    { value: "Entregado", label: "Entregado" },
];

export function validateExam(values: ExamValues): ExamErrors {
    const errors: ExamErrors = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fecha)) errors.fecha = "Ingresa la fecha del examen.";
    if (!values.tipoExamen) errors.tipoExamen = "Selecciona el tipo de examen.";
    if (values.resultado !== "positivo" && values.resultado !== "negativo") errors.resultado = "Selecciona un resultado.";
    if (!values.origen.trim()) errors.origen = "Ingresa el origen del examen.";
    else if (values.origen.trim().length > 255) errors.origen = "El origen admite hasta 255 caracteres.";
    
    if (!values.identificacionMuestra.trim()) errors.identificacionMuestra = "Ingresa la identificación de la muestra.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fechaEnvioMuestra)) errors.fechaEnvioMuestra = "Ingresa la fecha de envío.";
    if (!values.estadoEnvioResultado) errors.estadoEnvioResultado = "Selecciona el estado.";
    if (!values.archivo) errors.archivo = "Adjunta un documento.";
    
    return errors;
}
