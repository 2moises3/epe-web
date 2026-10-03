import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Eye, Users, FilePlus, Tractor, Truck, SearchX, ListFilter, Link, TriangleAlert, RotateCw, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import FilterBar, { FilterSearch } from "@/shared/components/FilterBar";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import TableCard from "@/shared/components/TableCard";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableExportMenu, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignLinkProviderModal from "@/modules/campaigns/components/CampaignLinkProviderModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignExamModal from "@/modules/campaigns/components/CampaignExamModal";
import CampaignInterviewModal from "@/modules/campaigns/components/CampaignInterviewModal";
import CampaignProviderDetailsModal from "@/modules/campaigns/components/CampaignProviderDetailsModal";
import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import type { TipoProveedorCampania } from "@/modules/campaigns/api/campania-proveedor.dto";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";
import type { ExamValues, LocalExam } from "@/modules/campaigns/campaignExam";
import type { InterviewValues } from "@/modules/campaigns/campaignInterview";

const PAGE_SIZE = 8;

const PROVIDER_TABS: readonly SegmentedTabItem[] = [
    { id: "productor", label: "Productor", icon: Tractor },
    { id: "acopio", label: "Acopiador", icon: Truck },
];

const TYPE_LABEL: Record<TipoProveedorCampania, string> = {
    productor: "Productor",
    acopio: "Acopiador",
};

type SuccessMode = "provider" | "exam" | "interview";
/** Relación sobre la que está abierto un modal; se conserva al cerrar para no vaciar el modal durante su animación de salida */
type RelationModal = { open: boolean; relation: CampaniaProveedor | null };
const CLOSED: RelationModal = { open: false, relation: null };

const providerName = (row: CampaniaProveedor) => (row.proveedor ? `${row.proveedor.nombres} ${row.proveedor.apellido}` : "Proveedor sin datos");
const providerDocument = (row: CampaniaProveedor) => (row.proveedor ? `${row.proveedor.tipoDocumento} ${row.proveedor.nmrDocumento}` : "—");

