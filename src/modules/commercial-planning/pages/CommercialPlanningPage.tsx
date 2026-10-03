import { useEffect, useMemo, useState } from "react";
import ClientsFilters from "@/modules/commercial-planning/components/ClientsFilters";
import ClientsTable from "@/modules/commercial-planning/components/ClientsTable";
import ClientFormModal from "@/modules/commercial-planning/components/ClientFormModal";
import ClientSuccessModal from "@/modules/commercial-planning/components/ClientSuccessModal";
import PageHeader from "@/shared/layout/PageHeader";
import { Contact, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getClientesNegocio } from "@/modules/clients/api/cliente-negocio.api";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

export default function CommercialPlanningPage() {
    const [clients, setClients] = useState<ClienteNegocio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");

    const reloadClients = () => {
        setLoadError(null);
        setIsLoading(true);
        setReloadKey((key) => key + 1);
    };

    useEffect(() => {
        let active = true;
        getClientesNegocio()
            .then((items) => { if (active) setClients(items); })
            .catch(() => { if (active) setLoadError("No se pudieron cargar los clientes. Verifica la conexión e inténtalo nuevamente."); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [reloadKey]);

    const clearFilters = () => { setSearch(""); setType(""); };
    const hasActiveFilters = search !== "" || type !== "";
    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return clients.filter((client) =>
            (client.nombreEmpresa.toLowerCase().includes(searchLower) || client.nombreContacto.toLowerCase().includes(searchLower))
            && (!type || client.tipoCliente === type),
        );
    }, [clients, search, type]);

    const handleSaved = () => {
        setIsCreateModalOpen(false);
        setIsSuccessModalOpen(true);
        reloadClients();
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Contact size={24} strokeWidth={2.5} />}
                title="Planificación Comercial"
                description="Administra los clientes y planifica la gestión comercial."
                action={<Button size="xl" onClick={() => setIsCreateModalOpen(true)}><UserPlus size={20} strokeWidth={2.5} /> Nuevo cliente</Button>}
            />

            <ClientsFilters
                search={search}
                onSearchChange={setSearch}
                type={type}
                onTypeChange={setType}
                hasActiveFilters={hasActiveFilters}
                onClear={clearFilters}
            />

            {isLoading ? (
                <div role="status" aria-live="polite" className="rounded-xl border border-border bg-white p-8 text-center text-ink-muted">Cargando clientes...</div>
            ) : loadError ? (
                <div role="alert" className="rounded-xl border border-border bg-white p-8 text-center text-destructive">
                    <p>{loadError}</p>
                    <Button className="mt-4" variant="outline" onClick={reloadClients}>Reintentar</Button>
                </div>
            ) : (
                <ClientsTable
                    data={filteredData}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                    onChanged={reloadClients}
                />
            )}

            <ClientFormModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSuccess={handleSaved} />
            <ClientSuccessModal open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen} />
        </div>
    );
}
