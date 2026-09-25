import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Truck, UserRound, Building2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import PageHeader from "@/shared/layout/PageHeader";
import FilterBar, { FilterSearch } from "@/shared/components/FilterBar";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";
import CarrierInfoCard from "@/modules/carriers/components/CarrierInfoCard";
import CarrierVehiclesTable from "@/modules/carriers/components/CarrierVehiclesTable";
import CarrierDriversTable from "@/modules/carriers/components/CarrierDriversTable";
import CarrierVehicleModal from "@/modules/carriers/components/CarrierVehicleModal";
import CarrierDriverModal from "@/modules/carriers/components/CarrierDriverModal";
import CarrierSuccessModal, { type CarrierSuccessMode } from "@/modules/carriers/components/CarrierSuccessModal";
import { createDriver, createVehicle, deleteDriver, deleteVehicle, getCarrier, updateDriver, updateVehicle } from "@/modules/carriers/api/carrier.api";
import type { Carrier, Driver, Vehicle } from "@/modules/carriers/carriers.data";

type DetailTab = "vehiculos" | "choferes";
const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function CarrierDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const carrierId = Number(id);
    const [carrier, setCarrier] = useState<Carrier | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCarrier = useCallback(async () => {
        if (!Number.isInteger(carrierId) || carrierId < 1) {
            setError("La empresa de transporte no es válida.");
            setIsLoading(false);
            return;
        }
        try {
            setError(null);
            setCarrier(await getCarrier(carrierId));
        } catch {
            setCarrier(null);
            setError("No se pudo cargar la empresa de transporte desde el backend.");
        } finally {
            setIsLoading(false);
        }
    }, [carrierId]);

    // Carga inicial desde la API: el estado se actualiza al resolverse la petición.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void loadCarrier(); }, [loadCarrier]);

    if (isLoading) return <div className="p-8 text-center text-ink-muted">Cargando empresa de transporte...</div>;
    if (!carrier) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <Building2 size={44} className="text-brand" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-ink">Empresa no disponible</h1>
                <p role="alert" className="text-ink-muted">{error}</p>
                <Button nativeButton={false} render={<Link to="/transportistas" />}><ArrowLeft />Volver a transporte</Button>
            </div>
        );
    }
    return <CarrierDetailsView carrier={carrier} onRefresh={loadCarrier} />;
}

