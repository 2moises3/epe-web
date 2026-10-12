import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, Truck, UserRound, UserPlus2, Trash2, ListFilter, Building2, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
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
import { CARRIER_TIPOS, type CarrierFormValues, type CarrierProfile } from "@/modules/carriers/carrierProfile.utils";
import { toDriverInput, toVehicleInput } from "@/modules/carriers/carrierRecords.utils";
import type { DriverInput, VehicleInput } from "@/modules/carriers/api/carrier.api";
import type { DriverFormValues } from "./CarrierDriverModal";
import type { VehicleFormValues } from "./CarrierVehicleModal";

const PAGE_SIZE = 8;

/** Documento que identifica al transportista: el RUC de la empresa o el documento de identidad del independiente */
function identification(row: CarrierProfile): string {
    if (row.tipo === "privado") return row.documento ? `Documento ${row.documento}` : row.ruc ? `RUC ${row.ruc}` : "Sin documento";
    return row.ruc ? `RUC ${row.ruc}` : "Sin RUC";
}

function CardLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-3">
            <span className="font-bold uppercase tracking-wider text-[11px] text-ink-muted">{label}</span>
            <span className="font-semibold text-ink truncate">{value || "—"}</span>
        </div>
    );
}

interface CarriersTableProps {
    data: CarrierProfile[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectedIds: Set<number>;
    onToggleRow: (id: number) => void;
    onToggleAll: (ids: number[]) => void;
    onDelete: (id: number) => void;
    onUpdateCarrier: (id: number, values: CarrierFormValues) => Promise<void>;
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
    const [deleting, setDeleting] = useState<{ open: boolean; carrier: CarrierProfile | null }>({ open: false, carrier: null });
    const [success, setSuccess] = useState<{ open: boolean; mode: CarrierSuccessMode }>({ open: false, mode: "carrier-updated" });

    const showSuccess = (mode: CarrierSuccessMode) => setSuccess({ open: true, mode });

    /** Ver y editar quedan siempre visibles; registrar vehículo/chofer y eliminar se agrupan en "más opciones" */
    const getRowActions = (row: CarrierProfile): { primary: RowAction[]; secondary: RowAction[] } => {
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
                title="Transportistas Registrados"
                description="Consulta a los transportistas; el detalle completo está en Ver."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Truck size={16} strokeWidth={2.5} className="text-brand" />} count={data.length} label={data.length === 1 ? "transportista" : "transportistas"} />
                    </TableToolbar>
                }
                isEmpty={visibleData.length === 0}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay transportistas"}
                emptyDescription={
                    hasActiveFilters
                        ? "No hay transportistas que coincidan con los filtros aplicados. Intenta con otros criterios de búsqueda."
                        : "Aún no hay transportistas registrados. Haz clic en 'Registrar transportista' para comenzar."
                }
                emptyAction={
                    hasActiveFilters
                        ? { label: "Limpiar filtros", icon: <ListFilter size={18} />, onClick: onClearFilters, tone: "secondary" }
                        : undefined
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
                            icon={row.tipo === "privado" ? <UserRound size={18} strokeWidth={2} /> : <Building2 size={18} strokeWidth={2} />}
                            title={
                                <span className="flex items-center gap-2">
                                    <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => onToggleRow(row.id)} aria-label={`Seleccionar ${row.nombre}`} />
                                    {row.nombre}
                                </span>
                            }
                            subtitle={CARRIER_TIPOS[row.tipo].label}
                            actions={<RowActions {...getRowActions(row)} />}
                        >
                            <div className="mx-4 flex flex-col gap-2 rounded-lg bg-surface-page border border-border p-3 text-[13px]">
                                <CardLine label="MTC" value={row.mtc} />
                                <CardLine label="Teléfono" value={row.numero} />
                                <CardLine label="Ubicación" value={[row.ciudad, row.departamento].filter(Boolean).join(", ")} />
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
                                <TableHead className="text-ink font-semibold h-14">Transportista</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Tipo</TableHead>
                                <TableHead className="text-ink font-semibold h-14">MTC</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Contacto</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Ubicación</TableHead>
                                <TableHead className="text-ink font-semibold h-14 text-center px-6 w-40">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((row) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="px-6">
                                        <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => onToggleRow(row.id)} aria-label={`Seleccionar ${row.nombre}`} />
                                    </TableCell>
                                    <TableCell className="h-20">
                                        <TableRowLead
                                            icon={row.tipo === "privado" ? <UserRound size={20} strokeWidth={2} /> : <Building2 size={20} strokeWidth={2} />}
                                            title={row.nombre}
                                            subtitle={identification(row)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={row.tipo === "privado" ? "outline" : "brand"} className="h-6 px-2.5 text-[12px] font-semibold">
                                            {CARRIER_TIPOS[row.tipo].short}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.mtc || <span className="text-ink-muted">—</span>}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-[13.5px] font-semibold leading-tight text-ink-body">{row.numero || "—"}</span>
                                            {row.correo && (
                                                <a href={`mailto:${row.correo}`} className="mt-0.5 truncate text-[12px] font-medium text-brand hover:underline">{row.correo}</a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {row.ciudad ? (
                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="mt-0.5 shrink-0 text-ink-muted" />
                                                <div className="flex flex-col">
                                                    <span className="text-[13.5px] font-semibold leading-tight text-ink-body">{row.ciudad}</span>
                                                    <span className="mt-0.5 text-[12px] font-medium text-ink-muted">{row.provincia} · {row.departamento}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-ink-muted">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <RowActions {...getRowActions(row)} className="justify-center" />
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
                    await onCreateVehicle(vehicleCarrier.id, toVehicleInput(values));
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
                    await onCreateDriver(driverCarrier.id, toDriverInput(values));
                    setDriverCarrierId(null);
                    showSuccess("driver-created");
                }}
            />
            <ConfirmModal
                open={deleting.open}
                onOpenChange={(open) => setDeleting((current) => ({ ...current, open }))}
                icon={<Trash2 size={28} strokeWidth={2.25} />}
                title="¿Eliminar transportista?"
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
