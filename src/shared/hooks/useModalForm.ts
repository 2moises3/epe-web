import { useEffect, useRef, useState } from "react";

/**
 * Estado de un formulario dentro de un modal.
 *
 * Devuelve el valor y su setter, y lo vuelve a poner en `initial` cada vez que el modal cambia de
 * abierto a cerrado o al revés. Reiniciar **también al abrir** es lo que permite que un modal de
 * edición, que vive montado en la tabla, cargue los datos de la fila que el usuario acaba de tocar:
 * `useState` solo lee su valor inicial en el primer render, así que sin esto el formulario abriría
 * vacío.
 *
 * Va por efecto y no por el `onOpenChange` del modal a propósito: el cierre no siempre pasa por
 * ahí (la página puede cerrarlo sola después de guardar), y en esos casos un handler no se entera.
 */
export function useModalForm<T>(open: boolean, initial: T) {
    const [values, setValues] = useState<T>(initial);

    // `initial` se reconstruye en cada render; la ref evita que el efecto se dispare por eso
    const initialRef = useRef(initial);
    useEffect(() => {
        initialRef.current = initial;
    });

    useEffect(() => {
        setValues(initialRef.current);
    }, [open]);

    /** Setter por campo: `set("nombre")(valor)`. */
    const set = <K extends keyof T>(key: K) => (value: T[K]) =>
        setValues((current) => ({ ...current, [key]: value }));

    return [values, setValues, set] as const;
}

/**
 * Versión suelta para modales cuyo estado no es un único objeto: ejecuta `reset` cada vez que el
 * modal se abre o se cierra.
 */
export function useResetOnToggle(open: boolean, reset: () => void) {
    const resetRef = useRef(reset);

    useEffect(() => {
        resetRef.current = reset;
    });

    useEffect(() => {
        resetRef.current();
    }, [open]);
}
