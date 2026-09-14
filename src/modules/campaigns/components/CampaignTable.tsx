import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, Contact, Layers, ArrowUpDown, ArrowUp, ArrowDown, SearchX, Briefcase, ShieldCheck, Truck, Download, ChevronDown, Calendar, Package, Apple, Banana, LayoutGrid, Grape, Cherry, Leaf } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/shared/components/ui/dropdown-menu";
import { Card, CardContent } from "@/shared/components/ui/card";
import StatusBadge from "@/shared/components/StatusBadge";
import EmptyState from "@/shared/components/EmptyState";
import TablePagination from "@/shared/components/TablePagination";
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

/** Color del acento decorativo lateral por estado */
const STATUS_ACCENT_COLORS: Record<string, string> = {
    Planificado: "bg-brand",
    "En proceso": "bg-status-warning",
    Terminado: "bg-status-neutral",
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

/** Columnas que se pueden ocultar */
type ToggleableColumn = "periodo" | "volumen" | "estado";

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
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const [successModalMode, setSuccessModalMode] = useState<"edit" | "provider" | "client" | "certification">("edit");

    /** Columnas visibles (Campaña y Acciones siempre visibles) */
    const [visibleColumns, setVisibleColumns] = useState<Record<ToggleableColumn, boolean>>({
        periodo: true,
        volumen: true,
        estado: true,
    });

    const toggleColumn = (col: ToggleableColumn) => {
        setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
    };

    /** Exporta los datos visibles a CSV y lo descarga */
    const handleExportCSV = useCallback(() => {
        const header = ["Campaña", "Código", "Fecha Inicio", "Fecha Fin", "Periodo", "Kilos Org. Ven", "Estado"];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, sort]);

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
        if (row.estado === "Planificado" || row.estado === "En proceso") {
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

    const pageCount = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = sortedData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <>
            <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] overflow-hidden">
            <CardContent className="p-3 sm:p-5 flex flex-col gap-4 sm:gap-5">
                {/* ─── Toolbar ─── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-brand-surface text-brand">
                            <Layers size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[15px] sm:text-[17px] font-bold text-ink leading-tight mb-1">Campañas de Exportación</h2>
                            <p className="text-[12.5px] sm:text-[13px] text-ink-muted font-medium">Gestiona, consulta y da seguimiento a todas tus campañas registradas.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        {/* Píldora de conteo */}
                        <div className="flex items-center gap-2 px-3.5 py-2 sm:py-2.5 rounded-xl bg-brand-surface border border-brand-border">
                            <Layers size={16} strokeWidth={2.5} className="text-brand" />
                            <span className="text-[13px] font-bold text-brand-dark">{sortedData.length} campañas</span>
                        </div>
                        
                        {/* Exportar */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <button className="inline-flex items-center gap-2 h-10 sm:h-11 rounded-xl px-3 sm:px-4 border border-border bg-white text-ink-body text-[13px] font-semibold hover:bg-muted hover:text-ink shadow-sm transition-colors active:scale-95" />
                                }
                            >
                                <Download size={16} strokeWidth={2.5} className="text-ink-muted" />
                                Exportar
                                <ChevronDown size={14} strokeWidth={3} className="text-ink-muted/50" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-44 rounded-xl shadow-xl border-border/50 bg-white p-1.5">
                                <DropdownMenuItem onClick={handleExportCSV} className="gap-2.5 px-3 py-2.5 text-[13px] font-medium text-ink-body rounded-lg cursor-pointer transition-colors hover:!text-[#2e7d32] hover:bg-[#69b935]/15 focus:!text-[#2e7d32] focus:bg-[#69b935]/15">
                                    Exportar a Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportCSV} className="gap-2.5 px-3 py-2.5 text-[13px] font-medium text-ink-body rounded-lg cursor-pointer transition-colors hover:!text-[#2e7d32] hover:bg-[#69b935]/15 focus:!text-[#2e7d32] focus:bg-[#69b935]/15">
                                    Exportar a PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Columnas */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <button className="inline-flex items-center gap-2 h-10 sm:h-11 rounded-xl px-3 sm:px-4 border border-border bg-white text-ink-body text-[13px] font-semibold hover:bg-muted hover:text-ink shadow-sm transition-colors active:scale-95" />
                                }
                            >
                                <LayoutGrid size={16} strokeWidth={2.5} className="text-ink-muted" />
                                Columnas
                                <ChevronDown size={14} strokeWidth={3} className="text-ink-muted/50" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-48 rounded-xl shadow-xl border-border/50 bg-white p-1.5">
                                <DropdownMenuCheckboxItem checked disabled className="text-[13px] font-medium text-ink-muted rounded-lg opacity-60">
                                    Campaña
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.periodo} onCheckedChange={() => toggleColumn("periodo")} className="text-[13px] font-medium text-ink-body rounded-lg cursor-pointer">
                                    Periodo
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.volumen} onCheckedChange={() => toggleColumn("volumen")} className="text-[13px] font-medium text-ink-body rounded-lg cursor-pointer">
                                    Volumen
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={visibleColumns.estado} onCheckedChange={() => toggleColumn("estado")} className="text-[13px] font-medium text-ink-body rounded-lg cursor-pointer">
                                    Estado
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* ─── Mobile Cards ─── */}
                <div className="flex flex-col gap-3 sm:hidden">
                    {visibleData.map((row, idx) => (
                        <div
                            key={row.id}
                            className="rounded-xl border border-border bg-white overflow-hidden"
                        >
                            <div className="flex items-start justify-between gap-3 p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#f4faef] flex items-center justify-center shrink-0">
                                        {getFruitIcon(row.nombre)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold text-ink leading-tight">{row.nombre}</span>
                                        <span className="text-[12px] text-ink-muted font-medium mt-0.5">CAM-2026-{String(idx + 1).padStart(3, "0")}</span>
                                    </div>
                                </div>
                                <StatusBadge status={row.estado} />
                            </div>

                            <div className="mx-4 flex flex-col gap-3 rounded-lg bg-surface-page border border-border p-3.5">
                                {visibleColumns.periodo && (
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} strokeWidth={2.5} className="text-ink-muted shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-0.5">Periodo</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[13px] font-semibold text-ink">{row.inicio} – {row.fin}</span>
                                                <span className="text-[12px] text-ink-muted">• {getDurationInMonths(row.inicio, row.fin)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {visibleColumns.periodo && visibleColumns.volumen && <div className="h-px w-full bg-border" />}
                                
                                {visibleColumns.volumen && (
                                    <div className="flex items-center gap-3">
                                        <Package size={18} strokeWidth={2.5} className="text-ink-muted shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-0.5">Volumen</span>
                                            <span className="text-[13px] font-semibold text-ink">{formatNumber(row.kilos)} Kilos Org. Ven</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center mt-4 px-3 py-2 border-t border-border bg-surface-page/50 text-ink-muted">
                                <RowActions {...getRowActions(row)} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Desktop Table ─── */}
                <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                    <Table className="table-fixed w-full">
                        <TableHeader className="bg-[#f4faef]">
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <SortableHead label="Campaña" sortKey="nombre" sort={sort} onToggle={toggleSort} className="px-6 w-[30%]" />
                                {visibleColumns.periodo && <SortableHead label="Periodo" sortKey="inicio" sort={sort} onToggle={toggleSort} className="w-[25%]" />}
                                {visibleColumns.volumen && <SortableHead label="Volumen" sortKey="kilos" sort={sort} onToggle={toggleSort} className="w-[15%]" />}
                                {visibleColumns.estado && <SortableHead label="Estado" sortKey="nombre" sort={sort} onToggle={toggleSort} className="w-[15%] text-center" />}
                                <TableHead className="text-ink font-semibold h-14 w-[200px] text-center px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((row, idx) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="h-20 px-6 relative">
                                        {/* Línea decorativa de estado pegada al borde absoluto izquierdo */}
                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 rounded-r-lg ${STATUS_ACCENT_COLORS[row.estado] ?? "bg-status-neutral"}`} />
                                        
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-full bg-[#f4faef] flex items-center justify-center shrink-0 border border-brand-border/50">
                                                {getFruitIcon(row.nombre)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-[14px] text-ink truncate leading-tight">{row.nombre}</span>
                                                <span className="text-[12.5px] text-ink-muted font-medium mt-1 truncate">CAM-2026-{String(idx + 1).padStart(3, "0")}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {visibleColumns.periodo && (
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={18} strokeWidth={2} className="text-ink-muted shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[13.5px] text-ink-body leading-tight">{row.inicio} – {row.fin}</span>
                                                    <span className="text-[12.5px] text-ink-muted font-medium mt-1">{getDurationInMonths(row.inicio, row.fin)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}
                                    {visibleColumns.volumen && (
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Package size={18} strokeWidth={2} className="text-ink-muted shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[13.5px] text-ink-body leading-tight">{formatNumber(row.kilos)}</span>
                                                    <span className="text-[12.5px] text-ink-muted font-medium mt-1">Kilos Org. Ven</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}
                                    {visibleColumns.estado && (
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <StatusBadge status={row.estado} />
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="px-6 text-center">
                                        <RowActions {...getRowActions(row)} className="justify-center text-ink-muted" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {visibleData.length === 0 && (
                    <div className="rounded-xl border border-border">
                        <EmptyState
                            icon={<SearchX size={28} strokeWidth={2} />}
                            title={hasActiveFilters ? "Sin resultados" : "Aún no hay campañas"}
                            description={
                                hasActiveFilters
                                    ? "Ninguna campaña coincide con los filtros aplicados. Prueba ajustándolos."
                                    : "Cuando registres tu primera campaña de exportación aparecerá acá."
                            }
                            action={
                                hasActiveFilters ? (
                                    <Button
                                        variant="outline"
                                        onClick={onClearFilters}
                                        className="h-11 rounded-lg px-6 border-border text-ink-body font-semibold hover:bg-muted hover:text-ink shadow-none transition-colors active:scale-95"
                                    >
                                        Limpiar filtros
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                )}

                <TablePagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
            </CardContent>
            </Card>

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
            />
        </>
    );
}
