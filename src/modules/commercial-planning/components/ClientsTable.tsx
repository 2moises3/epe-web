import { useState } from "react";
import { Pencil, Eye, Contact, FileSignature, ListFilter, Trash2, TriangleAlert, RotateCw, SearchX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import TableCard from "@/shared/components/TableCard";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ClientFormModal from "@/modules/commercial-planning/components/ClientFormModal";
import ClientViewModal from "@/modules/commercial-planning/components/ClientViewModal";
import ClientSuccessModal from "@/modules/commercial-planning/components/ClientSuccessModal";
import CampaignLinkClientModal from "@/modules/campaigns/components/CampaignLinkClientModal";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

const PAGE_SIZE = 8;

const TIPO_LABEL: Record<string, string> = { exportador: "Exportador", industria: "Industria" };

interface ClientsTableProps {
    data: ClienteNegocio[];
    isLoading: boolean;
    loadError: string | null;
    onRetry: () => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    /** Recarga la lista sin desmontar la tabla, así no se pierden los modales de éxito */
    onChanged: () => void;
    onDelete: (client: ClienteNegocio) => Promise<void>;
}

export default function ClientsTable({ data, isLoading, loadError, onRetry, hasActiveFilters, onClearFilters, onChanged, onDelete }: ClientsTableProps) {
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");
    // Se conserva el cliente al cerrar para que los modales no se vacíen durante su animación de salida
    const [editing, setEditing] = useState<{ open: boolean; client: ClienteNegocio | null }>({ open: false, client: null });
    const [viewing, setViewing] = useState<{ open: boolean; client: ClienteNegocio | null }>({ open: false, client: null });
    const [contract, setContract] = useState<{ open: boolean; client: ClienteNegocio | null }>({ open: false, client: null });
    const [deleting, setDeleting] = useState<{ open: boolean; client: ClienteNegocio | null }>({ open: false, client: null });
    const [success, setSuccess] = useState<{ open: boolean; mode: "edit" | "contract" }>({ open: false, mode: "edit" });

    /** Exporta los clientes visibles a CSV y lo descarga */
    const handleExportCSV = () =>
        downloadCsv(
            "clientes.csv",
            ["Empresa", "Contacto", "Teléfono", "Correo", "RUC", "Ubicación", "Tipo"],
            data.map((row) => [row.nombreEmpresa, row.nombreContacto, row.telefono, row.correoCorporativo, row.ruc, row.ubicacion, TIPO_LABEL[row.tipoCliente] ?? row.tipoCliente]),
        );

    /** Ver, editar y eliminar quedan siempre visibles (CRUD); añadir contrato va en "más opciones" */
    const getRowActions = (row: ClienteNegocio): { primary: RowAction[]; secondary: RowAction[] } => ({
        primary: [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditing({ open: true, client: row }) },
            { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => setViewing({ open: true, client: row }) },
            { label: "Eliminar", icon: <Trash2 size={18} strokeWidth={2.5} />, variant: "destructive", onClick: () => setDeleting({ open: true, client: row }) },
        ],
        secondary: [
            { label: "Añadir contrato", icon: <FileSignature size={16} strokeWidth={2.5} />, variant: "brand", onClick: () => setContract({ open: true, client: row }) },
        ],
    });

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // El marco de la tabla se mantiene siempre; carga y error ocupan el lugar del estado vacío
    const emptyState = isLoading
        ? { icon: <Spinner className="size-7" />, title: "Cargando clientes", description: "Consultando los clientes registrados.", action: undefined }
        : loadError
            ? {
                icon: <TriangleAlert size={28} strokeWidth={2} />,
                title: "No se pudieron cargar los clientes",
                description: loadError,
                action: <Button variant="outline" onClick={onRetry}><RotateCw size={18} strokeWidth={2.5} /> Reintentar</Button>,
            }
            : {
                icon: <SearchX size={28} strokeWidth={2} />,
                title: hasActiveFilters ? "Sin resultados" : "Aún no hay clientes",
                description: hasActiveFilters
                    ? "Ningún cliente coincide con los filtros aplicados. Prueba ajustándolos."
                    : "Cuando registres tu primer cliente aparecerá acá.",
                action: hasActiveFilters
                    ? <Button variant="outline" onClick={onClearFilters}><ListFilter size={18} strokeWidth={2.5} /> Limpiar filtros</Button>
                    : undefined,
            };

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
                isEmpty={isLoading || loadError !== null || visibleData.length === 0}
                emptyIcon={emptyState.icon}
                emptyTitle={emptyState.title}
                emptyDescription={emptyState.description}
                emptyAction={emptyState.action}
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
            >
                {/* Móvil siempre en tarjetas; en desktop, tarjetas en grilla solo si se elige esa vista */}
                <div className={`flex flex-col gap-3 ${viewMode === "grid" ? "sm:grid sm:grid-cols-2 lg:grid-cols-3" : "sm:hidden"}`}>
                    {visibleData.map((row) => (
                        <TableGridCard
                            key={row.clienteNegocioId}
                            accentColor="border-l-brand"
                            icon={row.nombreEmpresa.charAt(0)}
                            title={row.nombreEmpresa}
                            subtitle={row.nombreContacto}
                            actions={<RowActions {...getRowActions(row)} />}
                        >
                            <div className="mx-4 flex flex-col gap-2.5 rounded-lg bg-surface-page border border-border p-3">
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted shrink-0">Teléfono</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.telefono}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">Correo</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.correoCorporativo}</span>
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
                                    <TableHead className="text-ink font-semibold h-14">Teléfono</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">Correo</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">RUC</TableHead>
                                    <TableHead className="text-ink font-semibold h-14 text-right px-6 w-48">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleData.map((row) => (
                                    <TableRow key={row.clienteNegocioId} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                        <TableCell className="h-20 px-6 relative">
                                            <TableRowAccent color="bg-brand" />
                                            <TableRowLead
                                                icon={row.nombreEmpresa.charAt(0)}
                                                title={row.nombreEmpresa}
                                                subtitle={`${row.nombreContacto} · ${TIPO_LABEL[row.tipoCliente] ?? row.tipoCliente}`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-ink-body font-medium">{row.telefono}</TableCell>
                                        <TableCell className="text-ink-body font-medium">{row.correoCorporativo}</TableCell>
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

            <ClientFormModal
                open={editing.open}
                onOpenChange={(open) => setEditing((current) => ({ ...current, open }))}
                mode="edit"
                clientId={editing.client?.clienteNegocioId}
                initialValues={editing.client ?? undefined}
                onSuccess={() => {
                    setEditing((current) => ({ ...current, open: false }));
                    setSuccess({ open: true, mode: "edit" });
                    onChanged();
                }}
            />

            <ClientViewModal
                open={viewing.open}
                onOpenChange={(open) => setViewing((current) => ({ ...current, open }))}
                client={viewing.client}
            />

            <CampaignLinkClientModal
                open={contract.open}
                onOpenChange={(open) => setContract((current) => ({ ...current, open }))}
                cliente={contract.client}
                onSave={() => {
                    setContract((current) => ({ ...current, open: false }));
                    setSuccess({ open: true, mode: "contract" });
                }}
            />

            <ConfirmModal
                open={deleting.open}
                onOpenChange={(open) => setDeleting((current) => ({ ...current, open }))}
                icon={<Trash2 size={28} strokeWidth={2.25} />}
                title="¿Eliminar cliente?"
                description={<>Se eliminará <strong className="font-bold text-ink">{deleting.client?.nombreEmpresa}</strong> de Planificación Comercial. Esta acción no se puede deshacer.</>}
                confirmLabel="Sí, eliminar"
                onConfirm={() => { if (deleting.client) void onDelete(deleting.client); }}
            />

            <ClientSuccessModal
                open={success.open}
                onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))}
                mode={success.mode}
            />
        </>
    );
}
