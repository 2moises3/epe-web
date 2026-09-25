import { useState } from "react";
import { Pencil, Trash2, UserRound, ListFilter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ConfirmModal from "@/shared/components/ConfirmModal";
import type { Driver } from "@/modules/carriers/carriers.data";

const PAGE_SIZE = 8;

interface CarrierDriversTableProps {
    data: Driver[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onEdit: (driver: Driver) => void;
    onAdd: () => void;
    onDelete: (id: number) => void;
}

export default function CarrierDriversTable({ data, hasActiveFilters, onClearFilters, onEdit, onAdd, onDelete }: CarrierDriversTableProps) {
    const [page, setPage] = useState(1);
    // Se guarda el chofer completo: al confirmar sale de `data` y el texto no debe vaciarse mientras el modal se cierra
    const [deleting, setDeleting] = useState<{ open: boolean; driver: Driver | null }>({ open: false, driver: null });

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getRowActions = (row: Driver): { primary: RowAction[] } => ({
        primary: [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => onEdit(row) },
            { label: "Eliminar", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: () => setDeleting({ open: true, driver: row }) },
        ],
    });

    return (
        <>
        <TableCard
            icon={<UserRound size={24} strokeWidth={2.5} />}
            title="Choferes registrados"
            description="Los choferes y vehículos se asignan por rango de fechas dentro de cada trazabilidad de transporte."
            headerRight={
                <TableToolbar>
                    <TableCountPill icon={<UserRound size={16} strokeWidth={2.5} className="text-brand" />} count={data.length} label="choferes" />
                </TableToolbar>
            }
            isEmpty={visibleData.length === 0}
            emptyIcon={<UserRound size={28} strokeWidth={2} />}
            emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay choferes"}
            emptyDescription={
                hasActiveFilters
                    ? "Ningún chofer coincide con la búsqueda. Prueba con otro nombre o placa."
                    : "Esta empresa todavía no tiene choferes registrados."
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
                        <UserRound size={16} strokeWidth={2.5} /> Registrar chofer
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
                        icon={<UserRound size={18} strokeWidth={2} />}
                        title={row.nombre}
                        subtitle={row.telefono}
                        actions={<RowActions {...getRowActions(row)} />}
                    >
                        <TableGridCardFields>
                            <TableGridCardField label="Correo" value={row.correo} />
                        </TableGridCardFields>
                    </TableGridCard>
                ))}
            </div>

            <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                <Table>
                    <TableHeader className={TABLE_HEAD_BG}>
                        <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="text-ink font-semibold h-14 px-6">Chofer</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Teléfono</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Correo</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Asignación</TableHead>
                            <TableHead className="text-ink font-semibold h-14 text-right px-6 w-36">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleData.map((row) => {
                            return (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="h-20 px-6">
                                        <TableRowLead icon={<UserRound size={20} strokeWidth={2} />} title={row.nombre} />
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.telefono}</TableCell>
                                    <TableCell>
                                        <a href={`mailto:${row.correo}`} className="text-brand font-medium hover:underline">{row.correo}</a>
                                    </TableCell>
                                    <TableCell className="text-ink-muted font-medium">
                                        Por trazabilidad
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
            title="¿Eliminar chofer?"
            description={<>Se eliminará a <strong className="font-bold text-ink">{deleting.driver?.nombre}</strong>. Esta acción no se puede deshacer.</>}
            confirmLabel="Sí, eliminar"
            onConfirm={() => {
                if (!deleting.driver) return;
                onDelete(deleting.driver.id);
            }}
        />
        </>
    );
}
