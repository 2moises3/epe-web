import { useState } from "react";
import { Truck } from "lucide-react";
import PageHeader from "@/shared/layout/PageHeader";
import ProvidersTable from "@/modules/providers/components/ProvidersTable";
import FilterBar, { FilterSearch } from "@/shared/components/FilterBar";

export default function ProvidersPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Gestión de Proveedores"
                description="Administra los proveedores y sus parcelas registrados en el sistema."
            />

            <FilterBar onClear={() => setSearch("")} canClear={search !== ""} className="mb-8">
                <FilterSearch value={search} onChange={setSearch} placeholder="Buscar por nombre, documento o zona..." />
            </FilterBar>

            <ProvidersTable search={search} />
        </div>
    );
}