function CarrierDetailsView({ carrier, onRefresh }: { carrier: Carrier; onRefresh: () => Promise<void> }) {
    const [activeTab, setActiveTab] = useState<DetailTab>("vehiculos");
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [vehicleModal, setVehicleModal] = useState<{ open: boolean; editing: Vehicle | null }>({ open: false, editing: null });
    const [driverModal, setDriverModal] = useState<{ open: boolean; editing: Driver | null }>({ open: false, editing: null });
    const [success, setSuccess] = useState<{ open: boolean; mode: CarrierSuccessMode }>({ open: false, mode: "vehicle-created" });
    const carrierVehicles = carrier.vehiculos;
    const carrierDrivers = carrier.choferes;
    const showSuccess = (mode: CarrierSuccessMode) => setSuccess({ open: true, mode });

    const filteredVehicles = useMemo(() => {
        const query = normalize(search.trim());
        return carrierVehicles.filter((row) => normalize(row.placa).includes(query));
    }, [carrierVehicles, search]);
    const filteredDrivers = useMemo(() => {
        const query = normalize(search.trim());
        return carrierDrivers.filter((row) => normalize(`${row.nombre} ${row.correo} ${row.telefono}`).includes(query));
    }, [carrierDrivers, search]);

    const tabs: readonly SegmentedTabItem[] = [
        { id: "vehiculos", label: "Vehículos", icon: Truck, count: carrierVehicles.length },
        { id: "choferes", label: "Choferes", icon: UserRound, count: carrierDrivers.length },
    ];
    const isVehicles = activeTab === "vehiculos";
    const hasActiveFilters = search !== "";
    const clearFilters = () => setSearch("");
    const changeTab = (value: string) => { setActiveTab(value as DetailTab); clearFilters(); };

    async function saveVehicle(values: { placa: string; ancho: string; altura: string; profundidad: string; pesoNeto: string; pesoBruto: string }) {
        try {
            const input = {
                placa: values.placa,
                ancho: Number(values.ancho), altura: Number(values.altura), profundidad: Number(values.profundidad),
                pesoNeto: Number(values.pesoNeto), pesoBruto: Number(values.pesoBruto),
            };
            if (vehicleModal.editing) await updateVehicle(vehicleModal.editing.id, carrier.id, input);
            else await createVehicle(carrier.id, input);
            await onRefresh();
            setVehicleModal({ open: false, editing: null });
            showSuccess(vehicleModal.editing ? "vehicle-updated" : "vehicle-created");
        } catch {
            setError("No se pudo guardar el vehículo. Revisa placa, medidas y pesos.");
            throw new Error("No se pudo guardar el vehículo.");
        }
    }

    async function saveDriver(values: { nombre: string; telefono: string; correo: string }) {
        try {
            if (driverModal.editing) await updateDriver(driverModal.editing.id, values);
            else await createDriver(carrier.id, values);
            await onRefresh();
            setDriverModal({ open: false, editing: null });
            showSuccess(driverModal.editing ? "driver-updated" : "driver-created");
        } catch {
            setError("No se pudo guardar el chofer. Revisa sus datos y la empresa asociada.");
            throw new Error("No se pudo guardar el chofer.");
        }
    }

    async function removeVehicle(id: number) {
        try { await deleteVehicle(id); await onRefresh(); }
        catch { setError("No se puede eliminar el vehículo si el backend aún tiene asignaciones de transporte."); }
    }
    async function removeDriver(id: number) {
        try { await deleteDriver(id); await onRefresh(); }
        catch { setError("No se puede eliminar el chofer si el backend aún tiene asignaciones de transporte."); }
    }

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Building2 size={24} strokeWidth={2.5} />}
                title="Detalle de Transporte"
                description="Datos de la empresa, sus vehículos y sus choferes."
                action={isVehicles ? (
                    <Button size="xl" onClick={() => setVehicleModal({ open: true, editing: null })}><Truck size={20} strokeWidth={2.5} /> Registrar vehículo</Button>
                ) : (
                    <Button size="xl" onClick={() => setDriverModal({ open: true, editing: null })}><UserRound size={20} strokeWidth={2.5} /> Registrar chofer</Button>
                )}
            />
            {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <div className="mb-8 flex flex-col gap-6">
                <CarrierInfoCard carrier={carrier} vehicleCount={carrierVehicles.length} driverCount={carrierDrivers.length} />
                <SegmentedTabs tabs={tabs} value={activeTab} onChange={changeTab} />
            </div>
            <FilterBar onClear={clearFilters} canClear={hasActiveFilters} className="mb-8">
                <FilterSearch value={search} onChange={setSearch} placeholder={isVehicles ? "Buscar placa..." : "Buscar chofer, correo o teléfono..."} />
            </FilterBar>
            {isVehicles ? (
                <CarrierVehiclesTable data={filteredVehicles} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}
                    onEdit={(vehicle) => setVehicleModal({ open: true, editing: vehicle })} onAdd={() => setVehicleModal({ open: true, editing: null })} onDelete={removeVehicle} />
            ) : (
                <CarrierDriversTable data={filteredDrivers} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}
                    onEdit={(driver) => setDriverModal({ open: true, editing: driver })} onAdd={() => setDriverModal({ open: true, editing: null })} onDelete={removeDriver} />
            )}
            <CarrierVehicleModal open={vehicleModal.open} onOpenChange={(open) => setVehicleModal((current) => ({ ...current, open }))} carrier={carrier}
                onSuccess={saveVehicle} mode={vehicleModal.editing ? "edit" : "create"}
                initialValues={vehicleModal.editing ? {
                    placa: vehicleModal.editing.placa, ancho: String(vehicleModal.editing.ancho), altura: String(vehicleModal.editing.altura),
                    profundidad: String(vehicleModal.editing.profundidad), pesoNeto: String(vehicleModal.editing.pesoNeto), pesoBruto: String(vehicleModal.editing.pesoBruto),
                } : undefined} />
            <CarrierDriverModal open={driverModal.open} onOpenChange={(open) => setDriverModal((current) => ({ ...current, open }))} carrier={carrier}
                onSuccess={saveDriver} mode={driverModal.editing ? "edit" : "create"}
                initialValues={driverModal.editing ? { nombre: driverModal.editing.nombre, telefono: driverModal.editing.telefono, correo: driverModal.editing.correo } : undefined} />
            <CarrierSuccessModal open={success.open} onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))} mode={success.mode} />
        </div>
    );
}
