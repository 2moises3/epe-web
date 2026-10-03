/**
 * Informe de entrevista a un productor de la campaña.
 *
 * TODO(api): el backend todavía no tiene un servicio de entrevistas. Mientras tanto la página guarda
 * los informes en memoria (se pierden al recargar) para que el flujo completo se pueda recorrer y
 * validar el diseño. Cuando exista el servicio basta con reemplazar el guardado local por la llamada.
 */
export interface InterviewValues {
    densidadPlantacion: string;
    distanciamiento: string;
    frecuenciaRiego: string;
    haTotalFinca: string;
    haCultivo: string;
    nombreAplicacion: string;
    aplicacionesAlAno: string;
    departamento: string;
    provincia: string;
    distrito: string;
    latitud: string;
    longitud: string;
}

export type InterviewField = keyof InterviewValues;
export type InterviewErrors = Partial<Record<InterviewField, string>>;

export const EMPTY_INTERVIEW: InterviewValues = {
    densidadPlantacion: "",
    distanciamiento: "",
    frecuenciaRiego: "",
    haTotalFinca: "",
    haCultivo: "",
    nombreAplicacion: "",
    aplicacionesAlAno: "",
    departamento: "",
    provincia: "",
    distrito: "",
    latitud: "",
    longitud: "",
};

const isBlank = (value: string) => value.trim() === "";
const isNonNegative = (value: string) => !isBlank(value) && Number.isFinite(Number(value)) && Number(value) >= 0;
const isNonNegativeInteger = (value: string) => isNonNegative(value) && Number.isInteger(Number(value));
const isInRange = (value: string, min: number, max: number) =>
    !isBlank(value) && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;

export function validateInterview(values: InterviewValues): InterviewErrors {
    const errors: InterviewErrors = {};
    if (!isNonNegative(values.densidadPlantacion)) errors.densidadPlantacion = "Número no válido.";
    if (!isNonNegative(values.distanciamiento)) errors.distanciamiento = "Número no válido.";
    if (!isNonNegativeInteger(values.frecuenciaRiego)) errors.frecuenciaRiego = "Entero no válido.";
    if (!isNonNegative(values.haTotalFinca)) errors.haTotalFinca = "Número no válido.";
    if (!isNonNegative(values.haCultivo)) errors.haCultivo = "Número no válido.";
    else if (!errors.haTotalFinca && Number(values.haCultivo) > Number(values.haTotalFinca)) {
        errors.haCultivo = "Mayor que las ha totales.";
    }
    if (isBlank(values.nombreAplicacion)) errors.nombreAplicacion = "Requerido.";
    if (!isNonNegativeInteger(values.aplicacionesAlAno)) errors.aplicacionesAlAno = "Entero no válido.";
    if (isBlank(values.departamento)) errors.departamento = "Requerido.";
    if (isBlank(values.provincia)) errors.provincia = "Requerido.";
    if (isBlank(values.distrito)) errors.distrito = "Requerido.";
    if (!isInRange(values.latitud, -90, 90)) errors.latitud = "Entre -90 y 90.";
    if (!isInRange(values.longitud, -180, 180)) errors.longitud = "Entre -180 y 180.";
    return errors;
}
