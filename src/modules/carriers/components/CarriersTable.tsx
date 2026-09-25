import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, Truck, UserRound, UserPlus2, Trash2, ListFilter, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ConfirmModal from "@/shared/components/ConfirmModal";
import CarrierSuccessModal, { type CarrierSuccessMode } from "./CarrierSuccessModal";
import CarrierFormModal from "./CarrierFormModal";
import CarrierVehicleModal from "./CarrierVehicleModal";
import CarrierDriverModal from "./CarrierDriverModal";
import type { Carrier } from "@/modules/carriers/carriers.data";
import type { CarrierInput, DriverInput, VehicleInput } from "@/modules/carriers/api/carrier.api";
import type { CarrierFormValues } from "./CarrierFormModal";
import type { DriverFormValues } from "./CarrierDriverModal";
import type { VehicleFormValues } from "./CarrierVehicleModal";

const PAGE_SIZE = 8;

interface CarriersTableProps {
    data: Carrier[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectedIds: Set<number>;
    onToggleRow: (id: number) => void;
    onToggleAll: (ids: number[]) => void;
    onDelete: (id: number) => void;
    onUpdateCarrier: (id: number, values: CarrierInput) => Promise<void>;
    onCreateVehicle: (carrierId: number, values: VehicleInput) => Promise<void>;
    onCreateDriver: (carrierId: number, values: DriverInput) => Promise<void>;
}

export default function CarriersTable({ data, hasActiveFilters, onClearFilters, selectedIds, onToggleRow, onToggleAll, onDelete, onUpdateCarrier, onCreateVehicle, onCreateDriver }: CarriersTableProps) {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [editingCarrierId, setEditingCarrierId] = useState<number | null>(null);
    const [vehicleCarrierId, setVehicleCarrierId] = useState<number | null>(null);
    const [driverCarrierId, setDriverCarrierId] = useState<number | null>(null);
    // La empresa a eliminar se guarda completa: al confirmar desaparece de `data` y el texto no debe vaciarse mientras el modal se cierra
    const [deleting, setDeleting] = useState<{ open: boolean; carrier: Carrier | null }>({ open: false, carrier: null });
    const [success, setSuccess] = useState<{ open: boolean; mode: CarrierSuccessMode }>({ open: false, mode: "carrier-updated" });

    const showSuccess = (mode: CarrierSuccessMode) => setSuccess({ open: true, mode });

    /** Ver y editar quedan siempre visibles; registrar vehículo/chofer y eliminar se agrupan en "más opciones" */
    const getRowActions = (row: Carrier): { primary: RowAction[]; secondary: RowAction[] } => {
        const primary: RowAction[] = [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingCarrierId(row.id) },
            { label: "Ver", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => navigate(`/transportistas/${row.id}`) },
            { label: "Eliminar", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: () => setDeleting({ open: true, carrier: row }) },
        ];
        const secondary: RowAction[] = [
            { label: "Registrar vehículo", icon: <Truck size={16} strokeWidth={2.5} />, variant: "brand", onClick: () => setVehicleCarrierId(row.id) },
            { label: "Registrar chofer", icon: <UserPlus2 size={16} strokeWidth={2.5} />, variant: "brand", onClick: () => setDriverCarrierId(row.id) },
        ];
        return { primary, secondary };
    };

    const editingCarrier = data.find((row) => row.id === editingCarrierId) ?? null;
    const vehicleCarrier = data.find((row) => row.id === vehicleCarrierId) ?? null;
    const driverCarrier = data.find((row) => row.id === driverCarrierId) ?? null;

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const visibleIds = visibleData.map((row) => row.id);
    const selectedOnPage = visibleIds.filter((id) => selectedIds.has(id)).length;
    const allOnPageSelected = visibleData.length > 0 && selectedOnPage === visibleData.length;

