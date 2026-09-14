import FilterBar, { FilterDateField, FilterSearch } from "@/shared/components/FilterBar";

interface CampaignFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
    hasActiveFilters: boolean;
    onClear: () => void;
}

export default function CampaignFilters({
    search,
    onSearchChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    hasActiveFilters,
    onClear,
}: CampaignFiltersProps) {
    return (
        <FilterBar onClear={onClear} canClear={hasActiveFilters} className="mb-8">
            <FilterSearch value={search} onChange={onSearchChange} placeholder="Buscar campaña..." />
            <FilterDateField label="Fecha inicio" value={startDate} onChange={onStartDateChange} />
            <FilterDateField label="Fecha fin" value={endDate} onChange={onEndDateChange} />
        </FilterBar>
    );
}
