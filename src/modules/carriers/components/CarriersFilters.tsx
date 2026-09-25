import FilterBar, { FilterSearch } from "@/shared/components/FilterBar";

interface CarriersFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    hasActiveFilters: boolean;
    onClear: () => void;
}

export default function CarriersFilters({ search, onSearchChange, hasActiveFilters, onClear }: CarriersFiltersProps) {
    return (
        <FilterBar onClear={onClear} canClear={hasActiveFilters} className="mb-8">
            <FilterSearch value={search} onChange={onSearchChange} placeholder="Buscar responsable..." />
        </FilterBar>
    );
}
