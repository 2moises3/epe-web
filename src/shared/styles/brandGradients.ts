import type { CSSProperties } from "react";

/**
 * Variantes del verde de marca derivadas de --brand (más luz y saturación) para que los degradados
 * se vean vivos sin inventar hex nuevos. Si el navegador no soporta `oklch(from …)`, queda --brand sólido.
 */
export const brandShade = (lightness: string, chroma: string, alpha = "1") =>
    `oklch(from var(--brand) calc(l ${lightness}) calc(c * ${chroma}) h / ${alpha})`;

/** Dos fondos recortados distinto: el primero rellena, el segundo asoma solo en el borde transparente */
export const GRADIENT_BORDER_CLIP: CSSProperties = {
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "border-box",
};

/**
 * Superficie verde "activa" (píldora del selector de estados, botones que invitan a actuar):
 * degradado claro → vivo, borde de luz → sombra suave y glow de color detrás.
 * El elemento necesita `border border-transparent` para que se vea el borde degradado.
 */
export const BRAND_ACTIVE_SURFACE: CSSProperties = {
    ...GRADIENT_BORDER_CLIP,
    backgroundColor: "var(--brand)",
    backgroundImage: `linear-gradient(135deg, ${brandShade("+ 0.13", "1.35")}, ${brandShade("+ 0.03", "1.3")}), linear-gradient(135deg, ${brandShade("+ 0.28", "0.9")}, ${brandShade("- 0.04", "1.1")})`,
    boxShadow: `0 10px 26px -8px ${brandShade("+ 0.08", "1.3", "0.6")}, 0 0 24px -6px ${brandShade("+ 0.1", "1.3", "0.45")}, inset 0 1px 0 rgb(255 255 255 / 0.3)`,
};
