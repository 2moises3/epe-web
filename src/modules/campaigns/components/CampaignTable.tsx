import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Pencil, Eye, Contact, Layers, Briefcase, ShieldCheck, Truck, Calendar, Package, ListFilter, TriangleAlert, RotateCw, SearchX } from "lucide-react";
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
import StatusBadge from "@/shared/components/StatusBadge";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import SortableHead from "@/shared/components/SortableHead";
import { nextSort, type SortState } from "@/shared/utils/tableSort";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import CampaignFormModal from "@/modules/campaigns/components/CampaignFormModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignLinkClientModal from "@/modules/campaigns/components/CampaignLinkClientModal";
import CampaignCertificationsModal from "@/modules/campaigns/components/CampaignCertificationsModal";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { CampanaEstado } from "@/modules/campaigns/api/campaign.dto";
import { getCampaignFruitIcon } from "@/modules/campaigns/campaignFruit";
import { formatCampaignNumber, getCampaignDurationLabel } from "@/modules/campaigns/campaignDetails.utils";

const PAGE_SIZE = 8;

type SortKey = "nombre" | "inicio" | "kilos";

/** Texto visible de cada estado del backend */
const STATUS_LABEL: Record<CampanaEstado, string> = {
    planificacion: "Planificado",
    "en proceso": "En proceso",
    terminado: "Terminado",
};

/** Color del acento decorativo lateral por estado, para la barra de la tabla desktop */
const STATUS_ACCENT_COLORS: Record<CampanaEstado, string> = {
    planificacion: "bg-brand",
    "en proceso": "bg-status-warning",
    terminado: "bg-status-neutral",
};

/** Mismo acento que STATUS_ACCENT_COLORS, como borde izquierdo para las tarjetas móvil/grilla */
const STATUS_ACCENT_BORDER: Record<CampanaEstado, string> = {
    planificacion: "border-l-brand",
    "en proceso": "border-l-status-warning",
    terminado: "border-l-status-neutral",
};

const toDisplayDate = (date: Date) => format(date, "dd/MM/yyyy");
const durationLabel = (row: Campana) => getCampaignDurationLabel(toDisplayDate(row.fechaInicio), toDisplayDate(row.fechaFin));
const campaignCode = (row: Campana) => `CAM-${row.fechaInicio.getFullYear()}-${String(row.campaniaId).padStart(3, "0")}`;

interface CampaignTableProps {
    /** Campañas ya filtradas por la página (estado, búsqueda y fechas) */
    data: Campana[];
    isLoading: boolean;
    loadError: string | null;
    onRetry: () => void;
    /** Se llama cuando una acción de la tabla cambia datos en el backend, para recargar la página */
    onChanged: () => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export default function CampaignTable({ data, isLoading, loadError, onRetry, onChanged, hasActiveFilters, onClearFilters }: CampaignTableProps) {
    const navigate = useNavigate();
    const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
    const [managingClientsCampaignId, setManagingClientsCampaignId] = useState<number | null>(null);
    const [managingCertificationsCampaignId, setManagingCertificationsCampaignId] = useState<number | null>(null);
    // Campaña a la que se acaban de vincular clientes: el éxito ofrece ir a su detalle, que es donde se listan
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalMode, setSuccessModalMode] = useState<"edit" | "client" | "certification">("edit");
    const [sort, setSort] = useState<SortState<SortKey> | null>(null);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");

    const sortedData = useMemo(() => {
        if (!sort) return data;
        const factor = sort.direction === "asc" ? 1 : -1;
        return [...data].sort((a, b) => {
            if (sort.key === "kilos") return (a.requerimientoComercial - b.requerimientoComercial) * factor;
            if (sort.key === "inicio") return (a.fechaInicio.getTime() - b.fechaInicio.getTime()) * factor;
            return a.nombre.localeCompare(b.nombre, "es") * factor;
        });
    }, [data, sort]);

    const toggleSort = (key: SortKey) => {
        setPage(1);
        setSort((current) => nextSort(current, key));
    };

    /** Exporta las campañas visibles (pestaña, filtros y orden actuales) a CSV y lo descarga */
    const handleExportCSV = () =>
        downloadCsv(
            "campanas_exportacion.csv",
            ["Campaña", "Código", "Fruta", "Fecha Inicio", "Fecha Fin", "Periodo", "Kilos", "Estado"],
            sortedData.map((row) => [
                row.nombre,
                campaignCode(row),
                row.fruta?.name ?? "",
                toDisplayDate(row.fechaInicio),
                toDisplayDate(row.fechaFin),
                durationLabel(row),
                String(row.requerimientoComercial),
                STATUS_LABEL[row.estado],
            ]),
        );

