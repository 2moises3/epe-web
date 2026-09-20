import FilterBar, { FilterDateField, FilterSearch, FilterSelectField, type FilterSelectOption } from "@/shared/components/FilterBar";

const TYPE_OPTIONS: FilterSelectOption[] = [
    { value: "exportador", label: "Exportador" },
    { value: "industria", label: "Industria" },
];

interface ClientsFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    type: string;
    onTypeChange: (value: string) => void;
    registrationDate: string;
    onRegistrationDateChange: (value: string) => void;
    hasActiveFilters: boolean;
    onClear: () => void;
}

export default function ClientsFilters({
    search,
    onSearchChange,
    type,
    onTypeChange,
    registrationDate,
    onRegistrationDateChange,
    hasActiveFilters,
    onClear,
}: ClientsFiltersProps) {
    return (
        <FilterBar onClear={onClear} canClear={hasActiveFilters} className="mb-8">
            <FilterSearch value={search} onChange={onSearchChange} placeholder="Buscar cliente..." />
            <FilterSelectField label="Tipo" options={TYPE_OPTIONS} value={type} onChange={onTypeChange} />
            <FilterDateField label="Fecha registro" value={registrationDate} onChange={onRegistrationDateChange} />
        </FilterBar>
    );
}
