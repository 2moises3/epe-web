import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, Contact, Layers, ArrowUpDown, ArrowUp, ArrowDown, Briefcase, ShieldCheck, Truck, Calendar, Package, Apple, Banana, Grape, Cherry, Leaf } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import StatusBadge from "@/shared/components/StatusBadge";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle } from "@/shared/components/TableToolbar";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import Hint from "@/shared/components/Hint";
import { Button } from "@/shared/components/ui/button";
import CampaignEditModal from "@/modules/campaigns/components/CampaignEditModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignLinkClientModal from "@/modules/campaigns/components/CampaignLinkClientModal";
import CampaignCertificationModal from "@/modules/campaigns/components/CampaignCertificationModal";
import type { Campaign } from "@/modules/campaigns/campaigns.data";

const PAGE_SIZE = 8;

type SortKey = "nombre" | "inicio" | "fin" | "kilos";

interface CampaignTableProps {
    data: Campaign[];
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

/** Color del acento decorativo lateral por estado, para la barra de la tabla desktop */
const STATUS_ACCENT_COLORS: Record<string, string> = {
    Planificado: "bg-brand",
    "En proceso": "bg-status-warning",
    Terminado: "bg-status-neutral",
};

/** Mismo acento que STATUS_ACCENT_COLORS, como borde izquierdo para las tarjetas móvil/grilla */
const STATUS_ACCENT_BORDER: Record<string, string> = {
    Planificado: "border-l-brand",
    "En proceso": "border-l-status-warning",
    Terminado: "border-l-status-neutral",
};

/** Las fechas llegan como dd/mm/aaaa, así que hay que invertirlas para comparar */
function toSortableDate(value: string) {
    const [day, month, year] = value.split("/");
    return `${year}${month}${day}`;
}

/** Calcula la duración exacta en meses entre dos fechas dd/mm/aaaa */
function getDurationInMonths(inicio: string, fin: string) {
    const [d1, m1, y1] = inicio.split("/");
    const [d2, m2, y2] = fin.split("/");
    const date1 = new Date(Number(y1), Number(m1) - 1, Number(d1));
    const date2 = new Date(Number(y2), Number(m2) - 1, Number(d2));
    const months = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
    const absMo = Math.abs(months) || 1;
    return `${absMo} mes${absMo !== 1 ? "es" : ""}`;
}

/** Formatea un número con separador de miles */
function formatNumber(value: string | number) {
    return Number(value).toLocaleString("es-PE");
}

/** Selecciona un ícono basado en el nombre de la campaña */
function getFruitIcon(nombre: string) {
    const n = nombre.toLowerCase();
    if (n.includes("banan")) return <Banana className="text-brand" size={22} strokeWidth={2} />;
    if (n.includes("uva")) return <Grape className="text-brand" size={22} strokeWidth={2} />;
    if (n.includes("cereza") || n.includes("cherry")) return <Cherry className="text-brand" size={22} strokeWidth={2} />;
    if (n.includes("palta") || n.includes("aguacate")) return <Leaf className="text-brand" size={22} strokeWidth={2} />;
    return <Apple className="text-brand" size={22} strokeWidth={2} />;
}

interface SortableHeadProps {
    label: string;
    sortKey: SortKey;
    sort: { key: SortKey; direction: "asc" | "desc" } | null;
    onToggle: (key: SortKey) => void;
    className?: string;
}

function SortableHead({ label, sortKey, sort, onToggle, className = "" }: SortableHeadProps) {
    const isActive = sort?.key === sortKey;
    const Icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
    const hint = !isActive ? "Ordenar ascendente" : sort.direction === "asc" ? "Ordenar descendente" : "Quitar orden";

    return (
        <TableHead className={`text-ink font-semibold h-14 ${className}`}>
            <Hint label={hint}>
                <button
                    onClick={() => onToggle(sortKey)}
                    className={`inline-flex items-center gap-1.5 transition-colors hover:text-brand ${isActive ? "text-brand" : ""}`}
                >
                    {label}
                    <Icon size={14} strokeWidth={2.5} className={isActive ? "opacity-100" : "opacity-40"} />
                </button>
            </Hint>
        </TableHead>
    );
}

export default function CampaignTable({ data, onClearFilters, hasActiveFilters }: CampaignTableProps) {
    const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
    const [managingClientsCampaignId, setManagingClientsCampaignId] = useState<number | null>(null);
    const [certifyingCampaignId, setCertifyingCampaignId] = useState<number | null>(null);
    // Campaña a la que se acaban de vincular clientes: el éxito ofrece ir a su detalle, que es donde se listan
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const [successModalMode, setSuccessModalMode] = useState<"edit" | "provider" | "client" | "certification">("edit");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");

    const sortedData = useMemo(() => {
        if (!sort) return data;
        return [...data].sort((a, b) => {
            const factor = sort.direction === "asc" ? 1 : -1;
            if (sort.key === "kilos") return (Number(a.kilos) - Number(b.kilos)) * factor;
            if (sort.key === "inicio" || sort.key === "fin") {
                return toSortableDate(a[sort.key]).localeCompare(toSortableDate(b[sort.key])) * factor;
            }
            return a.nombre.localeCompare(b.nombre) * factor;
        });
    }, [data, sort]);

    /** Exporta los datos visibles a CSV y lo descarga */
    const handleExportCSV = useCallback(() => {
        const header = ["Campaña", "Código", "Fecha Inicio", "Fecha Fin", "Periodo", "Kilos", "Estado"];
        const rows = sortedData.map((row, idx) => [
            row.nombre,
            `CAM-2026-${String(idx + 1).padStart(3, "0")}`,
            row.inicio,
            row.fin,
            getDurationInMonths(row.inicio, row.fin),
            row.kilos,
            row.estado,
        ]);
        const csvContent = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "campanas_exportacion.csv";
        link.click();
        URL.revokeObjectURL(url);
    }, [sortedData]);

    /** Editar y Ver detalles quedan siempre visibles; el resto de acciones se agrupa en el menú de "más opciones" */
    const getRowActions = (row: Campaign) => {
        const primary: RowAction[] = [];
        const secondary: RowAction[] = [];

        if (row.estado === "Planificado") {
            primary.push({ label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingCampaignId(row.id) });
        }
        primary.push({ label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.id}`) });

        if (row.estado === "Planificado" || row.estado === "En proceso") {
            secondary.push({ label: "Ver proveedores", icon: <Briefcase size={16} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.id}/providers`) });
        }
        if (row.estado === "Planificado") {
            secondary.push({ label: "Vincular clientes", icon: <Contact size={16} strokeWidth={2.5} />, onClick: () => setManagingClientsCampaignId(row.id) });
        }
        // Las certificaciones solo tienen sentido mientras la campaña se está planificando
        if (row.estado === "Planificado") {
            secondary.push({ label: "Registrar certificación", icon: <ShieldCheck size={16} strokeWidth={2.5} />, onClick: () => setCertifyingCampaignId(row.id) });
        }
        // Los pagos al transportista solo aplican una vez que la campaña está en proceso
        if (row.estado === "En proceso") {
            secondary.push({ label: "Transportista", icon: <Truck size={16} strokeWidth={2.5} />, onClick: () => navigate(`/campaigns/${row.id}/carrier-payments`) });
        }

        return { primary, secondary };
    };

    const handleEditSuccess = () => {
        setEditingCampaignId(null);
        setSuccessModalMode("edit");
        setIsSuccessModalOpen(true);
    };

    const toggleSort = (key: SortKey) => {
        setPage(1);
        setSort((current) => {
            if (current?.key !== key) return { key, direction: "asc" };
            if (current.direction === "asc") return { key, direction: "desc" };
            return null;
        });
    };

    const pageCount = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = sortedData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const toolbar = (
        <TableToolbar>
            <TableCountPill icon={<Layers size={16} strokeWidth={2.5} className="text-brand" />} count={sortedData.length} label="campañas" />
            <TableExportMenu onExportExcel={handleExportCSV} onExportPdf={handleExportCSV} />
            <TableViewToggle value={viewMode} onChange={setViewMode} />
        </TableToolbar>
    );

    return (
        <>
            <TableCard
                icon={<Layers size={24} strokeWidth={2.5} />}
                title="Campañas de Exportación"
                description="Gestiona, consulta y da seguimiento a todas tus campañas registradas."
                headerRight={toolbar}
                isEmpty={visibleData.length === 0}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay campañas"}
                emptyDescription={
                    hasActiveFilters
                        ? "Ninguna campaña coincide con los filtros aplicados. Prueba ajustándolos."
                        : "Cuando registres tu primera campaña de exportación aparecerá acá."
                }
                emptyAction={
                    hasActiveFilters ? (
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            size="xl" className="border-border text-ink-body hover:bg-muted hover:text-ink shadow-none transition-colors active:scale-95"
                        >
                            Limpiar filtros
                        </Button>
                    ) : undefined
                }
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
            >
                {/* ─── Mobile / Grid Cards ─── */}
                <div className={`flex flex-col gap-3 ${viewMode === 'grid' ? 'sm:grid sm:grid-cols-2 lg:grid-cols-3' : 'sm:hidden'}`}>
                    {visibleData.map((row, idx) => (
                        <TableGridCard
                            key={row.id}
                            accentColor={STATUS_ACCENT_BORDER[row.estado] ?? "border-l-status-neutral"}
                            icon={getFruitIcon(row.nombre)}
                            title={row.nombre}
                            subtitle={`CAM-2026-${String(idx + 1).padStart(3, "0")}`}
                            badge={<StatusBadge status={row.estado} />}
                            actions={<RowActions {...getRowActions(row)} />}
                        >
                            <div className="mx-4 flex flex-col gap-3 rounded-lg bg-surface-page border border-border p-3.5">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} strokeWidth={2.5} className="text-ink-muted shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold uppercase tracking-wider mb-0.5">Periodo</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[13px] font-semibold text-ink">{row.inicio} – {row.fin}</span>
                                            <span className="text-[12px]">• {getDurationInMonths(row.inicio, row.fin)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-border" />

                                <div className="flex items-center gap-3">
                                    <Package size={18} strokeWidth={2.5} className="text-ink-muted shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold uppercase tracking-wider mb-0.5">Requerimiento Comercial</span>
                                        <span className="text-[13px] font-semibold text-ink">{formatNumber(row.kilos)} Kilos</span>
                                    </div>
                                </div>
                            </div>
                        </TableGridCard>
                    ))}
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
                                <SortableHead label="Estado" sortKey="nombre" sort={sort} onToggle={toggleSort} className="w-[15%] text-center" />
                                <TableHead className="text-ink font-semibold h-14 w-50 text-center px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((row, idx) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="h-20 px-6 relative">
                                        <TableRowAccent color={STATUS_ACCENT_COLORS[row.estado] ?? "bg-status-neutral"} />
                                        <TableRowLead
                                            icon={getFruitIcon(row.nombre)}
                                            title={row.nombre}
                                            subtitle={`CAM-2026-${String(idx + 1).padStart(3, "0")}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={18} strokeWidth={2} className="text-ink-muted shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[13.5px] text-ink-body leading-tight">{row.inicio} – {row.fin}</span>
                                                <span className="text-[12.5px] font-medium mt-1">{getDurationInMonths(row.inicio, row.fin)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Package size={18} strokeWidth={2} className="text-ink-muted shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[13.5px] text-ink-body leading-tight">{formatNumber(row.kilos)}</span>
                                                <span className="text-[12.5px] font-medium mt-1">Kilos</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            <StatusBadge status={row.estado} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 text-center">
                                        <RowActions {...getRowActions(row)} className="justify-center text-ink-muted" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </TableCard>

            <CampaignEditModal
                open={editingCampaignId !== null}
                onOpenChange={(open) => !open && setEditingCampaignId(null)}
                campaignId={editingCampaignId}
                onSuccess={handleEditSuccess}
            />

            <CampaignLinkClientModal
                open={managingClientsCampaignId !== null}
                onOpenChange={(open) => !open && setManagingClientsCampaignId(null)}
                onSave={() => {
                    setLinkedCampaignId(managingClientsCampaignId);
                    setManagingClientsCampaignId(null);
                    setSuccessModalMode("client");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignCertificationModal
                open={certifyingCampaignId !== null}
                onOpenChange={(open) => !open && setCertifyingCampaignId(null)}
                onSave={() => {
                    setCertifyingCampaignId(null);
                    setSuccessModalMode("certification");
                    setIsSuccessModalOpen(true);
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
