/**
 * Fincas (lugares de cultivo) de un proveedor.
 *
 * TODO(api): el backend todavía no tiene un servicio de fincas. Mientras tanto se guardan en memoria (se
 * pierden al recargar) en `providerLocalData.store.ts`, que es lo único que hay que reemplazar cuando exista
 * el servicio: `toFinca` ya devuelve la forma con números que esperaría el backend.
 */
export interface FincaFormValues {
    nombre: string;
    departamento: string;
    provincia: string;
    distrito: string;
    latitud: string;
    longitud: string;
    haTotal: string;
    haCultivo: string;
}

export interface Finca {
    nombre: string;
    departamento: string;
    provincia: string;
    distrito: string;
    /** Las coordenadas son opcionales: no siempre se conocen al registrar la finca */
    latitud: number | null;
    longitud: number | null;
    haTotal: number;
    haCultivo: number;
}

export type FincaField = keyof FincaFormValues;
export type FincaErrors = Partial<Record<FincaField, string>>;

export const EMPTY_FINCA: FincaFormValues = {
    nombre: "",
    departamento: "",
    provincia: "",
    distrito: "",
    latitud: "",
    longitud: "",
    haTotal: "",
    haCultivo: "",
};

const isBlank = (value: string) => value.trim() === "";
const toNumber = (value: string) => (isBlank(value) ? NaN : Number(value));
const normalizeName = (value: string) => value.trim().toLocaleLowerCase("es");

/** Coordenada opcional: vacía es válida; si se escribe, debe ser un número dentro del rango. */
function validateCoordinate(value: string, limit: number): string | undefined {
    if (isBlank(value)) return undefined;
    const number = toNumber(value);
    return Number.isFinite(number) && Math.abs(number) <= limit ? undefined : `Entre -${limit} y ${limit}.`;
}

/**
 * Valida el formulario. `existingNames` son las fincas que el proveedor ya tiene registradas:
 * no se permite repetir el nombre (sin distinguir mayúsculas ni espacios de los extremos).
 */
export function validateFinca(values: FincaFormValues, existingNames: string[] = []): FincaErrors {
    const errors: FincaErrors = {};

    if (isBlank(values.nombre)) errors.nombre = "Ingresa el nombre de la finca.";
    else if (existingNames.some((name) => normalizeName(name) === normalizeName(values.nombre))) {
        errors.nombre = "El proveedor ya tiene una finca con este nombre.";
    }

    if (isBlank(values.departamento)) errors.departamento = "Requerido.";
    if (isBlank(values.provincia)) errors.provincia = "Requerido.";
    if (isBlank(values.distrito)) errors.distrito = "Requerido.";

    const latitudError = validateCoordinate(values.latitud, 90);
    if (latitudError) errors.latitud = latitudError;
    const longitudError = validateCoordinate(values.longitud, 180);
    if (longitudError) errors.longitud = longitudError;

    const haTotal = toNumber(values.haTotal);
    const haCultivo = toNumber(values.haCultivo);
    if (!Number.isFinite(haTotal) || haTotal <= 0) errors.haTotal = "Ingresa un número mayor a 0.";
    if (!Number.isFinite(haCultivo) || haCultivo < 0) errors.haCultivo = "Ingresa un número válido.";
    else if (!errors.haTotal && haCultivo > haTotal) errors.haCultivo = "No puede superar las hectáreas totales.";

    return errors;
}

/** Convierte el formulario ya validado en la finca a guardar (textos recortados, números reales). */
export function toFinca(values: FincaFormValues): Finca {
    return {
        nombre: values.nombre.trim(),
        departamento: values.departamento.trim(),
        provincia: values.provincia.trim(),
        distrito: values.distrito.trim(),
        latitud: isBlank(values.latitud) ? null : Number(values.latitud),
        longitud: isBlank(values.longitud) ? null : Number(values.longitud),
        haTotal: Number(values.haTotal),
        haCultivo: Number(values.haCultivo),
    };
}
