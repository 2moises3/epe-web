import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Tractor, Truck, MapPin, FlaskConical, UserCheck, TriangleAlert, FilePlus, Eye, Pencil, Trash2, User } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import SegmentedTabs from "@/shared/components/SegmentedTabs";
import PageHeader from "@/shared/layout/PageHeader";

import TableCard from "@/shared/components/TableCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { TABLE_HEAD_BG } from "@/shared/components/DataTableRow";
import ConfirmModal from "@/shared/components/ConfirmModal";

import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";
import { getExamenesProveedor } from "@/modules/providers/api/provider-subresources.api";
import type { ExamenProveedorDto } from "@/modules/providers/api/provider-subresources.dto";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";

import type { ExamValues, LocalExam } from "@/modules/campaigns/campaignExam";
import CampaignExamModal from "@/modules/campaigns/components/CampaignExamModal";
import CampaignFincaModal, { type FincaValues } from "@/modules/campaigns/components/CampaignFincaModal";

// --- Mock Interfaces for Fincas ---
interface LocalFinca extends FincaValues {
    id: string;
}

function formatExamDate(value: string | undefined | null) {
    if (!value) return "—";
    const date = parseFecha(value);
    return Number.isNaN(date.getTime()) ? "—" : format(date, "dd/MM/yyyy");
}

