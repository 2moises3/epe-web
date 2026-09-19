import { useMemo, useState } from "react";
import ClientsFilters from "@/modules/commercial-planning/components/ClientsFilters";
import ClientsTable from "@/modules/commercial-planning/components/ClientsTable";
import ClientCreateModal from "@/modules/commercial-planning/components/ClientCreateModal";
import ClientSuccessModal from "@/modules/commercial-planning/components/ClientSuccessModal";
import PageHeader from "@/shared/layout/PageHeader";
import { Contact, Plus, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { clients } from "@/modules/commercial-planning/clients.data";

export default function CommercialPlanningPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Filtros: cadena vacía = sin filtrar por ese campo.
    // Tipo y estado todavía no filtran: los datos de ejemplo no traen esos campos en el cliente
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

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return clients.filter((item) =>
            item.empresa.toLowerCase().includes(searchLower) || item.representante.toLowerCase().includes(searchLower)
        );
    }, [search]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setIsSuccessModalOpen(true);
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Contact size={24} strokeWidth={2.5} />}
                title="Planificación Comercial"
                description="Administra los clientes y planifica la gestión comercial."
                action={
                    <Button
                        size="xl"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <UserPlus size={20} strokeWidth={2.5} /> Nuevo Cliente
                    </Button>
                }
            />

            <ClientsFilters
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

            <ClientsTable
                data={filteredData}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
            />

            <ClientCreateModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={handleCreateSuccess}
            />

            <ClientSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
            />
        </div>
    );
}
