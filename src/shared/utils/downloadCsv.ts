/**
 * Arma un CSV con las filas dadas y lo descarga. Es el mismo bloque que antes estaba copiado
 * en cada tabla que exporta (campañas, proveedores, clientes, pagos...).
 *
 * El BOM inicial es para que Excel abra los acentos bien; sin él "Campaña" sale como "CampaÃ±a".
 */
export function downloadCsv(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
    const escape = (cell: string | number | null | undefined) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");

    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
