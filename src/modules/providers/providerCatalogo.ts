/**
 * Catálogo de frutas y variedades que maneja el módulo de proveedores. Lo comparten el formulario de proveedor
 * (qué frutas trabaja) y el de finca (qué cultivo y variedad tiene cada finca).
 *
 * TODO(api): hoy es una lista fija; el backend expone `/frutas` y sus derivadas, que la reemplazarán.
 */
export interface FrutaCatalogo {
    id: string;
    nombre: string;
    variedades: string[];
}

export const CATALOGO_FRUTAS: FrutaCatalogo[] = [
    { id: "mango", nombre: "Mango", variedades: ["Kent", "Edward", "Haden", "Tommy Atkins"] },
    { id: "uva", nombre: "Uva", variedades: ["Red Globe", "Crimson", "Autumn Royal", "Sweet Celebration"] },
    { id: "arandano", nombre: "Arándano", variedades: ["Biloxi", "Ventura", "Emerald", "Rocio"] },
    { id: "palta", nombre: "Palta", variedades: ["Hass", "Fuerte", "Zutano", "Ettinger"] },
];

export const getVariedadesDeFruta = (nombreFruta: string) =>
    CATALOGO_FRUTAS.find((fruta) => fruta.nombre === nombreFruta)?.variedades ?? [];