export default function CampaignProvidersPage() {
    const { id } = useParams<{ id: string }>();
    const campaniaId = Number(id);
    const isValidCampaign = Number.isInteger(campaniaId) && campaniaId > 0;

    const [activeTab, setActiveTab] = useState<TipoProveedorCampania>("productor");
    const [relations, setRelations] = useState<CampaniaProveedor[]>([]);
    const [isLoading, setIsLoading] = useState(isValidCampaign);
    const [loadError, setLoadError] = useState<string | null>(isValidCampaign ? null : "La campaña no es válida.");
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [examModal, setExamModal] = useState<RelationModal>(CLOSED);
    const [interviewModal, setInterviewModal] = useState<RelationModal>(CLOSED);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMode, setSuccessMode] = useState<SuccessMode>("provider");
    const [details, setDetails] = useState<RelationModal>(CLOSED);
    // TODO(api): no hay servicio para entrevistas ni para subir el archivo del examen; se guardan en memoria
    // (se pierden al recargar) para que el flujo funcione. Ver campaignInterview.ts y campaignExam.ts.
    const [localExams, setLocalExams] = useState<LocalExam[]>([]);
    const [interviews, setInterviews] = useState<Record<number, InterviewValues>>({});
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");
    const [search, setSearch] = useState("");

    const loadRelations = useCallback(async () => {
        if (!isValidCampaign) return;
        try {
            const data = await getCampaniaProveedoresByCampania(campaniaId);
            setRelations(data);
            setLoadError(null);
        } catch {
            setLoadError("No se pudieron cargar los proveedores de la campaña.");
        } finally {
            setIsLoading(false);
        }
    }, [campaniaId, isValidCampaign]);

    // Carga inicial desde la API: el estado se actualiza al resolverse la petición.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void loadRelations(); }, [loadRelations]);

    const retry = () => {
        setIsLoading(true);
        void loadRelations();
    };

    const hasActiveFilters = search !== "";
    const clearFilters = () => setSearch("");

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return relations.filter((row) => {
            const matchesTab = row.tipoProveedor === activeTab;
            const haystack = `${providerName(row)} ${row.proveedor?.nmrDocumento ?? ""} ${row.proveedor?.zona ?? ""}`.toLowerCase();
            return matchesTab && haystack.includes(searchLower);
        });
    }, [relations, activeTab, search]);

    /** Exporta los proveedores visibles (de la pestaña y filtros actuales) a CSV y lo descarga */
    const handleExportCSV = () =>
        downloadCsv(
            "proveedores_campana.csv",
            ["Nombre", "Documento", "Zona", "Tipo", "Cantidad (kg)", "MTD Ceratitis"],
            filteredData.map((row) => [providerName(row), providerDocument(row), row.proveedor?.zona ?? "", TYPE_LABEL[row.tipoProveedor], String(row.cantidadProveedor), String(row.mtdCeratitis)]),
        );

    const pageCount = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const showSuccess = (mode: SuccessMode) => {
        setSuccessMode(mode);
        setIsSuccessModalOpen(true);
    };

    const handleSaveExam = (values: ExamValues) => {
        const relation = examModal.relation;
        if (!relation || values.resultado === "") return;
        setLocalExams((current) => [
            {
                id: crypto.randomUUID(),
                proveedorId: relation.proveedorId,
                fecha: values.fecha,
                tipoExamen: values.tipoExamen,
                resultado: values.resultado as LocalExam["resultado"],
                origen: values.origen.trim(),
                observacion: values.observacion.trim(),
                archivoNombre: values.archivo?.name ?? null,
            },
            ...current,
        ]);
        setExamModal((current) => ({ ...current, open: false }));
        showSuccess("exam");
    };

    const handleSaveInterview = (values: InterviewValues) => {
        const relation = interviewModal.relation;
        if (!relation) return;
        setInterviews((current) => ({ ...current, [relation.cxpId]: values }));
        setInterviewModal((current) => ({ ...current, open: false }));
        showSuccess("interview");
    };

    /** Ver detalles siempre visible; examen y entrevista solo aplican a productores */
    const getRowActions = (row: CampaniaProveedor): { primary: RowAction[]; secondary: RowAction[] } => ({
        primary: [
            { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => setDetails({ open: true, relation: row }) },
        ],
        secondary: row.tipoProveedor === "productor"
            ? [
                { label: "Registrar examen", icon: <FilePlus size={16} strokeWidth={2.5} />, onClick: () => setExamModal({ open: true, relation: row }) },
                interviews[row.cxpId]
                    ? { label: "Ver entrevista", icon: <UserCheck size={16} strokeWidth={2.5} />, onClick: () => setInterviewModal({ open: true, relation: row }) }
                    : { label: "Registrar entrevista", icon: <UserPlus size={16} strokeWidth={2.5} />, onClick: () => setInterviewModal({ open: true, relation: row }) },
            ]
            : [],
    });

    const accentFor = (row: CampaniaProveedor) => (row.tipoProveedor === "productor" ? "bg-brand" : "bg-status-neutral");
    const iconFor = (row: CampaniaProveedor, size: number) =>
        row.tipoProveedor === "productor" ? <Tractor size={size} strokeWidth={2} /> : <Truck size={size} strokeWidth={2} />;

    // El marco de la tabla se mantiene siempre; carga y error ocupan el lugar del estado vacío
    const emptyState = isLoading
        ? { icon: <Spinner className="size-7" />, title: "Cargando proveedores", description: "Consultando los proveedores vinculados a esta campaña.", action: undefined }
        : loadError
            ? {
                icon: <TriangleAlert size={28} strokeWidth={2} />,
                title: "No se pudieron cargar los proveedores",
                description: loadError,
                action: isValidCampaign ? <Button variant="outline" onClick={retry}><RotateCw size={18} strokeWidth={2.5} /> Reintentar</Button> : undefined,
            }
            : {
                icon: <SearchX size={28} strokeWidth={2} />,
                title: hasActiveFilters ? "Sin resultados" : "Aún no hay proveedores vinculados",
                description: hasActiveFilters
                    ? "Ningún proveedor coincide con los filtros aplicados. Prueba ajustándolos."
                    : "Cuando vincules un proveedor a esta campaña aparecerá acá.",
                action: hasActiveFilters
                    ? <Button variant="outline" onClick={clearFilters}><ListFilter size={18} strokeWidth={2.5} /> Limpiar filtros</Button>
                    : undefined,
            };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Users size={24} strokeWidth={2.5} />}
                title="Proveedores de la Campaña"
                description="Gestiona los productores y acopiadores vinculados a esta campaña."
                action={
                    <Button size="xl" onClick={() => setIsLinkModalOpen(true)} disabled={!isValidCampaign}>
                        <Link size={20} strokeWidth={2.5} /> Vincular proveedor
                    </Button>
                }
            />

            <div className="mb-8 flex flex-col gap-6">
                <SegmentedTabs
                    tabs={PROVIDER_TABS.map((tab) => ({ ...tab, count: relations.filter((row) => row.tipoProveedor === tab.id).length }))}
                    value={activeTab}
                    onChange={(val) => { setActiveTab(val as TipoProveedorCampania); setPage(1); }}
                />
                <h2 className="text-[16px] sm:text-[18px] font-bold text-ink">
                    {activeTab === "productor" ? "Productores de la Campaña" : "Acopiadores de la Campaña"}
                </h2>
            </div>

            <FilterBar onClear={clearFilters} canClear={hasActiveFilters} className="mb-8">
                <FilterSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Buscar por nombre, documento o zona..." />
            </FilterBar>

            <TableCard
                icon={<Users size={24} strokeWidth={2.5} />}
                title={activeTab === "productor" ? "Productores Vinculados" : "Acopiadores Vinculados"}
                description="Gestiona, consulta y da seguimiento a los proveedores de esta campaña."
                headerRight={
                    <TableToolbar>
                        <TableCountPill icon={<Users size={16} strokeWidth={2.5} className="text-brand" />} count={filteredData.length} label="proveedores" />
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
                            key={row.cxpId}
                            accentColor={row.tipoProveedor === "productor" ? "border-l-brand" : "border-l-status-neutral"}
                            icon={iconFor(row, 18)}
                            title={providerName(row)}
                            subtitle={providerDocument(row)}
                            actions={<RowActions className="justify-center" {...getRowActions(row)} />}
                        >
                            <TableGridCardFields>
                                <TableGridCardField label="Zona" value={row.proveedor?.zona || "—"} />
                                <TableGridCardField label="Cantidad" value={`${formatCampaignNumber(Number(row.cantidadProveedor))} kg`} />
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
                                    <TableHead className="text-ink font-semibold h-14">Cantidad estimada</TableHead>
                                    <TableHead className="text-ink font-semibold h-14 text-center px-6 w-36">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleData.map((row) => (
                                    <TableRow key={row.cxpId} className="border-b border-border hover:bg-surface-page/60">
                                        <TableCell className="h-20 px-6 relative">
                                            <TableRowAccent color={accentFor(row)} />
                                            <TableRowLead icon={iconFor(row, 18)} title={providerName(row)} subtitle={providerDocument(row)} />
                                        </TableCell>
                                        <TableCell className="text-ink-body font-medium">{row.proveedor?.zona || "—"}</TableCell>
                                        <TableCell className="text-ink-body font-medium">{TYPE_LABEL[row.tipoProveedor]}</TableCell>
                                        <TableCell className="text-ink-body font-medium">{formatCampaignNumber(Number(row.cantidadProveedor))} kg</TableCell>
                                        <TableCell className="px-6">
                                            <RowActions className="justify-center text-ink-muted" {...getRowActions(row)} />
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
                campaniaId={isValidCampaign ? campaniaId : null}
                onOpenChange={setIsLinkModalOpen}
                onSave={() => {
                    setIsLinkModalOpen(false);
                    showSuccess("provider");
                    void loadRelations();
                }}
                onRefresh={() => void loadRelations()}
            />

            <CampaignExamModal
                open={examModal.open}
                onOpenChange={(open) => setExamModal((current) => ({ ...current, open }))}
                providerName={examModal.relation ? providerName(examModal.relation) : undefined}
                onSave={handleSaveExam}
            />

            <CampaignInterviewModal
                open={interviewModal.open}
                onOpenChange={(open) => setInterviewModal((current) => ({ ...current, open }))}
                providerName={interviewModal.relation ? providerName(interviewModal.relation) : undefined}
                initialValues={interviewModal.relation ? interviews[interviewModal.relation.cxpId] : undefined}
                onSave={handleSaveInterview}
            />

            <CampaignProviderDetailsModal
                open={details.open}
                onOpenChange={(open) => setDetails((current) => ({ ...current, open }))}
                relation={details.relation}
                localExams={localExams}
                interview={details.relation ? interviews[details.relation.cxpId] ?? null : null}
                onRegisterInterview={() => {
                    setInterviewModal({ open: true, relation: details.relation });
                    setDetails((current) => ({ ...current, open: false }));
                }}
            />

            <CampaignSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successMode}
            />
        </div>
    );
}
