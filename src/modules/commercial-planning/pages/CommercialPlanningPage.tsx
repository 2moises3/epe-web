import { useEffect, useMemo, useState } from "react";
import ClientsFilters from "@/modules/commercial-planning/components/ClientsFilters";
import ClientsTable from "@/modules/commercial-planning/components/ClientsTable";
import ClientFormModal from "@/modules/commercial-planning/components/ClientFormModal";
import ClientSuccessModal from "@/modules/commercial-planning/components/ClientSuccessModal";
import PageHeader from "@/shared/layout/PageHeader";
import { Contact, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getClientesNegocio } from "@/modules/clients/api/cliente-negocio.api";
import { toClient, type Client } from "@/modules/commercial-planning/clients.data";

export default function CommercialPlanningPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadClients = () => {
        setLoadError(null);
        return getClientesNegocio().then((items) => setClients(items.map(toClient))).catch(() => setLoadError("No se pudieron cargar los clientes."));
    };

    useEffect(() => { void loadClients(); }, []);

    // Filtros: cadena vacía = sin filtrar por ese campo.
    // Tipo y estado todavía no filtran: los datos de ejemplo no traen esos campos en el cliente
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");

    const clearFilters = () => {
        setSearch("");
        setType("");
        setRegistrationDate("");
    };

    const hasActiveFilters = search !== "" || type !== "" || registrationDate !== "";

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return clients.filter((item) =>
            item.empresa.toLowerCase().includes(searchLower) || item.representante.toLowerCase().includes(searchLower)
        ).filter((item) => !type || item.tipoCliente === type)
            .filter((item) => !registrationDate || item.createdAt.slice(0, 10) === registrationDate);
    }, [clients, search, type, registrationDate]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        void loadClients();
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
                hasActiveFilters={hasActiveFilters}
                onClear={clearFilters}
            />

            {loadError && <p role="alert" className="mb-4 text-sm text-red-600">{loadError}</p>}

            <ClientsTable
                data={filteredData}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onRefresh={loadClients}
            />

            <ClientFormModal
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
