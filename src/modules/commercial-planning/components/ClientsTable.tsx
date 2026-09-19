import { useState } from "react";
import { Pencil, Eye, Contact, FileSignature, ListFilter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ClientEditModal from "./ClientEditModal";
import ClientViewModal from "./ClientViewModal";
import ClientAddContractModal from "./ClientAddContractModal";
import ClientSuccessModal from "./ClientSuccessModal";
import type { Client } from "@/modules/commercial-planning/clients.data";

const PAGE_SIZE = 8;

interface ClientsTableProps {
    data: Client[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export default function ClientsTable({ data, hasActiveFilters, onClearFilters }: ClientsTableProps) {
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");
    const [viewingClientId, setViewingClientId] = useState<number | null>(null);
    const [addingContractClientId, setAddingContractClientId] = useState<number | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMode, setSuccessMode] = useState<"edit" | "contract">("edit");

    /** Exporta los clientes visibles a CSV y lo descarga */
    const handleExportCSV = () => {
        const header = ["Empresa", "Representante", "Número", "Correo", "RUC"];
        const rows = data.map((row) => [row.empresa, row.representante, row.numero, row.correo, row.ruc]);
        const csvContent = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "clientes.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    /** Editar y Ver detalles quedan siempre visibles; el resto se agrupa en el menú de "más opciones" */
    const getRowActions = (row: Client) => {
        const primary: RowAction[] = [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingClientId(row.id) },
            { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => setViewingClientId(row.id) },
        ];
        const secondary: RowAction[] = [
            { label: "Añadir contrato", icon: <FileSignature size={16} strokeWidth={2.5} />, onClick: () => setAddingContractClientId(row.id) },
        ];
        return { primary, secondary };
    };

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <>
            <TableCard
                icon={<Contact size={24} strokeWidth={2.5} />}
                title="Clientes Generales"
                description="Gestiona, consulta y da seguimiento a todos tus clientes generales."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Contact size={16} strokeWidth={2.5} className="text-brand" />} count={data.length} label="clientes" />
                        <TableExportMenu onExportExcel={handleExportCSV} onExportPdf={handleExportCSV} />
                        <TableViewToggle value={viewMode} onChange={setViewMode} />
                    </TableToolbar>
                }
                isEmpty={visibleData.length === 0}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay clientes"}
                emptyDescription={
                    hasActiveFilters
                        ? "Ningún cliente coincide con los filtros aplicados. Prueba ajustándolos."
                        : "Cuando registres tu primer cliente aparecerá acá."
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
                            accentColor="border-l-brand"
                            icon={row.empresa.charAt(0)}
                            title={row.empresa}
                            subtitle={row.representante}
                            actions={<RowActions {...getRowActions(row)} />}
                        >
                            <div className="mx-4 flex flex-col gap-2.5 rounded-lg bg-surface-page border border-border p-3">
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider shrink-0">Número</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.numero}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">Correo</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.correo}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">RUC</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.ruc}</span>
                                </div>
                            </div>
                        </TableGridCard>
                    ))}
                </div>

                {viewMode === "table" && (
                <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="text-ink font-semibold h-14 px-6">Empresa</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Número</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Correo</TableHead>
                                <TableHead className="text-ink font-semibold h-14">RUC</TableHead>
                                <TableHead className="text-ink font-semibold h-14 text-right px-6 w-40">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((row) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="h-20 px-6 relative">
                                        <TableRowAccent color="bg-brand" />
                                        <TableRowLead icon={row.empresa.charAt(0)} title={row.empresa} subtitle={row.representante} />
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.numero}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.correo}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.ruc}</TableCell>
                                    <TableCell className="px-6">
                                        <RowActions {...getRowActions(row)} className="justify-end text-ink-muted" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </TableCard>

            <ClientEditModal
                open={editingClientId !== null}
                onOpenChange={(open) => !open && setEditingClientId(null)}
                onSuccess={() => {
                    setEditingClientId(null);
                    setSuccessMode("edit");
                    setIsSuccessModalOpen(true);
                }}
            />

            <ClientViewModal
                open={viewingClientId !== null}
                onOpenChange={(open) => !open && setViewingClientId(null)}
                clientId={viewingClientId}
            />

            <ClientAddContractModal
                open={addingContractClientId !== null}
                onOpenChange={(open) => !open && setAddingContractClientId(null)}
                onSuccess={() => {
                    setAddingContractClientId(null);
                    setSuccessMode("contract");
                    setIsSuccessModalOpen(true);
                }}
            />

            <ClientSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successMode}
            />
        </>
    );
}
