import { useState, useMemo } from "react";
import ProvidersFilters from "@/modules/providers/components/ProvidersFilters";
import ProvidersTable from "@/modules/providers/components/ProvidersTable";
import ProviderCreateModal from "@/modules/providers/components/ProviderCreateModal";
import ProviderSuccessModal from "@/modules/providers/components/ProviderSuccessModal";
import PageHeader from "@/shared/layout/PageHeader";
import { Truck, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { providers } from "@/modules/providers/providers.data";

export default function ProvidersPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Filtros: cadena vacía = sin filtrar por ese campo
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [status, setStatus] = useState("");

    const clearFilters = () => {
        setSearch("");
        setType("");
        setRegistrationDate("");
        setStatus("");
    };

    const hasActiveFilters = search !== "" || type !== "" || registrationDate !== "" || status !== "";

    // Tipo y fecha de registro todavía no filtran: los datos de ejemplo no traen esos campos
    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return providers.filter((item) => {
            const matchesStatus = status === "" || item.estado.toLowerCase() === status;
            const matchesSearch = item.nombre.toLowerCase().includes(searchLower) || item.dni.includes(searchLower);
            return matchesStatus && matchesSearch;
        });
    }, [search, status]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setIsSuccessModalOpen(true);
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Gestión de Proveedores"
                description="Administra los proveedores y sus parcelas registrados en el sistema."
                action={
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 [&>button]:w-full sm:[&>button]:w-auto">
                        <Button
                            variant="outline"
                            size="xl"
                        >
                            Importar Excel
                        </Button>
                        <Button
                            size="xl"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={20} strokeWidth={2.5} /> Nuevo Proveedor
                        </Button>
                    </div>
                }
            />

            <ProvidersFilters
                search={search}
                onSearchChange={setSearch}
                type={type}
                onTypeChange={setType}
                registrationDate={registrationDate}
                onRegistrationDateChange={setRegistrationDate}
                status={status}
                onStatusChange={setStatus}
                hasActiveFilters={hasActiveFilters}
                onClear={clearFilters}
            />

            <ProvidersTable 
                data={filteredData}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
            />

            <ProviderCreateModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={handleCreateSuccess}
            />

            <ProviderSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
            />
        </div>
    );
}
