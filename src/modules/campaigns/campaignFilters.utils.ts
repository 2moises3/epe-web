import { format } from "date-fns";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";

/** Applies the campaign list's search and inclusive calendar-date filters to fetched API models. */
export function filterCampanas(
    campanas: Campana[],
    search: string,
    startDate: string,
    endDate: string,
): Campana[] {
    const searchText = search.trim().toLocaleLowerCase();

    return campanas.filter((campana) => {
        const matchesSearch = `${campana.nombre} ${campana.fruta?.name ?? ""}`.toLocaleLowerCase().includes(searchText);
        const matchesStart = !startDate || format(campana.fechaInicio, "yyyy-MM-dd") >= startDate;
        const matchesEnd = !endDate || format(campana.fechaFin, "yyyy-MM-dd") <= endDate;
        return matchesSearch && matchesStart && matchesEnd;
    });
}
