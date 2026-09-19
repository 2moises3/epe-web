import { useState } from "react";
import { Pencil, Eye, FileArchive, Truck, UserRound, ListFilter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import StatusBadge from "@/shared/components/StatusBadge";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ProviderInterviewModal from "./ProviderInterviewModal";
import ProviderEditModal from "./ProviderEditModal";
import ProviderViewModal from "./ProviderViewModal";
import ProviderSuccessModal from "./ProviderSuccessModal";
import type { Provider } from "@/modules/providers/providers.data";

const PAGE_SIZE = 8;

/** Color del acento decorativo lateral por estado, para la barra de la tabla desktop */
const STATUS_ACCENT_COLORS: Record<string, string> = {
    Aprobado: "bg-brand",
    "Por aprobar": "bg-status-highlight",
};

/** Mismo acento que STATUS_ACCENT_COLORS, como borde izquierdo para las tarjetas móvil/grilla */
const STATUS_ACCENT_BORDER: Record<string, string> = {
    Aprobado: "border-l-brand",
    "Por aprobar": "border-l-status-highlight",
};

interface ProvidersTableProps {
    data: Provider[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export default function ProvidersTable({ data, hasActiveFilters, onClearFilters }: ProvidersTableProps) {
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");
    const [editingProviderId, setEditingProviderId] = useState<number | null>(null);
    const [viewingProviderId, setViewingProviderId] = useState<number | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMode, setSuccessMode] = useState<"edit" | "interview">("edit");

    /** Exporta los proveedores visibles a CSV y lo descarga */
    const handleExportCSV = () => {
        const header = ["Nombre", "DNI", "Fruta", "Categoría", "Estado"];
        const rows = data.map((row) => [row.nombre, row.dni, row.fruta, row.categoria, row.estado]);
        const csvContent = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "proveedores.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    /** Editar y Ver detalles quedan siempre visibles; el resto se agrupa en el menú de "más opciones" */
    const getRowActions = (row: Provider) => {
        const primary: RowAction[] = [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingProviderId(row.id) },
            { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => setViewingProviderId(row.id) },
        ];
        const secondary: RowAction[] = [
            { label: "Ver entrevista", icon: <FileArchive size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) },
        ];
        return { primary, secondary };
    };

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <>
            <TableCard
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Proveedores Registrados"
                description="Gestiona, consulta y da seguimiento a todos tus proveedores registrados."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Truck size={16} strokeWidth={2.5} className="text-brand" />} count={data.length} label="proveedores" />
                        <TableExportMenu onExportExcel={handleExportCSV} onExportPdf={handleExportCSV} />
                        <TableViewToggle value={viewMode} onChange={setViewMode} />
                    </TableToolbar>
                }
                isEmpty={visibleData.length === 0}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay proveedores"}
                emptyDescription={
                    hasActiveFilters
                        ? "No hay proveedores que coincidan con los filtros aplicados. Intenta con otros criterios de búsqueda."
                        : "Aún no hay proveedores registrados. Haz clic en 'Nuevo Proveedor' para comenzar."
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
                {/* Móvil siempre en tarjetas; en desktop, tarjetas en grilla solo si se elige esa vista */}
                <div className={`flex flex-col gap-3 ${viewMode === "grid" ? "sm:grid sm:grid-cols-2 lg:grid-cols-3" : "sm:hidden"}`}>
                    {visibleData.map((row) => (
                        <TableGridCard
                            key={row.id}
                            accentColor={STATUS_ACCENT_BORDER[row.estado] ?? "border-l-status-neutral"}
                            icon={<UserRound size={18} strokeWidth={2} />}
                            title={row.nombre}
                            subtitle={`DNI ${row.dni}`}
                            badge={<StatusBadge status={row.estado} />}
                            actions={<RowActions {...getRowActions(row)} />}
                        >
                            <TableGridCardFields>
                                <TableGridCardField label="Fruta" value={row.fruta} />
                                <TableGridCardField label="Categoría" value={row.categoria} />
                            </TableGridCardFields>
                        </TableGridCard>
                    ))}
                </div>

                {viewMode === "table" && (
                <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="text-ink font-semibold h-14 px-6">Nombre</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Fruta</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Categoría de Fruta</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Estado</TableHead>
                                <TableHead className="text-ink font-semibold h-14 text-right px-6 w-40">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((row) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="h-20 px-6 relative">
                                        <TableRowAccent color={STATUS_ACCENT_COLORS[row.estado] ?? "bg-status-neutral"} />
                                        <TableRowLead icon={<UserRound size={20} strokeWidth={2} />} title={row.nombre} subtitle={`DNI ${row.dni}`} />
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.fruta}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.categoria}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={row.estado} />
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <RowActions {...getRowActions(row)} className="justify-end" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </TableCard>

            <ProviderInterviewModal
                open={isInterviewModalOpen}
                onOpenChange={setIsInterviewModalOpen}
                onSuccess={() => {
                    setIsInterviewModalOpen(false);
                    setSuccessMode("interview");
                    setIsSuccessModalOpen(true);
                }}
            />
            <ProviderEditModal
                open={editingProviderId !== null}
                onOpenChange={(open) => !open && setEditingProviderId(null)}
                onSuccess={() => {
                    setEditingProviderId(null);
                    setSuccessMode("edit");
                    setIsSuccessModalOpen(true);
                }}
            />
            <ProviderViewModal
                open={viewingProviderId !== null}
                onOpenChange={(open) => !open && setViewingProviderId(null)}
                providerId={viewingProviderId}
            />

            <ProviderSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successMode}
            />
        </>
    );
}
