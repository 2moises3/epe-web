import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Briefcase, Calendar, Contact, Eye, Layers, Package, Pencil, ShieldCheck, Truck } from "lucide-react";
import { ListFilter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import StatusBadge from "@/shared/components/StatusBadge";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import CampaignEditModal from "@/modules/campaigns/components/CampaignEditModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignCertificationsModal from "@/modules/campaigns/components/CampaignCertificationsModal";
import CampaignLinkClientModal from "@/modules/campaigns/components/CampaignLinkClientModal";
import { getCampanas } from "@/modules/campaigns/api/campaign.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import { filterCampanas } from "@/modules/campaigns/campaignFilters.utils";

const PAGE_SIZE = 8;
const STATUS_ACCENT: Record<string, string> = {
    planificacion: "bg-brand",
    "en proceso": "bg-status-warning",
    terminado: "bg-status-neutral",
};
const STATUS_BORDER: Record<string, string> = {
    planificacion: "border-l-brand",
    "en proceso": "border-l-status-warning",
    terminado: "border-l-status-neutral",
};

interface CampaignTableProps {
    search?: string;
    startDate?: string;
    endDate?: string;
    hasActiveFilters?: boolean;
    onClearFilters?: () => void;
}

export default function CampaignTable({ search = "", startDate = "", endDate = "", hasActiveFilters = false, onClearFilters }: CampaignTableProps) {
    const [campaigns, setCampaigns] = useState<Campana[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
    const [managingCertificationsCampaignId, setManagingCertificationsCampaignId] = useState<number | null>(null);
    const [managingClientsCampaignId, setManagingClientsCampaignId] = useState<number | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalMode, setSuccessModalMode] = useState<"edit" | "provider" | "certification" | "client">("edit");
    const [viewMode, setViewMode] = useState<TableViewMode>("table");
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const loadCampaigns = () => getCampanas()
        .then((items) => { setCampaigns(items); setError(null); })
        .catch(() => setError("No se pudieron cargar las campañas."))
        .finally(() => setIsLoading(false));

    useEffect(() => { void loadCampaigns(); }, []);

    const handleEditSuccess = () => {
        setEditingCampaignId(null);
        setSuccessModalMode("edit");
        setIsSuccessModalOpen(true);
        void loadCampaigns();
    };

    const filteredCampaigns = useMemo(() => {
        return filterCampanas(campaigns, search, startDate, endDate);
    }, [campaigns, search, startDate, endDate]);
    const visibleCount = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
    const currentPage = Math.min(page, visibleCount);
    const pageItems = filteredCampaigns.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getRowActions = (row: Campana) => {
        const primary: RowAction[] = [];
        const secondary: RowAction[] = [];
        if (row.estado === "planificacion") {
            primary.push({ label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingCampaignId(row.campaniaId) });
            secondary.push(
                { label: "Vincular clientes", icon: <Contact size={16} strokeWidth={2.5} />, onClick: () => setManagingClientsCampaignId(row.campaniaId) },
                { label: "Gestionar certificaciones", icon: <ShieldCheck size={16} strokeWidth={2.5} />, onClick: () => setManagingCertificationsCampaignId(row.campaniaId) },
            );
        }
        primary.push({ label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.campaniaId}`) });
        if (row.estado === "planificacion" || row.estado === "en proceso") {
            secondary.push({ label: "Ver proveedores", icon: <Briefcase size={16} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.campaniaId}/providers`) });
        }
        if (row.estado === "en proceso") {
            secondary.push({ label: "Pagos al transportista", icon: <Truck size={16} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.campaniaId}/carrier-payments`) });
        }
        return { primary, secondary };
    };

    if (isLoading || error) {
        return <div className={`rounded-2xl border border-border bg-white p-6 text-center ${error ? "text-red-600" : "text-ink-muted"}`}>{error ?? "Cargando campañas..."}</div>;
    }

    return (
        <>
            <TableCard
                icon={<Layers size={24} strokeWidth={2.5} />}
                title="Campañas de Exportación"
                description="Gestiona, consulta y da seguimiento a todas tus campañas registradas."
                headerRight={<TableToolbar><TableCountPill icon={<Layers size={16} strokeWidth={2.5} className="text-brand" />} count={filteredCampaigns.length} label="campañas" /><TableViewToggle value={viewMode} onChange={setViewMode} /></TableToolbar>}
                isEmpty={pageItems.length === 0}
                emptyTitle={search || startDate || endDate ? "Sin resultados" : "Aún no hay campañas"}
                emptyDescription={search || startDate || endDate ? "Ninguna campaña coincide con los filtros aplicados. Prueba ajustándolos." : "Cuando registres tu primera campaña de exportación aparecerá acá."}
                emptyAction={hasActiveFilters && onClearFilters ? (
                    <Button variant="outline" onClick={onClearFilters} className="border-border text-ink-body hover:bg-muted">
                        <ListFilter size={18} /> Limpiar filtros
                    </Button>
                ) : undefined}
                page={currentPage}
                pageCount={Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE))}
                onPageChange={setPage}
            >
                <div className={`flex flex-col gap-3 ${viewMode === "grid" ? "sm:grid sm:grid-cols-2 lg:grid-cols-3" : "sm:hidden"}`}>
                    {pageItems.map((row) => (
                        <TableGridCard key={row.campaniaId} accentColor={STATUS_BORDER[row.estado]} icon={<Package size={20} strokeWidth={2} />} title={row.nombre} subtitle={row.fruta?.name ?? "Campaña de exportación"} badge={<StatusBadge status={row.estado} />} actions={<RowActions {...getRowActions(row)} />}>
                            <div className="mx-4 grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface-page p-3">
                                <div className="flex flex-col"><span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Inicio</span><span className="text-[13px] font-semibold text-ink">{format(row.fechaInicio, "dd/MM/yyyy")}</span></div>
                                <div className="flex flex-col"><span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Fin</span><span className="text-[13px] font-semibold text-ink">{format(row.fechaFin, "dd/MM/yyyy")}</span></div>
                                <div className="col-span-2 flex flex-col"><span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Requerimiento comercial</span><span className="text-[13px] font-semibold text-ink">{row.requerimientoComercial.toLocaleString("es-PE")} kg</span></div>
                            </div>
                        </TableGridCard>
                    ))}
                </div>

                {viewMode === "table" && <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
                    <Table className="table-fixed w-full">
                        <TableHeader className={TABLE_HEAD_BG}><TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="h-14 w-[30%] px-6 font-semibold text-ink">Campaña</TableHead>
                            <TableHead className="h-14 font-semibold text-ink">Fruta</TableHead>
                            <TableHead className="h-14 font-semibold text-ink">Periodo</TableHead>
                            <TableHead className="h-14 text-center font-semibold text-ink">Req. comercial</TableHead>
                            <TableHead className="h-14 w-40 px-6 text-center font-semibold text-ink">Acciones</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>{pageItems.map((row) => <TableRow key={row.campaniaId} className="border-b border-border transition-colors hover:bg-surface-page/60">
                            <TableCell className="relative h-20 px-6"><TableRowAccent color={STATUS_ACCENT[row.estado]} /><TableRowLead icon={<Package size={20} strokeWidth={2} />} title={row.nombre} subtitle={<StatusBadge status={row.estado} />} /></TableCell>
                            <TableCell className="font-medium text-ink-body">{row.fruta?.name ?? "—"}</TableCell>
                            <TableCell><div className="flex items-center gap-3"><Calendar size={18} className="shrink-0 text-ink-muted" /><div className="flex flex-col"><span className="text-[13px] font-semibold text-ink-body">{format(row.fechaInicio, "dd/MM/yyyy")} – {format(row.fechaFin, "dd/MM/yyyy")}</span></div></div></TableCell>
                            <TableCell className="text-center font-semibold text-ink-body">{row.requerimientoComercial.toLocaleString("es-PE")} kg</TableCell>
                            <TableCell className="px-6"><RowActions {...getRowActions(row)} className="justify-center text-ink-muted" /></TableCell>
                        </TableRow>)}</TableBody>
                    </Table>
                </div>}
            </TableCard>

            <CampaignEditModal open={editingCampaignId !== null} campaniaId={editingCampaignId} onOpenChange={(open) => !open && setEditingCampaignId(null)} onSuccess={handleEditSuccess} />
            <CampaignCertificationsModal open={managingCertificationsCampaignId !== null} campaniaId={managingCertificationsCampaignId} onOpenChange={(open) => !open && setManagingCertificationsCampaignId(null)} onSuccess={() => { setManagingCertificationsCampaignId(null); setSuccessModalMode("certification"); setIsSuccessModalOpen(true); }} />
            <CampaignLinkClientModal open={managingClientsCampaignId !== null} campaniaId={managingClientsCampaignId} onOpenChange={(open) => !open && setManagingClientsCampaignId(null)} onSave={() => { setManagingClientsCampaignId(null); setSuccessModalMode("client"); setIsSuccessModalOpen(true); void loadCampaigns(); }} />
            <CampaignSuccessModal open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen} mode={successModalMode} />
        </>
    );
}
