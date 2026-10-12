import { useEffect, useState } from "react";

/**
 * Precarga imágenes y avisa cuando todas terminaron (cargadas o con error: una imagen rota no debe dejar
 * esperando para siempre a quien depende de esto). Las deja en la caché del navegador, así que la pantalla
 * que las usa después las pinta al instante.
 *
 * `enabled` permite no gastar red hasta que haga falta (p. ej. solo tras iniciar sesión). Al desactivarse
 * vuelve a `false`, listo para una próxima carga.
 */
export function useImagesReady(urls: readonly string[], enabled: boolean): boolean {
    const [readyKey, setReadyKey] = useState<string | null>(null);
    const key = urls.join("|");

    useEffect(() => {
        if (!enabled || urls.length === 0) return;
        let cancelled = false;
        let pending = urls.length;
        const settle = () => {
            pending -= 1;
            if (pending === 0 && !cancelled) setReadyKey(key);
        };
        const images = urls.map((url) => {
            const image = new Image();
            image.onload = settle;
            image.onerror = settle;
            image.src = url;
            return image;
        });
        return () => {
            cancelled = true;
            images.forEach((image) => {
                image.onload = null;
                image.onerror = null;
            });
        };
    }, [enabled, key, urls]);

    return enabled && readyKey === key;
}
