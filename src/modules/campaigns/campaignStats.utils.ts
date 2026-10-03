import type { Campana } from "@/modules/campaigns/api/campaign.mapper";

export interface StatTrend {
    value: string;
    direction: "up" | "down" | "neutral";
}

const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

/** Cuántas campañas cumplen `matches` y tienen su fecha de referencia en el mes indicado (0 = este mes, -1 = el anterior) */
function countInMonth(campaigns: Campana[], now: Date, offset: number, referenceDate: (campaign: Campana) => Date, matches: (campaign: Campana) => boolean) {
    const target = monthIndex(now) + offset;
    return campaigns.filter((campaign) => matches(campaign) && monthIndex(referenceDate(campaign)) === target).length;
}

/** Variación porcentual entre dos meses. Si el mes anterior estaba en 0, cualquier valor nuevo cuenta como +100%. */
export function getTrend(current: number, previous: number): StatTrend {
    const percent = previous === 0 ? (current === 0 ? 0 : 100) : Math.round(((current - previous) / previous) * 100);
    if (percent === 0) return { value: "0%", direction: "neutral" };
    return { value: `${percent > 0 ? "+" : ""}${percent}%`, direction: percent > 0 ? "up" : "down" };
}

/**
 * Tendencia de una tarjeta: campañas que cumplen `matches` y empiezan (o terminan) este mes, comparadas
 * con las del mes anterior. Es lo que se puede calcular con las campañas que ya devuelve el backend;
 * no hay un servicio de históricos.
 */
export function getCampaignTrend(
    campaigns: Campana[],
    now: Date,
    matches: (campaign: Campana) => boolean = () => true,
    referenceDate: (campaign: Campana) => Date = (campaign) => campaign.fechaInicio,
): StatTrend {
    return getTrend(
        countInMonth(campaigns, now, 0, referenceDate, matches),
        countInMonth(campaigns, now, -1, referenceDate, matches),
    );
}
