import { useMemo, useState } from "react";
import { UserPlus, UserCheck, Eye, Users, FilePlus, Tractor, Truck, SearchX } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import FilterBar, { FilterDateField, FilterSearch } from "@/shared/components/FilterBar";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import StatusBadge from "@/shared/components/StatusBadge";
import RowActions from "@/shared/components/RowActions";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignLinkProviderModal from "@/modules/campaigns/components/CampaignLinkProviderModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignExamModal from "@/modules/campaigns/components/CampaignExamModal";
import CampaignInterviewModal from "@/modules/campaigns/components/CampaignInterviewModal";
import CampaignProviderDetailsModal from "@/modules/campaigns/components/CampaignProviderDetailsModal";
import { campaignProviders, type ProviderType } from "@/modules/campaigns/campaignProviders.data";

const PAGE_SIZE = 8;

const PROVIDER_TABS: readonly SegmentedTabItem[] = [
    { id: "Productor", label: "Productor", icon: Tractor },
    { id: "Acopiador", label: "Acopiador", icon: Truck },
];

export default function CampaignProvidersPage() {
    const [activeTab, setActiveTab] = useState<ProviderType>("Productor");
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMode, setSuccessMode] = useState<"provider" | "exam" | "interview">("provider");
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProviderName, setSelectedProviderName] = useState<string>("");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");

    // Filtros: cadena vacía = sin filtrar. Las fechas todavía no filtran: los datos de ejemplo no traen esos campos.
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const hasActiveFilters = search !== "" || startDate !== "" || endDate !== "";
    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
    };

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return campaignProviders.filter((row) => {
            const matchesTab = row.tipo === activeTab;
            const matchesSearch = row.nombre.toLowerCase().includes(searchLower) || row.dni.includes(searchLower);
            return matchesTab && matchesSearch;
        });
    }, [activeTab, search]);

    /** Exporta los proveedores visibles (de la pestaña y filtros actuales) a CSV y lo descarga */
    const handleExportCSV = () => {
        const header = ["Nombre", "DNI", "Zona", "Tipo", "Estado"];
        const rows = filteredData.map((row) => [row.nombre, row.dni, row.zona, row.tipo, row.estado]);
        const csvContent = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "proveedores_campana.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const pageCount = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Users size={24} strokeWidth={2.5} />}
                title="Proveedores de la Campaña"
                description="Gestiona los productores y acopiadores vinculados a esta campaña."
                action={
                    <Button size="xl" onClick={() => setIsLinkModalOpen(true)}>
                        + Vincular proveedor
                    </Button>
                }
            />

            {/* Tabs & Subtitle */}
            <div className="mb-8 flex flex-col gap-6">
                <SegmentedTabs
                    tabs={PROVIDER_TABS}
                    value={activeTab}
                    onChange={(val) => { setActiveTab(val as ProviderType); setPage(1); }}
                />
                <h2 className="text-[16px] sm:text-[18px] font-bold text-ink">
                    {activeTab === "Productor" ? "Productores de la Campaña" : "Acopiadores de la Campaña"}
                </h2>
            </div>

            <FilterBar onClear={clearFilters} canClear={hasActiveFilters} className="mb-8">
                <FilterSearch value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
                <FilterDateField label="Fecha inicio" value={startDate} onChange={setStartDate} />
                <FilterDateField label="Fecha fin" value={endDate} onChange={setEndDate} />
            </FilterBar>

            <TableCard
                icon={<Users size={24} strokeWidth={2.5} />}
                title={activeTab === "Productor" ? "Productores Vinculados" : "Acopiadores Vinculados"}
                description="Gestiona, consulta y da seguimiento a los proveedores de esta campaña."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Users size={16} strokeWidth={2.5} className="text-brand" />} count={filteredData.length} label="proveedores" />
                        <TableExportMenu onExportExcel={handleExportCSV} onExportPdf={handleExportCSV} />
                        <TableViewToggle value={viewMode} onChange={setViewMode} />
                    </TableToolbar>
                }
                isEmpty={visibleData.length === 0}
                emptyIcon={<SearchX size={28} strokeWidth={2} />}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay proveedores vinculados"}
                emptyDescription={
                    hasActiveFilters
                        ? "Ningún proveedor coincide con los filtros aplicados. Prueba ajustándolos."
                        : "Cuando vincules un proveedor a esta campaña aparecerá acá."
                }
                emptyAction={
                    hasActiveFilters ? (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="h-9 px-4 rounded-lg font-semibold border-border text-brand hover:text-brand-dark hover:bg-brand-surface shadow-none transition-colors"
                        >
                            Limpiar filtros
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
                            accentColor={row.tipo === "Productor" ? "border-l-brand" : "border-l-status-neutral"}
                            icon={row.tipo === "Productor" ? <Tractor size={18} strokeWidth={2} /> : <Truck size={18} strokeWidth={2} />}
                            title={row.nombre}
                            subtitle={`DNI ${row.dni}`}
                            badge={<StatusBadge status={row.estado} />}
                            actions={
                                <RowActions
                                    className="justify-center"
                                    primary={[
                                        { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => { setSelectedProviderName(row.nombre); setIsDetailsModalOpen(true); } },
                                    ]}
                                    secondary={row.tipo === "Productor" ? [
                                        row.entrevistaRegistrada
                                            ? { label: "Ver entrevista", icon: <UserCheck size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) }
                                            : { label: "Registrar entrevista", icon: <UserPlus size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) },
                                        { label: "Registrar examen", icon: <FilePlus size={16} strokeWidth={2.5} />, onClick: () => setIsExamModalOpen(true) },
                                    ] : []}
                                />
                            }
                        >
                            <TableGridCardFields>
                                <TableGridCardField label="Zona" value={row.zona} />
                                <TableGridCardField label="Tipo" value={row.tipo} />
                            </TableGridCardFields>
                        </TableGridCard>
                    ))}
                </div>

                {viewMode === "table" && (
                <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="text-ink font-semibold h-14 px-6">Nombres</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Zona</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Tipo de Proveedor</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Estado</TableHead>
                                <TableHead className="text-ink font-semibold h-14 text-center px-6 w-36">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((row) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60">
                                    <TableCell className="h-20 px-6 relative">
                                        <TableRowAccent color={row.tipo === "Productor" ? "bg-brand" : "bg-status-neutral"} />
                                        <TableRowLead
                                            icon={row.tipo === "Productor" ? <Tractor size={18} strokeWidth={2} /> : <Truck size={18} strokeWidth={2} />}
                                            title={row.nombre}
                                            subtitle={`DNI ${row.dni}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.zona}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.tipo}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={row.estado} />
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <RowActions
                                            className="justify-center text-ink-muted"
                                            primary={[
                                                { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => { setSelectedProviderName(row.nombre); setIsDetailsModalOpen(true); } },
                                            ]}
                                            secondary={row.tipo === "Productor" ? [
                                                row.entrevistaRegistrada
                                                    ? { label: "Ver entrevista", icon: <UserCheck size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) }
                                                    : { label: "Registrar entrevista", icon: <UserPlus size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) },
                                                { label: "Registrar examen", icon: <FilePlus size={16} strokeWidth={2.5} />, onClick: () => setIsExamModalOpen(true) },
                                            ] : []}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </TableCard>

            <CampaignLinkProviderModal
                open={isLinkModalOpen}
                onOpenChange={setIsLinkModalOpen}
                onSave={() => {
                    setIsLinkModalOpen(false);
                    setSuccessMode("provider");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignExamModal
                open={isExamModalOpen}
                onOpenChange={setIsExamModalOpen}
                onSave={() => {
                    setIsExamModalOpen(false);
                    setSuccessMode("exam");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignInterviewModal
                open={isInterviewModalOpen}
                onOpenChange={setIsInterviewModalOpen}
                onSave={() => {
                    setIsInterviewModalOpen(false);
                    setSuccessMode("interview");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successMode}
            />

            <CampaignProviderDetailsModal
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                providerName={selectedProviderName}
                providerType={activeTab}
            />
        </div>
    );
}
