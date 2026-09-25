export interface SortState<K extends string> {
    key: K;
    direction: "asc" | "desc";
}

/** Ciclo de un clic sobre el encabezado: ascendente → descendente → sin orden */
export function nextSort<K extends string>(current: SortState<K> | null, key: K): SortState<K> | null {
    if (current?.key !== key) return { key, direction: "asc" };
    if (current.direction === "asc") return { key, direction: "desc" };
    return null;
}
