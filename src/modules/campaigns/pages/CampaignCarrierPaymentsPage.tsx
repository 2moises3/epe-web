import { useMemo, useState } from "react";
import { Wallet, Clock, TrendingUp, CheckCircle2, Banknote, Eye, Truck, ListFilter, Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import PageHeader from "@/shared/layout/PageHeader";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";
import FilterBar, { FilterDateField, FilterSearch } from "@/shared/components/FilterBar";
import StatusBadge from "@/shared/components/StatusBadge";
import RowActions from "@/shared/components/RowActions";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import CampaignRegisterPaymentModal from "@/modules/campaigns/components/CampaignRegisterPaymentModal";
import CampaignAttachReceiptModal from "@/modules/campaigns/components/CampaignAttachReceiptModal";
import CampaignCompleteAdvanceModal from "@/modules/campaigns/components/CampaignCompleteAdvanceModal";
import CampaignPaymentDetailsModal from "@/modules/campaigns/components/CampaignPaymentDetailsModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import { carrierPayments, type CarrierPayment } from "@/modules/campaigns/carrierPayments.data";

const PAGE_SIZE = 8;

/** Estados del pago, en el orden en que se muestran en el selector */
const PAYMENT_STATUS_TABS: SegmentedTabItem[] = [
    { id: "Pendiente", label: "Pendiente", icon: Clock, tone: "neutral" },
    { id: "Adelanto", label: "Adelanto", icon: TrendingUp, tone: "neutral" },
    { id: "Realizados", label: "Realizados", icon: CheckCircle2, tone: "brand" },
];

/** Cuántos pagos hay en cada estado, para el contador de cada opción del selector */
function getStatusTabsWithCount(): SegmentedTabItem[] {
    return PAYMENT_STATUS_TABS.map((tab) => ({
        ...tab,
        count: carrierPayments.filter((payment) => payment.estado === tab.id).length,
    }));
}

/** Acento lateral de la tarjeta móvil, con los mismos tonos que el StatusBadge */
const STATUS_ACCENTS: Record<string, string> = {
    Pendiente: "border-l-status-highlight",
    Adelanto: "border-l-status-warning",
    Realizados: "border-l-brand",
};

/** Mismo acento que STATUS_ACCENTS, como color de fondo para la barra de la tabla desktop */
const STATUS_ACCENT_BG: Record<string, string> = {
    Pendiente: "bg-status-highlight",
    Adelanto: "bg-status-warning",
    Realizados: "bg-brand",
};

export default function CampaignCarrierPaymentsPage() {
    const [status, setStatus] = useState("Pendiente");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");

    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [attachingPayment, setAttachingPayment] = useState<CarrierPayment | null>(null);
    const [completingPayment, setCompletingPayment] = useState<CarrierPayment | null>(null);
    const [viewingPayment, setViewingPayment] = useState<CarrierPayment | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMode, setSuccessMode] = useState<"payment" | "receipt" | "advance">("payment");

    const hasActiveFilters = search !== "" || startDate !== "" || endDate !== "";
    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
    };

    const filteredPayments = useMemo(() => {
        return carrierPayments.filter((payment) => {
            const matchesStatus = payment.estado === status;
            const matchesSearch = payment.transportista.toLowerCase().includes(search.trim().toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [search, status]);

    const statusTabs = useMemo(() => getStatusTabsWithCount(), []);

    /** Exporta los pagos visibles (del estado y filtros actuales) a CSV y lo descarga */
    const handleExportCSV = () => {
        const header = ["Transportista", "Cantidad", "Boleta", "Estado"];
        const rows = filteredPayments.map((payment) => [payment.transportista, payment.cantidad, payment.boleta ?? "Sin adjuntar", payment.estado]);
        const csvContent = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "pagos_transportista.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const pageCount = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = filteredPayments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getRowActions = (payment: CarrierPayment) => ({
        primary: [
            // El billete solo aparece mientras queda algo por registrar: confirmar el pendiente o cerrar el adelanto.
            // En Realizados ya no hay nada que hacer, así que solo se queda "Ver detalles".
            ...(payment.estado === "Pendiente"
                ? [{ label: "Registrar pago", icon: <Banknote size={18} strokeWidth={2.5} />, onClick: () => setAttachingPayment(payment) }]
                : []),
            ...(payment.estado === "Adelanto"
                ? [{ label: "Registrar pago", icon: <Banknote size={18} strokeWidth={2.5} />, onClick: () => setCompletingPayment(payment) }]
                : []),
            { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => setViewingPayment(payment) },
        ],
    });

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Wallet size={24} strokeWidth={2.5} />}
                title="Registro de pago al transportista"
                description="Controla los pagos pendientes, adelantos y pagos realizados a tus transportistas."
                action={
                    <Button size="xl" onClick={() => setIsRegisterModalOpen(true)}>
                        <Banknote size={20} strokeWidth={2.5} /> Registrar pago
                    </Button>
                }
            />

            <SegmentedTabs tabs={statusTabs} value={status} onChange={setStatus} className="mt-4 mb-6" />

            <FilterBar onClear={clearFilters} canClear={hasActiveFilters} className="mb-8">
                <FilterSearch value={search} onChange={setSearch} placeholder="Buscar transportista..." />
                <FilterDateField label="Fecha inicio" value={startDate} onChange={setStartDate} />
                <FilterDateField label="Fecha fin" value={endDate} onChange={setEndDate} />
            </FilterBar>

            <TableCard
                icon={<Wallet size={24} strokeWidth={2.5} />}
                title="Pagos a Transportistas"
                description="Gestiona y da seguimiento a los pagos de esta campaña."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Wallet size={16} strokeWidth={2.5} className="text-brand" />} count={filteredPayments.length} label="pagos" />
                        <TableExportMenu onExportExcel={handleExportCSV} onExportPdf={handleExportCSV} />
                        <TableViewToggle value={viewMode} onChange={setViewMode} />
                    </TableToolbar>
                }
                isEmpty={visibleData.length === 0}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Sin pagos en este estado"}
                emptyDescription={
                    hasActiveFilters
                        ? "Ningún pago coincide con los filtros aplicados. Prueba ajustándolos."
                        : "Cuando registres un pago en este estado aparecerá acá."
                }
                emptyAction={
                    hasActiveFilters ? (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="h-11 rounded-lg px-6 border-border text-ink-body font-semibold hover:bg-muted hover:text-ink shadow-none transition-colors active:scale-95"
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
                    {visibleData.map((payment) => (
                        <TableGridCard
                            key={payment.id}
                            accentColor={STATUS_ACCENTS[payment.estado] ?? "border-l-status-neutral"}
                            icon={<Truck size={18} strokeWidth={2} />}
                            title={payment.transportista}
                            badge={<StatusBadge status={payment.estado} />}
                            actions={<RowActions {...getRowActions(payment)} />}
                        >
                            <TableGridCardFields>
                                <TableGridCardField label="Cantidad" value={`S/ ${payment.cantidad.toLocaleString("es-PE")}`} />
                                <TableGridCardField label="Boleta" value={payment.boleta ?? "Sin adjuntar"} />
                            </TableGridCardFields>
                        </TableGridCard>
                    ))}
                </div>

                {viewMode === "table" && (
                <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="text-ink font-semibold h-14 px-6">Transportista</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Cantidad</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Boleta</TableHead>
                                <TableHead className="text-ink font-semibold h-14 text-right px-6 w-40">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((payment) => (
                                <TableRow key={payment.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="h-20 px-6 relative">
                                        <TableRowAccent color={STATUS_ACCENT_BG[payment.estado] ?? "bg-status-neutral"} />
                                        <TableRowLead icon={<Truck size={20} strokeWidth={2} />} title={payment.transportista} />
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">S/ {payment.cantidad.toLocaleString("es-PE")}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{payment.boleta ?? "Sin adjuntar"}</TableCell>
                                    <TableCell className="px-6">
                                        <RowActions {...getRowActions(payment)} className="justify-end" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </TableCard>

            <CampaignRegisterPaymentModal
                open={isRegisterModalOpen}
                onOpenChange={setIsRegisterModalOpen}
                onSave={() => {
                    setIsRegisterModalOpen(false);
                    setSuccessMode("payment");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignAttachReceiptModal
                open={attachingPayment !== null}
                onOpenChange={(open) => !open && setAttachingPayment(null)}
                payment={attachingPayment}
                onSave={() => {
                    setAttachingPayment(null);
                    setSuccessMode("receipt");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignCompleteAdvanceModal
                open={completingPayment !== null}
                onOpenChange={(open) => !open && setCompletingPayment(null)}
                payment={completingPayment}
                onSave={() => {
                    setCompletingPayment(null);
                    setSuccessMode("advance");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignPaymentDetailsModal
                open={viewingPayment !== null}
                onOpenChange={(open) => !open && setViewingPayment(null)}
                payment={viewingPayment}
            />

            <CampaignSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successMode}
            />
        </div>
    );
}