    /** Editar y Ver detalles quedan siempre visibles; el resto de acciones se agrupa en el menú de "más opciones" */
    const getRowActions = (row: Campana) => {
        const primary: RowAction[] = [];
        const secondary: RowAction[] = [];

        if (row.estado === "planificacion") {
            primary.push({ label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingCampaignId(row.campaniaId) });
        }
        primary.push({ label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.campaniaId}`) });

        if (row.estado === "planificacion" || row.estado === "en proceso") {
            secondary.push({ label: "Ver proveedores", icon: <Briefcase size={16} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.campaniaId}/providers`) });
        }
        if (row.estado === "planificacion") {
            secondary.push({ label: "Vincular clientes", icon: <Contact size={16} strokeWidth={2.5} />, onClick: () => setManagingClientsCampaignId(row.campaniaId) });
            // Las certificaciones solo tienen sentido mientras la campaña se está planificando
            secondary.push({ label: "Gestionar certificaciones", icon: <ShieldCheck size={16} strokeWidth={2.5} />, onClick: () => setManagingCertificationsCampaignId(row.campaniaId) });
        }
        // Los pagos al transportista solo aplican una vez que la campaña está en proceso
        if (row.estado === "en proceso") {
            secondary.push({ label: "Transportista", icon: <Truck size={16} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.campaniaId}/carrier-payments`) });
        }

        return { primary, secondary };
    };

    const showSuccess = (mode: "edit" | "client" | "certification") => {
        setSuccessModalMode(mode);
        setIsSuccessModalOpen(true);
    };

    const pageCount = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = sortedData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // El marco de la tabla se mantiene siempre; carga y error ocupan el lugar del estado vacío
    const emptyState = isLoading
        ? { icon: <Spinner className="size-7" />, title: "Cargando campañas", description: "Consultando las campañas registradas.", action: undefined }
        : loadError
            ? {
                icon: <TriangleAlert size={28} strokeWidth={2} />,
                title: "No se pudieron cargar las campañas",
                description: loadError,
                action: <Button variant="outline" onClick={onRetry}><RotateCw size={18} strokeWidth={2.5} /> Reintentar</Button>,
            }
            : {
                icon: <SearchX size={28} strokeWidth={2} />,
                title: hasActiveFilters ? "Sin resultados" : "Aún no hay campañas",
                description: hasActiveFilters
                    ? "Ninguna campaña coincide con los filtros aplicados. Prueba ajustándolos."
                    : "Cuando registres tu primera campaña de exportación aparecerá acá.",
                action: hasActiveFilters
                    ? <Button variant="outline" onClick={onClearFilters}><ListFilter size={18} strokeWidth={2.5} /> Limpiar filtros</Button>
                    : undefined,
            };

    return (
        <>
            <TableCard
                icon={<Layers size={24} strokeWidth={2.5} />}
                title="Campañas de Exportación"
                description="Gestiona, consulta y da seguimiento a todas tus campañas registradas."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Layers size={16} strokeWidth={2.5} className="text-brand" />} count={sortedData.length} label="campañas" />
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
                {/* ─── Mobile / Grid Cards ─── */}
                <div className={`flex flex-col gap-3 ${viewMode === "grid" ? "sm:grid sm:grid-cols-2 lg:grid-cols-3" : "sm:hidden"}`}>
                    {visibleData.map((row) => {
                        const FruitIcon = getCampaignFruitIcon(row.nombre, row.fruta?.name);
                        return (
                            <TableGridCard
                                key={row.campaniaId}
                                accentColor={STATUS_ACCENT_BORDER[row.estado]}
                                icon={<FruitIcon className="text-brand" size={22} strokeWidth={2} />}
                                title={row.nombre}
                                subtitle={campaignCode(row)}
                                badge={<StatusBadge status={STATUS_LABEL[row.estado]} />}
                                actions={<RowActions {...getRowActions(row)} />}
                            >
                                <div className="mx-4 flex flex-col gap-3 rounded-lg bg-surface-page border border-border p-3.5">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} strokeWidth={2.5} className="text-ink-muted shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-0.5">Periodo</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[13px] font-semibold text-ink">{toDisplayDate(row.fechaInicio)} – {toDisplayDate(row.fechaFin)}</span>
                                                <span className="text-[12px]">• {durationLabel(row)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-border" />

                                    <div className="flex items-center gap-3">
                                        <Package size={18} strokeWidth={2.5} className="text-ink-muted shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-0.5">Requerimiento Comercial</span>
                                            <span className="text-[13px] font-semibold text-ink">{formatCampaignNumber(row.requerimientoComercial)} Kilos</span>
                                        </div>
                                    </div>
                                </div>
                            </TableGridCard>
                        );
                    })}
                </div>

                {/* ─── Desktop Table ─── */}
                {viewMode === "table" && (
                    <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                        <Table className="table-fixed w-full">
                            <TableHeader className={TABLE_HEAD_BG}>
                                <TableRow className="border-b border-border hover:bg-transparent">
                                    <SortableHead label="Campaña" sortKey="nombre" sort={sort} onToggle={toggleSort} className="px-6 w-[30%]" />
                                    <SortableHead label="Periodo" sortKey="inicio" sort={sort} onToggle={toggleSort} className="w-[25%]" />
                                    <SortableHead label="Req. Comercial" sortKey="kilos" sort={sort} onToggle={toggleSort} className="w-[15%]" />
                                    <TableHead className="text-ink font-semibold h-14 w-[15%] text-center">Estado</TableHead>
                                    <TableHead className="text-ink font-semibold h-14 w-50 text-center px-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleData.map((row) => {
                                    const FruitIcon = getCampaignFruitIcon(row.nombre, row.fruta?.name);
                                    return (
                                        <TableRow key={row.campaniaId} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                            <TableCell className="h-20 px-6 relative">
                                                <TableRowAccent color={STATUS_ACCENT_COLORS[row.estado]} />
                                                <TableRowLead
                                                    icon={<FruitIcon className="text-brand" size={22} strokeWidth={2} />}
                                                    title={row.nombre}
                                                    subtitle={row.fruta?.name ? `${row.fruta.name} · ${campaignCode(row)}` : campaignCode(row)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} strokeWidth={2} className="text-ink-muted shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-[13.5px] text-ink-body leading-tight">{toDisplayDate(row.fechaInicio)} – {toDisplayDate(row.fechaFin)}</span>
                                                        <span className="text-[12.5px] font-medium mt-1">{durationLabel(row)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Package size={18} strokeWidth={2} className="text-ink-muted shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-[13.5px] text-ink-body leading-tight">{formatCampaignNumber(row.requerimientoComercial)}</span>
                                                        <span className="text-[12.5px] font-medium mt-1">Kilos</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <StatusBadge status={STATUS_LABEL[row.estado]} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 text-center">
                                                <RowActions {...getRowActions(row)} className="justify-center text-ink-muted" />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </TableCard>

            <CampaignFormModal
                open={editingCampaignId !== null}
                onOpenChange={(open) => !open && setEditingCampaignId(null)}
                mode="edit"
                campaniaId={editingCampaignId}
                onSuccess={() => {
                    setEditingCampaignId(null);
                    showSuccess("edit");
                    onChanged();
                }}
            />

            <CampaignLinkClientModal
                open={managingClientsCampaignId !== null}
                campaniaId={managingClientsCampaignId}
                onOpenChange={(open) => !open && setManagingClientsCampaignId(null)}
                onSave={() => {
                    setLinkedCampaignId(managingClientsCampaignId);
                    setManagingClientsCampaignId(null);
                    showSuccess("client");
                }}
            />

            <CampaignCertificationsModal
                key={managingCertificationsCampaignId ?? "closed"}
                open={managingCertificationsCampaignId !== null}
                campaniaId={managingCertificationsCampaignId}
                onOpenChange={(open) => !open && setManagingCertificationsCampaignId(null)}
                onSuccess={() => {
                    setManagingCertificationsCampaignId(null);
                    showSuccess("certification");
                }}
            />

            <CampaignSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successModalMode}
                primaryAction={
                    successModalMode === "client" && linkedCampaignId !== null
                        ? { label: "Ir al listado", onClick: () => navigate(`/campaigns/${linkedCampaignId}`) }
                        : undefined
                }
            />
        </>
    );
}