    return (
        <>
            <TableCard
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Empresas de Transporte Registradas"
                description="Gestiona, consulta y da seguimiento a todas tus empresas de transporte registradas."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Truck size={16} strokeWidth={2.5} className="text-brand" />} count={data.length} label="empresas" />
                    </TableToolbar>
                }
                isEmpty={visibleData.length === 0}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay empresas de transporte"}
                emptyDescription={
                    hasActiveFilters
                        ? "No hay empresas que coincidan con los filtros aplicados. Intenta con otros criterios de búsqueda."
                        : "Aún no hay empresas de transporte registradas. Haz clic en 'Agregar empresa de transporte' para comenzar."
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
                    ) : undefined
                }
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
            >
                {/* Móvil: siempre en tarjetas */}
                <div className="flex flex-col gap-3 sm:hidden">
                    {visibleData.map((row) => (
                        <TableGridCard
                            key={row.id}
                            icon={<Building2 size={18} strokeWidth={2} />}
                            title={
                                <span className="flex items-center gap-2">
                                    <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => onToggleRow(row.id)} aria-label={`Seleccionar ${row.nombre}`} />
                                    {row.nombre}
                                </span>
                            }
                            subtitle="Responsable de transporte"
                            actions={<RowActions {...getRowActions(row)} />}
                        >
                            <div className="mx-4 flex flex-col gap-2 rounded-lg bg-surface-page border border-border p-3 text-[13px]">
                                <div className="flex justify-between gap-3">
                                    <span className="font-bold uppercase tracking-wider text-[11px] text-ink-muted">Número</span>
                                    <span className="font-semibold text-ink truncate">{row.numero}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="font-bold uppercase tracking-wider text-[11px] text-ink-muted">RUC</span>
                                    <span className="font-semibold text-ink truncate">{row.ruc}</span>
                                </div>
                            </div>
                        </TableGridCard>
                    ))}
                </div>

                <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="w-12 px-6 h-14">
                                    <Checkbox
                                        checked={allOnPageSelected}
                                        indeterminate={selectedOnPage > 0 && !allOnPageSelected}
                                        onCheckedChange={() => onToggleAll(visibleIds)}
                                        aria-label="Seleccionar todos"
                                    />
                                </TableHead>
                                <TableHead className="text-ink font-semibold h-14">Nombre completo</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Número</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Correo</TableHead>
                                <TableHead className="text-ink font-semibold h-14">RUC</TableHead>
                                <TableHead className="text-ink font-semibold h-14 text-right px-6 w-40">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((row) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="px-6">
                                        <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => onToggleRow(row.id)} aria-label={`Seleccionar ${row.nombre}`} />
                                    </TableCell>
                                    <TableCell className="h-20">
                                        <TableRowLead icon={<UserRound size={20} strokeWidth={2} />} title={row.nombre} subtitle="Responsable de transporte" />
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.numero}</TableCell>
                                    <TableCell>
                                        <a href={`mailto:${row.correo}`} className="text-brand font-medium hover:underline">{row.correo}</a>
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.ruc}</TableCell>
                                    <TableCell className="px-6">
                                        <RowActions {...getRowActions(row)} className="justify-end" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TableCard>

            <CarrierFormModal
                open={editingCarrierId !== null}
                onOpenChange={(open) => !open && setEditingCarrierId(null)}
                mode="edit"
                initialValues={editingCarrier ?? undefined}
                onSuccess={async (values: CarrierFormValues) => {
                    if (!editingCarrier) return;
                    await onUpdateCarrier(editingCarrier.id, values);
                    setEditingCarrierId(null);
                    showSuccess("carrier-updated");
                }}
            />
            <CarrierVehicleModal
                open={vehicleCarrierId !== null}
                onOpenChange={(open) => !open && setVehicleCarrierId(null)}
                carrier={vehicleCarrier}
                onSuccess={async (values: VehicleFormValues) => {
                    if (!vehicleCarrier) return;
                    await onCreateVehicle(vehicleCarrier.id, {
                        placa: values.placa,
                        ancho: Number(values.ancho), altura: Number(values.altura), profundidad: Number(values.profundidad),
                        pesoNeto: Number(values.pesoNeto), pesoBruto: Number(values.pesoBruto),
                    });
                    setVehicleCarrierId(null);
                    showSuccess("vehicle-created");
                }}
            />
            <CarrierDriverModal
                open={driverCarrierId !== null}
                onOpenChange={(open) => !open && setDriverCarrierId(null)}
                carrier={driverCarrier}
                onSuccess={async (values: DriverFormValues) => {
                    if (!driverCarrier) return;
                    await onCreateDriver(driverCarrier.id, values);
                    setDriverCarrierId(null);
                    showSuccess("driver-created");
                }}
            />
            <ConfirmModal
                open={deleting.open}
                onOpenChange={(open) => setDeleting((current) => ({ ...current, open }))}
                icon={<Trash2 size={28} strokeWidth={2.25} />}
                title="¿Eliminar empresa?"
                description={<>Se intentará eliminar <strong className="font-bold text-ink">{deleting.carrier?.nombre}</strong>. El backend rechazará la operación si aún tiene vehículos o choferes asociados.</>}
                confirmLabel="Sí, eliminar"
                onConfirm={() => {
                    if (!deleting.carrier) return;
                    onDelete(deleting.carrier.id);
                }}
            />
            <CarrierSuccessModal
                open={success.open}
                onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))}
                mode={success.mode}
            />
        </>
    );
}
