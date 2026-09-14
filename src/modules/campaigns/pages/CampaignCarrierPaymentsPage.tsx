import { useMemo, useState } from "react";
import { Wallet, Clock, TrendingUp, CheckCircle2, Banknote, Eye, SearchX } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
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
import StatusTabs, { type StatusTabItem } from "@/shared/components/StatusTabs";
import FilterBar, { FilterDateField, FilterSearch } from "@/shared/components/FilterBar";
import StatusBadge from "@/shared/components/StatusBadge";
import RowActions from "@/shared/components/RowActions";
import EmptyState from "@/shared/components/EmptyState";
import TablePagination from "@/shared/components/TablePagination";
import CampaignRegisterPaymentModal from "@/modules/campaigns/components/CampaignRegisterPaymentModal";
import CampaignAttachReceiptModal from "@/modules/campaigns/components/CampaignAttachReceiptModal";
import CampaignCompleteAdvanceModal from "@/modules/campaigns/components/CampaignCompleteAdvanceModal";
import CampaignPaymentDetailsModal from "@/modules/campaigns/components/CampaignPaymentDetailsModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import { carrierPayments, type CarrierPayment } from "@/modules/campaigns/carrierPayments.data";

const PAGE_SIZE = 8;

/** Estados del pago, en el orden en que se muestran en el selector */
const PAYMENT_STATUS_TABS: StatusTabItem[] = [
    { id: "Pendiente", label: "Pendiente", icon: Clock, tone: "neutral" },
    { id: "Adelanto", label: "Adelanto", icon: TrendingUp, tone: "neutral" },
    { id: "Realizados", label: "Realizados", icon: CheckCircle2, tone: "brand" },
];

/** Acento lateral de la tarjeta móvil, con los mismos tonos que el StatusBadge */
const STATUS_ACCENTS: Record<string, string> = {
    Pendiente: "border-l-status-highlight",
    Adelanto: "border-l-status-warning",
    Realizados: "border-l-brand",
};

export default function CampaignCarrierPaymentsPage() {
    const [status, setStatus] = useState("Pendiente");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);

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
                    <Button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="h-11 rounded-lg px-6 font-semibold text-white bg-brand hover:bg-brand-dark shadow-sm transition-colors active:scale-95"
                    >
                        + Registrar pago
                    </Button>
                }
            />

            <StatusTabs tabs={PAYMENT_STATUS_TABS} value={status} onChange={setStatus} className="mt-4 mb-6" />

            <FilterBar onClear={clearFilters} canClear={hasActiveFilters} className="mb-8">
                <FilterSearch value={search} onChange={setSearch} placeholder="Buscar transportista..." />
                <FilterDateField label="Fecha inicio" value={startDate} onChange={setStartDate} />
                <FilterDateField label="Fecha fin" value={endDate} onChange={setEndDate} />
            </FilterBar>

            <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
                <CardContent className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand">
                                <Wallet size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-[15px] sm:text-[17px] font-bold text-ink leading-tight mb-1">Pagos a Transportistas</h2>
                                <p className="text-[12.5px] sm:text-[13px] text-ink-muted font-medium">Gestiona y da seguimiento a los pagos de esta campaña.</p>
                            </div>
                        </div>
                        <div className="text-[13px] text-muted-foreground font-medium">
                            Mostrando <span className="font-bold">{visibleData.length}</span> de <span className="font-bold">{filteredPayments.length}</span> pagos
                        </div>
                    </div>

                    {/* Móvil: tarjeta por pago en vez de tabla con scroll lateral */}
                    <div className="flex flex-col gap-3 sm:hidden">
                        {visibleData.map((payment) => (
                            <div
                                key={payment.id}
                                className={`rounded-xl border border-border border-l-[3px] bg-white overflow-hidden ${STATUS_ACCENTS[payment.estado] ?? "border-l-status-neutral"}`}
                            >
                                <div className="flex items-start justify-between gap-3 p-4 pb-3">
                                    <span className="text-[15px] font-bold text-ink leading-tight">{payment.transportista}</span>
                                    <StatusBadge status={payment.estado} />
                                </div>

                                <div className="mx-4 flex flex-col gap-2.5 rounded-lg bg-surface-page border border-border p-3">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">Cantidad</span>
                                        <span className="text-[13px] font-semibold text-ink truncate">S/ {payment.cantidad.toLocaleString("es-PE")}</span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">Boleta</span>
                                        <span className="text-[13px] font-semibold text-ink truncate">{payment.boleta ?? "Sin adjuntar"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center mt-3 px-2.5 py-1.5 border-t border-border bg-surface-page/50 text-ink-muted">
                                    <RowActions {...getRowActions(payment)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                        <Table>
                            <TableHeader className="bg-surface-page">
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
                                        <TableCell className="font-medium text-ink h-16 px-6">{payment.transportista}</TableCell>
                                        <TableCell className="text-ink-body font-medium">S/ {payment.cantidad.toLocaleString("es-PE")}</TableCell>
                                        <TableCell className="text-ink-body font-medium">{payment.boleta ?? "Sin adjuntar"}</TableCell>
                                        <TableCell className="px-6">
                                            <RowActions {...getRowActions(payment)} className="justify-end text-ink-muted" />
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
                                title={hasActiveFilters ? "Sin resultados" : "Sin pagos en este estado"}
                                description={
                                    hasActiveFilters
                                        ? "Ningún pago coincide con los filtros aplicados. Prueba ajustándolos."
                                        : "Cuando registres un pago en este estado aparecerá acá."
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button
                                            variant="outline"
                                            onClick={clearFilters}
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
