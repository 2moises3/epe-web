/**
 * Datos agronómicos de un proveedor: un único registro por proveedor, que se completa después de una
 * visita y se puede editar cuando haga falta.
 *
 * TODO(api): el backend todavía no tiene un servicio para estos datos. Mientras tanto se guardan en memoria
 * (se pierden al recargar) en `providerLocalData.store.ts`, que es lo único que hay que reemplazar cuando
 * exista el servicio: `toDatosAgronomicos` ya devuelve la forma con números y `toFormValues` carga la respuesta.
 */
export interface DatosAgronomicosFormValues {
    nombre: string;
    densidadPlantacion: string;
    distanciamiento: string;
    frecuenciaRiego: string;
    nombreAplicacion: string;
    aplicacionesAlAno: string;
}

export interface DatosAgronomicos {
    /** Nombre o referencia con que se identifica el registro (ej. "Plan 2026", "Lote norte") */
    nombre: string;
    densidadPlantacion: number;
    /** Metros entre plantas */
    distanciamiento: number;
    /** Cantidad de riegos por día */
    frecuenciaRiego: number;
    nombreAplicacion: string;
    aplicacionesAlAno: number;
}

export type DatosAgronomicosField = keyof DatosAgronomicosFormValues;
export type DatosAgronomicosErrors = Partial<Record<DatosAgronomicosField, string>>;

export const EMPTY_DATOS_AGRONOMICOS: DatosAgronomicosFormValues = {
    nombre: "",
    densidadPlantacion: "",
    distanciamiento: "",
    frecuenciaRiego: "",
    nombreAplicacion: "",
    aplicacionesAlAno: "",
};

const isBlank = (value: string) => value.trim() === "";
const toNumber = (value: string) => (isBlank(value) ? NaN : Number(value));

/** Número finito mayor a cero: densidad y distanciamiento no tienen sentido en 0. */
const isPositive = (value: string) => Number.isFinite(toNumber(value)) && toNumber(value) > 0;
/** Entero desde cero: 0 riegos o 0 aplicaciones es un dato válido (cultivo de secano, sin fertilizar). */
const isNonNegativeInteger = (value: string) => Number.isInteger(toNumber(value)) && toNumber(value) >= 0;

export function validateDatosAgronomicos(values: DatosAgronomicosFormValues): DatosAgronomicosErrors {
    const errors: DatosAgronomicosErrors = {};
    if (isBlank(values.nombre)) errors.nombre = "Ingresa un nombre o referencia.";
    if (!isPositive(values.densidadPlantacion)) errors.densidadPlantacion = "Ingresa un número mayor a 0.";
    if (!isPositive(values.distanciamiento)) errors.distanciamiento = "Ingresa un número mayor a 0.";
    if (!isNonNegativeInteger(values.frecuenciaRiego)) errors.frecuenciaRiego = "Ingresa un entero desde 0.";
    if (isBlank(values.nombreAplicacion)) errors.nombreAplicacion = "Ingresa el nombre de la aplicación.";
    if (!isNonNegativeInteger(values.aplicacionesAlAno)) errors.aplicacionesAlAno = "Ingresa un entero desde 0.";
    return errors;
}

/** Convierte el formulario ya validado en el registro a guardar (texto recortado, números reales). */
export function toDatosAgronomicos(values: DatosAgronomicosFormValues): DatosAgronomicos {
    return {
        nombre: values.nombre.trim(),
        densidadPlantacion: Number(values.densidadPlantacion),
        distanciamiento: Number(values.distanciamiento),
        frecuenciaRiego: Number(values.frecuenciaRiego),
        nombreAplicacion: values.nombreAplicacion.trim(),
        aplicacionesAlAno: Number(values.aplicacionesAlAno),
    };
}

/** Carga un registro ya guardado en el formulario, para poder actualizarlo. */
export function toFormValues(datos: DatosAgronomicos): DatosAgronomicosFormValues {
    return {
        nombre: datos.nombre,
        densidadPlantacion: String(datos.densidadPlantacion),
        distanciamiento: String(datos.distanciamiento),
        frecuenciaRiego: String(datos.frecuenciaRiego),
        nombreAplicacion: datos.nombreAplicacion,
        aplicacionesAlAno: String(datos.aplicacionesAlAno),
    };
}
