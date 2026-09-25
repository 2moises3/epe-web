import { useMemo, useState } from "react";
import { Pencil, Trash2, Truck, ListFilter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ConfirmModal from "@/shared/components/ConfirmModal";
import SortableHead from "@/shared/components/SortableHead";
import { nextSort, type SortState } from "@/shared/utils/tableSort";
import { vehicleVolume, type Driver, type Vehicle } from "@/modules/carriers/carriers.data";

const PAGE_SIZE = 8;

type SortKey = "volumen";

const formatMeters = (value: number) => value.toFixed(2);

interface CarrierVehiclesTableProps {
    data: Vehicle[];
    drivers: Driver[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onEdit: (vehicle: Vehicle) => void;
    onAdd: () => void;
    onDelete: (id: number) => void;
}

export default function CarrierVehiclesTable({ data, drivers, hasActiveFilters, onClearFilters, onEdit, onAdd, onDelete }: CarrierVehiclesTableProps) {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState<SortKey> | null>(null);
    // Se guarda el vehículo completo: al confirmar sale de `data` y el texto no debe vaciarse mientras el modal se cierra
    const [deleting, setDeleting] = useState<{ open: boolean; vehicle: Vehicle | null }>({ open: false, vehicle: null });

    const driverOf = (vehicle: Vehicle) => drivers.find((driver) => driver.vehiculoId === vehicle.id)?.nombre;

    const sortedData = useMemo(() => {
        if (!sort) return data;
        const factor = sort.direction === "asc" ? 1 : -1;
        return [...data].sort((a, b) => (vehicleVolume(a) - vehicleVolume(b)) * factor);
    }, [data, sort]);

    const toggleSort = (key: SortKey) => {
        setPage(1);
        setSort((current) => nextSort(current, key));
    };

    const pageCount = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = sortedData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getRowActions = (row: Vehicle): { primary: RowAction[] } => ({
        primary: [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => onEdit(row) },
            { label: "Eliminar", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: () => setDeleting({ open: true, vehicle: row }) },
        ],
    });

    const dimensions = (row: Vehicle) => `${formatMeters(row.ancho)} × ${formatMeters(row.altura)} × ${formatMeters(row.profundidad)} m`;

    return (
        <>
        <TableCard
            icon={<Truck size={24} strokeWidth={2.5} />}
            title="Vehículos registrados"
            description="Capacidad y dimensiones de los vehículos asociados a esta empresa."
            headerRight={
                <TableToolbar>
                    <TableCountPill icon={<Truck size={16} strokeWidth={2.5} className="text-brand" />} count={data.length} label="vehículos" />
                </TableToolbar>
            }
            isEmpty={visibleData.length === 0}
            emptyIcon={<Truck size={28} strokeWidth={2} />}
            emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay vehículos"}
            emptyDescription={
                hasActiveFilters
                    ? "Ningún vehículo coincide con la búsqueda. Prueba con otra placa."
                    : "Esta empresa todavía no tiene vehículos registrados."
            }
            emptyAction={
                hasActiveFilters ? (
                    <Button
                        onClick={onClearFilters}
                        variant="outline"
                        className="h-9 px-4 rounded-lg font-semibold border-border text-brand hover:text-brand-dark hover:bg-brand-surface shadow-none transition-colors"
                    >
                        <ListFilter size={20} strokeWidth={2.5} /> Limpiar filtros
                    </Button>
                ) : (
                    <Button onClick={onAdd}>
                        <Truck size={16} strokeWidth={2.5} /> Registrar vehículo
                    </Button>
                )
            }
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
        >
            <div className="flex flex-col gap-3 sm:hidden">
                {visibleData.map((row) => (
                    <TableGridCard
                        key={row.id}
                        icon={<Truck size={18} strokeWidth={2} />}
                        title={row.placa}
                        subtitle={dimensions(row)}
                        actions={<RowActions {...getRowActions(row)} />}
                    >
                        <TableGridCardFields>
                            <TableGridCardField label="Volumen" value={`${vehicleVolume(row).toFixed(1)} m³`} />
                            <TableGridCardField label="Chofer" value={driverOf(row) ?? "Sin asignar"} />
                            <TableGridCardField label="Peso neto" value={`${row.pesoNeto} t`} />
                            <TableGridCardField label="Peso bruto" value={`${row.pesoBruto} t`} />
                        </TableGridCardFields>
                    </TableGridCard>
                ))}
            </div>

            <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                <Table>
                    <TableHeader className={TABLE_HEAD_BG}>
                        <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="text-ink font-semibold h-14 px-6">Placa</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Dimensiones</TableHead>
                            <SortableHead label="Volumen / Pesos" sortKey="volumen" sort={sort} onToggle={toggleSort} />
                            <TableHead className="text-ink font-semibold h-14">Chofer asignado</TableHead>
                            <TableHead className="text-ink font-semibold h-14 text-right px-6 w-36">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleData.map((row) => {
                            const driver = driverOf(row);
                            return (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="h-20 px-6">
                                        <TableRowLead icon={<Truck size={20} strokeWidth={2} />} title={row.placa} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-semibold text-ink">{dimensions(row)}</span>
                                            <span className="text-[12px] font-medium text-ink-muted">ancho · alto · profundidad</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-semibold text-ink">{vehicleVolume(row).toFixed(1)} m³</span>
                                            <span className="text-[12px] font-medium text-ink-muted">Neto {row.pesoNeto} t · Bruto {row.pesoBruto} t</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={driver ? "text-ink font-semibold" : "text-ink-muted font-medium"}>
                                        {driver ?? "Sin asignar"}
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <RowActions {...getRowActions(row)} className="justify-end" />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </TableCard>

        <ConfirmModal
            open={deleting.open}
            onOpenChange={(open) => setDeleting((current) => ({ ...current, open }))}
            icon={<Trash2 size={28} strokeWidth={2.25} />}
            title="¿Eliminar vehículo?"
            description={<>Se eliminará el vehículo <strong className="font-bold text-ink">{deleting.vehicle?.placa}</strong>. Su chofer quedará sin vehículo asignado.</>}
            confirmLabel="Sí, eliminar"
            onConfirm={() => {
                if (!deleting.vehicle) return;
                onDelete(deleting.vehicle.id);
            }}
        />
        </>
    );
}
