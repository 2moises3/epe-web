import { useCallback, useEffect, useMemo, useState } from "react";
import { Truck, Building2 } from "lucide-react";
import CarriersFilters from "@/modules/carriers/components/CarriersFilters";
import CarriersTable from "@/modules/carriers/components/CarriersTable";
import CarrierFormModal from "@/modules/carriers/components/CarrierFormModal";
import CarrierSuccessModal, { type CarrierSuccessMode } from "@/modules/carriers/components/CarrierSuccessModal";
import PageHeader from "@/shared/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { createCarrier, deleteCarrier, getCarriers, updateCarrier, createVehicle, createDriver } from "@/modules/carriers/api/carrier.api";
import type { Carrier } from "@/modules/carriers/carriers.data";

export default function CarriersPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ open: boolean; mode: CarrierSuccessMode }>({ open: false, mode: "carrier-created" });
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const loadCarriers = useCallback(async () => {
        try {
            setError(null);
            setCarriers(await getCarriers());
        } catch {
            setError("No se pudieron cargar las empresas desde la API del backend.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Carga inicial desde la API: el estado se actualiza al resolverse la petición.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void loadCarriers(); }, [loadCarriers]);

    const hasActiveFilters = search !== "";

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return carriers.filter((item) => item.nombre.toLowerCase().includes(searchLower));
    }, [carriers, search]);

    const showSuccess = (mode: CarrierSuccessMode) => setSuccess({ open: true, mode });

    const handleCreateCarrier = async (values: { nombre: string; numero: string; correo: string; ruc: string }) => {
        try {
            await createCarrier(values);
            await loadCarriers();
            setIsCreateModalOpen(false);
            showSuccess("carrier-created");
        } catch {
            setError("No se pudo guardar la empresa. Verifica RUC, correo y conexión con el backend.");
        }
    };

    const handleUpdateCarrier = async (id: number, values: { nombre: string; numero: string; correo: string; ruc: string }) => {
        try {
            await updateCarrier(id, values);
            await loadCarriers();
        } catch {
            setError("No se pudo actualizar la empresa.");
            throw new Error("No se pudo actualizar la empresa.");
        }
    };

    const handleDeleteCarrier = async (id: number) => {
        try {
            await deleteCarrier(id);
            await loadCarriers();
            setSelectedIds((current) => { const next = new Set(current); next.delete(id); return next; });
        } catch {
            setError("El backend no pudo eliminar la empresa; puede tener vehículos o choferes asociados.");
        }
    };

    const toggleRow = (id: number) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = (ids: number[]) => {
        setSelectedIds((current) => {
            const allSelected = ids.every((id) => current.has(id));
            const next = new Set(current);
            ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
            return next;
        });
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Gestión de Transporte"
                description={`${carriers.length} empresas de transporte registradas`}
                action={
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 [&>button]:w-full sm:[&>button]:w-auto">
                        <Button
                            size="xl"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Building2 size={20} strokeWidth={2.5} /> Agregar empresa de transporte
                        </Button>
                    </div>
                }
            />

            {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {isLoading ? <div className="rounded-2xl border border-border bg-white p-6 text-center text-ink-muted">Cargando empresas de transporte...</div> : <>
            <CarriersFilters
                search={search}
                onSearchChange={setSearch}
                hasActiveFilters={hasActiveFilters}
                onClear={() => setSearch("")}
            />

            <CarriersTable
                data={filteredData}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={() => setSearch("")}
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                onToggleAll={toggleAll}
                onDelete={handleDeleteCarrier}
                onUpdateCarrier={handleUpdateCarrier}
                onCreateVehicle={async (carrierId, values) => { try { await createVehicle(carrierId, values); await loadCarriers(); } catch { setError("No se pudo registrar el vehículo."); throw new Error("No se pudo registrar el vehículo."); } }}
                onCreateDriver={async (carrierId, values) => { try { await createDriver(carrierId, values); await loadCarriers(); } catch { setError("No se pudo registrar el chofer."); throw new Error("No se pudo registrar el chofer."); } }}
            />
            </>}

            <CarrierFormModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={handleCreateCarrier}
            />

            <CarrierSuccessModal
                open={success.open}
                onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))}
                mode={success.mode}
            />
        </div>
    );
}
