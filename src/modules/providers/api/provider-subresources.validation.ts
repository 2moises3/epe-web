import type {
    CertificadoProveedorInput,
    CertificadoProveedorValues,
    ExamenProveedorInput,
    ExamenProveedorValues,
    ResultadoExamenProveedor,
} from "@/modules/providers/api/provider-subresources.dto";
import { isURL } from "validator";

export type ExamenProveedorField = keyof ExamenProveedorValues;
export type CertificadoProveedorField = keyof CertificadoProveedorValues;
export type ExamenProveedorErrors = Partial<Record<ExamenProveedorField, string>>;
export type CertificadoProveedorErrors = Partial<Record<CertificadoProveedorField, string>>;

export function createEmptyExamenProveedorValues(): ExamenProveedorValues {
    return { fecha: "", tipoExamen: "", resultado: "", origen: "", observacion: "", documentoUrl: "" };
}

export function createEmptyCertificadoProveedorValues(): CertificadoProveedorValues {
    return { fechaRevisionSenasa: "", nombre: "", documentoUrl: "" };
}

function isDateOnly(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isUrl(value: string): boolean {
    return isURL(value, { require_protocol: true });
}

export function validateExamenProveedor(values: ExamenProveedorValues): ExamenProveedorErrors {
    const errors: ExamenProveedorErrors = {};
    if (!isDateOnly(values.fecha)) errors.fecha = "Ingresa una fecha válida.";
    if (!values.tipoExamen.trim()) errors.tipoExamen = "Ingresa el tipo de examen.";
    else if (values.tipoExamen.trim().length > 150) errors.tipoExamen = "El tipo de examen admite hasta 150 caracteres.";
    if (values.resultado !== "positivo" && values.resultado !== "negativo") errors.resultado = "Selecciona un resultado válido.";
    if (!values.origen.trim()) errors.origen = "Ingresa el origen.";
    else if (values.origen.trim().length > 255) errors.origen = "El origen admite hasta 255 caracteres.";
    if (!values.observacion.trim()) errors.observacion = "Ingresa una observación.";
    if (!isUrl(values.documentoUrl.trim())) errors.documentoUrl = "Ingresa una URL válida para el documento.";
    return errors;
}

export function toExamenProveedorInput(values: ExamenProveedorValues): ExamenProveedorInput {
    return {
        fecha: values.fecha,
        tipoExamen: values.tipoExamen.trim(),
        resultado: values.resultado as ResultadoExamenProveedor,
        origen: values.origen.trim(),
        observacion: values.observacion.trim(),
        documentoUrl: values.documentoUrl.trim(),
    };
}

export function validateCertificadoProveedor(values: CertificadoProveedorValues): CertificadoProveedorErrors {
    const errors: CertificadoProveedorErrors = {};
    if (!isDateOnly(values.fechaRevisionSenasa)) errors.fechaRevisionSenasa = "Ingresa una fecha válida.";
    if (!values.nombre.trim()) errors.nombre = "Ingresa el nombre del certificado.";
    else if (values.nombre.trim().length > 255) errors.nombre = "El nombre admite hasta 255 caracteres.";
    if (!isUrl(values.documentoUrl.trim())) errors.documentoUrl = "Ingresa una URL válida para el documento.";
    return errors;
}

export function toCertificadoProveedorInput(values: CertificadoProveedorValues): CertificadoProveedorInput {
    return {
        fechaRevisionSenasa: values.fechaRevisionSenasa,
        nombre: values.nombre.trim(),
        documentoUrl: values.documentoUrl.trim(),
    };
}