export default function CampaignProviderDetailsPage() {
    const { id, cxpId: paramCxpId } = useParams<{ id: string; cxpId: string }>();
    const campaniaId = Number(id);
    const cxpId = Number(paramCxpId);
    const navigate = useNavigate();

    const [relation, setRelation] = useState<CampaniaProveedor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"fincas" | "examen" | "entrevista">("fincas");

    // States for Tabs API/Local Data
    const [apiExams, setApiExams] = useState<ExamenProveedorDto[]>([]);


    // In-memory data (TODO: replace with APIs when ready)
    const [localExams, setLocalExams] = useState<LocalExam[]>([]);
    const [localFincas, setLocalFincas] = useState<LocalFinca[]>([
        { id: "finca-1", nombre: "Finca El Pedregal", hectareas: "15.5", zona: "Sullana Norte" }
    ]);

    // Modals state
    const [examModal, setExamModal] = useState<{ open: boolean; mode?: "create" | "edit" | "view"; examId?: string }>({ open: false });
    const [fincaModalOpen, setFincaModalOpen] = useState(false);

    // Confirm Modals
    const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
    const [deleteFincaId, setDeleteFincaId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!campaniaId || !cxpId) return;
        setIsLoading(true);
        try {
            const data = await getCampaniaProveedoresByCampania(campaniaId);
            const found = data.find((r) => r.cxpId === cxpId);
            if (!found) {
                setLoadError("No se encontró el proveedor en esta campaña.");
                return;
            }
            setRelation(found);
            
            // Load exams if provider exists
            try {
                const exams = await getExamenesProveedor(found.proveedorId);
                setApiExams(exams);
            } catch {
                // Silently fail exams for now
            }

        } catch {
            setLoadError("No se pudo cargar la información.");
        } finally {
            setIsLoading(false);
        }
    }, [campaniaId, cxpId]);

    // Carga inicial desde la API; el estado se actualiza al resolverse la petición.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadData();
    }, [loadData]);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-ink-muted">
                    <Spinner className="size-10" />
                    <p className="font-medium">Cargando detalles...</p>
                </div>
            </div>
        );
    }

    if (loadError || !relation) {
        return (
            <div className="flex h-[60vh] items-center justify-center px-4">
                <Empty className="max-w-md rounded-2xl bg-card border border-border shadow-sm p-8">
                    <EmptyHeader>
                        <EmptyMedia variant="default"><TriangleAlert size={32} strokeWidth={2} /></EmptyMedia>
                        <EmptyTitle>Error al cargar</EmptyTitle>
                        <EmptyDescription>{loadError}</EmptyDescription>
                        <Button className="mt-4" onClick={() => navigate(`/campaigns/${campaniaId}/providers`)}>
                            Volver a proveedores
                        </Button>
                    </EmptyHeader>
                </Empty>
            </div>
        );
    }

    const isProducer = relation.tipoProveedor === "productor";
    const name = relation.proveedor ? `${relation.proveedor.nombres} ${relation.proveedor.apellido}` : "Proveedor sin datos";

    const TABS = [
        { id: "fincas", label: "Fincas", icon: MapPin },
        { id: "examen", label: "Exámenes", icon: FlaskConical },
        ...(isProducer ? [{ id: "entrevista", label: "Entrevista", icon: UserCheck }] : []),
    ];

    const handleSaveExam = (values: ExamValues) => {
        if (examModal.mode === "edit" && examModal.examId) {
            setLocalExams(current => current.map(e => e.id === examModal.examId ? { ...e, ...values, resultado: values.resultado as "positivo"|"negativo" } : e));
        } else {
            setLocalExams((current) => [
                {
                    id: crypto.randomUUID(),
                    proveedorId: relation.proveedorId,
                    fecha: values.fecha,
                    tipoExamen: values.tipoExamen,
                    resultado: values.resultado as "positivo" | "negativo",
                    origen: values.origen.trim(),
                    observacion: values.observacion.trim(),
                    archivoNombre: values.archivo?.name ?? null,
                    identificacionMuestra: values.identificacionMuestra,
                    fechaEnvioMuestra: values.fechaEnvioMuestra,
                    estadoEnvioResultado: values.estadoEnvioResultado,
                },
                ...current,
            ]);
        }
        setExamModal({ open: false });
    };

    const handleDeleteExam = (id: string) => {
        setDeleteExamId(id);
    };


    const combinedExams = [
        ...localExams,
        ...apiExams.map((exam) => ({
            id: `api-${exam.examenProveedorId}`,
            proveedorId: exam.proveedorId,
            fecha: exam.fecha,
            tipoExamen: exam.tipoExamen,
            resultado: exam.resultado,
            origen: exam.origen,
            identificacionMuestra: "—",
            fechaEnvioMuestra: "—",
            estadoEnvioResultado: "—",
            observacion: exam.observacion || "—",
            archivoNombre: exam.documentoUrl ? "Ver archivo" : null,
        })),
    ];

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">

            <PageHeader
                icon={isProducer ? <Tractor size={24} strokeWidth={2.5} /> : <Truck size={24} strokeWidth={2.5} />}
                title={`${isProducer ? "Productor" : "Acopiador"} - ${name}`}
                description={`Cantidad estimada: ${formatCampaignNumber(Number(relation.cantidadProveedor))} kg · MTD Ceratitis: ${formatCampaignNumber(Number(relation.mtdCeratitis))}`}
            />

            <div className="w-full bg-card border border-border rounded-2xl p-5 mt-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="h-14 w-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center shrink-0">
                    <User size={28} strokeWidth={2} />
                </div>
                <div className="flex-1 w-full min-w-0">
                    <h2 className="text-sm font-bold text-ink mb-4 text-center sm:text-left flex items-center gap-2">
                        DATOS DEL PROVEEDOR
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-5">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted/80 mb-1">Documento</span>
                            <span className="text-[14px] font-semibold text-ink truncate">{relation.proveedor?.tipoDocumento || ""} {relation.proveedor?.nmrDocumento || "—"}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted/80 mb-1">Zona</span>
                            <span className="text-[14px] font-semibold text-ink truncate">{relation.proveedor?.zona || "—"}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted/80 mb-1">Teléfono</span>
                            <span className="text-[14px] font-semibold text-ink truncate">{relation.proveedor?.telefono || "—"}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted/80 mb-1">Email</span>
                            <span className="text-[14px] font-semibold text-ink truncate" title={relation.proveedor?.email || ""}>{relation.proveedor?.email || "—"}</span>
                        </div>
                        {isProducer && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted/80 mb-1">Cod. Lugar Producción</span>
                                <span className="text-[14px] font-semibold text-ink truncate">{relation.proveedor?.codigoLugarProduccion || "—"}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 mb-6">
                <SegmentedTabs
                    tabs={TABS}
                    value={activeTab}
                    onChange={(val) => val === "entrevista"
                        ? navigate(`/campaigns/${campaniaId}/providers/${cxpId}/interviews`)
                        : setActiveTab(val as "fincas" | "examen")}
                />
            </div>

            {/* Fincas Tab */}
            {activeTab === "fincas" && (
                <TableCard
                    title="Fincas Vinculadas"
                    icon={<MapPin size={24} strokeWidth={2.5} />}
                    description="Gestiona las fincas asociadas a este proveedor en esta campaña."
                    headerRight={
                        <Button size="xl" onClick={() => setFincaModalOpen(true)}>
                            <FilePlus size={18} strokeWidth={2.5} className="mr-2" /> Vincular Finca
                        </Button>
                    }
                    isEmpty={localFincas.length === 0}
                    emptyIcon={<MapPin size={28} strokeWidth={2.5} />}
                    emptyTitle="No hay fincas vinculadas"
                    emptyDescription="Aún no has vinculado ninguna finca a este proveedor."
                    page={1}
                    pageCount={1}
                    onPageChange={() => {}}
                >
                    <div className="overflow-hidden rounded-xl border border-border">
                        <Table>
                            <TableHeader className={TABLE_HEAD_BG}>
                                <TableRow className="border-b border-border hover:bg-transparent">
                                    <TableHead className="text-ink font-semibold h-12 px-6">Nombre de la Finca</TableHead>
                                    <TableHead className="text-ink font-semibold h-12">Hectáreas</TableHead>
                                    <TableHead className="text-ink font-semibold h-12">Zona</TableHead>
                                    <TableHead className="text-ink font-semibold h-12 text-center px-6 w-36">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {localFincas.map((finca) => (
                                    <TableRow key={finca.id} className="border-b border-border hover:bg-surface-page/60">
                                        <TableCell className="h-14 px-6 font-medium text-ink">{finca.nombre}</TableCell>
                                        <TableCell className="text-ink-body">{finca.hectareas} ha</TableCell>
                                        <TableCell className="text-ink-body">{finca.zona}</TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setDeleteFincaId(finca.id)} className="p-2 text-ink-muted hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TableCard>
            )}

            {/* Exámenes Tab */}
            {activeTab === "examen" && (
                <TableCard
                    title="Exámenes Registrados"
                    icon={<FlaskConical size={24} strokeWidth={2.5} />}
                    description="Registro de análisis de laboratorio de este proveedor."
                    headerRight={
                        <Button size="xl" onClick={() => setExamModal({ open: true, mode: "create" })}>
                            <FilePlus size={18} strokeWidth={2.5} className="mr-2" /> Registrar Examen
                        </Button>
                    }
                    isEmpty={combinedExams.length === 0}
                    emptyIcon={<FlaskConical size={28} strokeWidth={2.5} />}
                    emptyTitle="No hay exámenes registrados"
                    emptyDescription="Los exámenes de laboratorio vinculados aparecerán aquí."
                    page={1}
                    pageCount={1}
                    onPageChange={() => {}}
                >
                    <div className="overflow-hidden rounded-xl border border-border">
                        <Table>
                            <TableHeader className={TABLE_HEAD_BG}>
                                <TableRow className="border-b border-border hover:bg-transparent">
                                    <TableHead className="text-ink font-semibold h-12 px-6">Identificación</TableHead>
                                    <TableHead className="text-ink font-semibold h-12">Examen</TableHead>
                                    <TableHead className="text-ink font-semibold h-12">Resultado</TableHead>
                                    <TableHead className="text-ink font-semibold h-12">Fecha</TableHead>
                                    <TableHead className="text-ink font-semibold h-12 text-center px-6 w-36">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {combinedExams.map((exam) => (
                                    <TableRow key={exam.id} className="border-b border-border hover:bg-surface-page/60">
                                        <TableCell className="h-14 px-6 font-medium text-ink">{exam.identificacionMuestra}</TableCell>
                                        <TableCell className="text-ink-body">{exam.tipoExamen}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-bold ${exam.resultado === "positivo" ? "bg-brand/10 text-brand" : "bg-status-neutral-surface text-ink-muted"}`}>
                                                {exam.resultado === "positivo" ? "Positivo" : "Negativo"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-ink-body">{formatExamDate(exam.fecha)}</TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setExamModal({ open: true, mode: "view", examId: exam.id })} className="p-2 text-ink-muted hover:text-brand transition-colors rounded-md hover:bg-brand/10"><Eye size={18} strokeWidth={2.5} /></button>
                                                {exam.id.startsWith("api-") ? null : (
                                                    <>
                                                        <button onClick={() => setExamModal({ open: true, mode: "edit", examId: exam.id })} className="p-2 text-ink-muted hover:text-brand transition-colors rounded-md hover:bg-brand/10"><Pencil size={18} strokeWidth={2.5} /></button>
                                                        <button onClick={() => handleDeleteExam(exam.id)} className="p-2 text-ink-muted hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"><Trash2 size={18} strokeWidth={2.5} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TableCard>
            )}

            <CampaignExamModal
                open={examModal.open}
                onOpenChange={(open) => setExamModal(cur => ({ ...cur, open }))}
                providerName={name}
                initialValues={
                    examModal.examId ? (() => {
                        const ex = combinedExams.find(e => e.id === examModal.examId);
                        if (!ex) return undefined;
                        return {
                            fecha: ex.fecha,
                            tipoExamen: ex.tipoExamen,
                            origen: ex.origen,
                            identificacionMuestra: ex.identificacionMuestra,
                            resultado: ex.resultado as ExamValues["resultado"],
                            fechaEnvioMuestra: ex.fechaEnvioMuestra,
                            estadoEnvioResultado: ex.estadoEnvioResultado,
                            observacion: ex.observacion,
                            archivo: null
                        };
                    })() : undefined
                }
                isViewOnly={examModal.mode === "view"}
                onSave={handleSaveExam}
            />

            <CampaignFincaModal
                open={fincaModalOpen}
                onOpenChange={setFincaModalOpen}
                linkedIds={localFincas.map(f => f.id)}
                onSave={(vals) => {
                    setLocalFincas((cur) => cur.some(f => f.id === vals.id) ? cur : [vals as LocalFinca, ...cur]);
                    setFincaModalOpen(false);
                }}
            />

            <ConfirmModal
                open={deleteExamId !== null}
                onOpenChange={(open) => !open && setDeleteExamId(null)}
                title="Eliminar examen"
                description="¿Estás seguro de eliminar este examen? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                tone="danger"
                onConfirm={() => {
                    if (deleteExamId) {
                        setLocalExams((current) => current.filter((e) => e.id !== deleteExamId));
                        setDeleteExamId(null);
                    }
                }}
            />

            <ConfirmModal
                open={deleteFincaId !== null}
                onOpenChange={(open) => !open && setDeleteFincaId(null)}
                title="Desvincular finca"
                description="¿Estás seguro de desvincular esta finca del proveedor para esta campaña? No se eliminará la finca del sistema, solo su vinculación."
                confirmLabel="Desvincular"
                tone="danger"
                onConfirm={() => {
                    if (deleteFincaId) {
                        setLocalFincas((cur) => cur.filter((f) => f.id !== deleteFincaId));
                        setDeleteFincaId(null);
                    }
                }}
            />
        </div>
    );
}
