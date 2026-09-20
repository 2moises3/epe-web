import FilterBar, { FilterDateField, FilterSearch, FilterSelectField, type FilterSelectOption } from "@/shared/components/FilterBar";

const TYPE_OPTIONS: FilterSelectOption[] = [
    { value: "productor", label: "Productor" },
    { value: "acopiador", label: "Acopiador" },
];

const STATUS_OPTIONS: FilterSelectOption[] = [
    { value: "aprobado", label: "Aprobado" },
    { value: "por aprobar", label: "Por aprobar" },
];

interface ClientsFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    type: string;
    onTypeChange: (value: string) => void;
    registrationDate: string;
    onRegistrationDateChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
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
    status,
    onStatusChange,
    hasActiveFilters,
    onClear,
}: ClientsFiltersProps) {
    return (
        <FilterBar onClear={onClear} canClear={hasActiveFilters} className="mb-8">
            <FilterSearch value={search} onChange={onSearchChange} placeholder="Buscar cliente..." />
            <FilterSelectField label="Tipo" options={TYPE_OPTIONS} value={type} onChange={onTypeChange} />
            <FilterDateField label="Fecha registro" value={registrationDate} onChange={onRegistrationDateChange} />
            <FilterSelectField label="Estado" options={STATUS_OPTIONS} value={status} onChange={onStatusChange} />
        </FilterBar>
    );
}
