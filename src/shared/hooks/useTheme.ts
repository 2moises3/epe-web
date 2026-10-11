import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/** Misma clave que lee el script inline de index.html para pintar el tema antes del primer render (sin parpadeo). */
const STORAGE_KEY = "epe-theme";
const listeners = new Set<() => void>();
const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

function readStoredTheme(): Theme | null {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === "light" || value === "dark" ? value : null;
    } catch {
        return null;
    }
}

/** Sin elección guardada, sigue al sistema operativo. */
function getTheme(): Theme {
    return readStoredTheme() ?? (systemQuery.matches ? "dark" : "light");
}

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
}

function emit() {
    applyTheme(getTheme());
    listeners.forEach((listener) => listener());
}

// Si el usuario nunca eligió, el tema acompaña los cambios del sistema en vivo
systemQuery.addEventListener("change", () => {
    if (!readStoredTheme()) emit();
});

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function setTheme(theme: Theme) {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Sin storage (modo privado) el cambio igual se aplica, solo que no se recuerda
    }
    emit();
}

/** Tema activo de la app (claro/oscuro), compartido entre todos los componentes que lo lean. */
export function useTheme() {
    const theme = useSyncExternalStore(subscribe, getTheme);
    return { theme, setTheme };
}
