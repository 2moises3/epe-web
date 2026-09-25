import { useMemo, useState } from "react";
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
import { carriers, drivers as allDrivers, vehicles as allVehicles, type Carrier, type Driver, type Vehicle } from "@/modules/carriers/carriers.data";

type DetailTab = "vehiculos" | "choferes";

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function CarrierDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const carrier = carriers.find((item) => String(item.id) === id);

    if (!carrier) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <Building2 size={44} className="text-brand" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-ink">Empresa no encontrada</h1>
                <p className="text-ink-muted">La empresa de transporte que buscas no está disponible.</p>
                <Button nativeButton={false} render={<Link to="/transportistas" />}><ArrowLeft />Volver a transporte</Button>
            </div>
        );
    }

    // Al cambiar de empresa se reinician pestaña, filtros y modales
    return <CarrierDetailsView key={carrier.id} carrier={carrier} />;
}

function CarrierDetailsView({ carrier }: { carrier: Carrier }) {
    const [activeTab, setActiveTab] = useState<DetailTab>("vehiculos");
    const [search, setSearch] = useState("");

    // `editing` se conserva al cerrar para que el modal no se vacíe durante su animación de salida
    const [vehicleModal, setVehicleModal] = useState<{ open: boolean; editing: Vehicle | null }>({ open: false, editing: null });
    const [driverModal, setDriverModal] = useState<{ open: boolean; editing: Driver | null }>({ open: false, editing: null });

    const [carrierVehicles, setCarrierVehicles] = useState(() => allVehicles.filter((item) => item.carrierId === carrier.id));
    const [carrierDrivers, setCarrierDrivers] = useState(() => allDrivers.filter((item) => item.carrierId === carrier.id));
    const [success, setSuccess] = useState<{ open: boolean; mode: CarrierSuccessMode }>({ open: false, mode: "vehicle-created" });

    const showSuccess = (mode: CarrierSuccessMode) => setSuccess({ open: true, mode });

    const deleteVehicle = (id: number) => {
        setCarrierVehicles((current) => current.filter((item) => item.id !== id));
        // Un chofer no puede quedar apuntando a un vehículo que ya no existe
        setCarrierDrivers((current) => current.map((item) => (item.vehiculoId === id ? { ...item, vehiculoId: null } : item)));
    };
    const deleteDriver = (id: number) => setCarrierDrivers((current) => current.filter((item) => item.id !== id));

    const filteredVehicles = useMemo(() => {
        const query = normalize(search.trim());
        const driverOf = (vehicle: Vehicle) => carrierDrivers.find((driver) => driver.vehiculoId === vehicle.id)?.nombre ?? "";
        return carrierVehicles.filter((row) => normalize(`${row.placa} ${driverOf(row)}`).includes(query));
    }, [carrierVehicles, carrierDrivers, search]);

    const filteredDrivers = useMemo(() => {
        const query = normalize(search.trim());
        const plateOf = (driver: Driver) => carrierVehicles.find((vehicle) => vehicle.id === driver.vehiculoId)?.placa ?? "";
        return carrierDrivers.filter((row) => normalize(`${row.nombre} ${row.correo} ${plateOf(row)}`).includes(query));
    }, [carrierVehicles, carrierDrivers, search]);

    const tabs: readonly SegmentedTabItem[] = [
        { id: "vehiculos", label: "Vehículos", icon: Truck, count: carrierVehicles.length },
        { id: "choferes", label: "Choferes", icon: UserRound, count: carrierDrivers.length },
    ];

    const isVehicles = activeTab === "vehiculos";
    const hasActiveFilters = search !== "";
    const clearFilters = () => {
        setSearch("");
    };
    const changeTab = (value: string) => {
        setActiveTab(value as DetailTab);
        clearFilters();
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Building2 size={24} strokeWidth={2.5} />}
                title="Detalle de Transporte"
                description="Datos de la empresa, sus vehículos y sus choferes."
                action={
                    isVehicles ? (
                        <Button size="xl" onClick={() => setVehicleModal({ open: true, editing: null })}>
                            <Truck size={20} strokeWidth={2.5} /> Registrar vehículo
                        </Button>
                    ) : (
                        <Button size="xl" onClick={() => setDriverModal({ open: true, editing: null })}>
                            <UserRound size={20} strokeWidth={2.5} /> Registrar chofer
                        </Button>
                    )
                }
            />

            <div className="mb-8 flex flex-col gap-6">
                <CarrierInfoCard carrier={carrier} vehicleCount={carrierVehicles.length} driverCount={carrierDrivers.length} />
                <SegmentedTabs tabs={tabs} value={activeTab} onChange={changeTab} />
            </div>

            <FilterBar onClear={clearFilters} canClear={hasActiveFilters} className="mb-8">
                <FilterSearch value={search} onChange={setSearch} placeholder={isVehicles ? "Buscar placa o chofer..." : "Buscar chofer, correo o placa..."} />
            </FilterBar>

            {isVehicles ? (
                <CarrierVehiclesTable
                    data={filteredVehicles}
                    drivers={carrierDrivers}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                    onEdit={(vehicle) => setVehicleModal({ open: true, editing: vehicle })}
                    onAdd={() => setVehicleModal({ open: true, editing: null })}
                    onDelete={deleteVehicle}
                />
            ) : (
                <CarrierDriversTable
                    data={filteredDrivers}
                    vehicles={carrierVehicles}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                    onEdit={(driver) => setDriverModal({ open: true, editing: driver })}
                    onAdd={() => setDriverModal({ open: true, editing: null })}
                    onDelete={deleteDriver}
                />
            )}

            <CarrierVehicleModal
                open={vehicleModal.open}
                onOpenChange={(open) => setVehicleModal((current) => ({ ...current, open }))}
                carrier={carrier}
                onSuccess={() => {
                    setVehicleModal((current) => ({ ...current, open: false }));
                    showSuccess(vehicleModal.editing ? "vehicle-updated" : "vehicle-created");
                }}
                mode={vehicleModal.editing ? "edit" : "create"}
                initialValues={vehicleModal.editing ? {
                    placa: vehicleModal.editing.placa,
                    ancho: String(vehicleModal.editing.ancho),
                    altura: String(vehicleModal.editing.altura),
                    profundidad: String(vehicleModal.editing.profundidad),
                    pesoNeto: String(vehicleModal.editing.pesoNeto),
                    pesoBruto: String(vehicleModal.editing.pesoBruto),
                } : undefined}
            />
            <CarrierDriverModal
                open={driverModal.open}
                onOpenChange={(open) => setDriverModal((current) => ({ ...current, open }))}
                carrier={carrier}
                onSuccess={() => {
                    setDriverModal((current) => ({ ...current, open: false }));
                    showSuccess(driverModal.editing ? "driver-updated" : "driver-created");
                }}
                mode={driverModal.editing ? "edit" : "create"}
                initialValues={driverModal.editing ? {
                    nombre: driverModal.editing.nombre,
                    telefono: driverModal.editing.telefono,
                    correo: driverModal.editing.correo,
                } : undefined}
            />

            <CarrierSuccessModal
                open={success.open}
                onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))}
                mode={success.mode}
            />
        </div>
    );
}
