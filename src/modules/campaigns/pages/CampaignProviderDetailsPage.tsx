import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ClipboardList, FlaskConical, Layers, MapPin, RotateCw, Scale, TriangleAlert, UserRoundCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import StatusBadge from "@/shared/components/StatusBadge";
import LinkedCard, { LinkedRow } from "@/shared/components/LinkedCard";
import MetricCards, { type Metric } from "@/shared/components/MetricCards";
import PageHeader from "@/shared/layout/PageHeader";
import ProviderOverviewCard from "@/modules/providers/components/ProviderOverviewCard";
import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";
import { examEstadoLabel, type LocalExam } from "@/modules/campaigns/campaignExam";
import { useProviderExams } from "@/modules/campaigns/campaignExams.store";
import { getCampaignInterviews } from "@/modules/campaigns/campaignInterview.utils";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";
import { getExamenesProveedor } from "@/modules/providers/api/provider-subresources.api";
import type { ExamenProveedorDto } from "@/modules/providers/api/provider-subresources.dto";

/** Cuántas filas muestra cada resumen; el resto se ve en su vista de gestión */
const PREVIEW_ROWS = 3;

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; relation: CampaniaProveedor };

function displayDate(value: string) {
    if (!value) return "—";
    const date = parseFecha(value);
    return Number.isNaN(date.getTime()) ? "—" : format(date, "dd/MM/yyyy");
}

/** Cada examen, sea local o del backend, con lo mínimo que muestra el resumen */
interface ExamSummary {
    key: string;
    title: string;
    type: string;
    date: string;
    status: string;
    hasResult: boolean;
}

const fromLocal = (exam: LocalExam): ExamSummary => ({
    key: exam.id,
    title: exam.identificacionMuestra,
    type: exam.tipoExamen,
    date: exam.fecha,
    status: exam.estado === "resultado" && exam.resultado ? (exam.resultado === "positivo" ? "Positivo" : "Negativo") : examEstadoLabel(exam.estado),
    hasResult: exam.estado === "resultado",
});

const fromApi = (exam: ExamenProveedorDto): ExamSummary => ({
    key: `api-${exam.examenProveedorId}`,
    title: exam.tipoExamen,
    type: exam.tipoExamen,
    date: exam.fecha,
    status: exam.resultado === "positivo" ? "Positivo" : "Negativo",
    hasResult: true,
});

/**
 * Detalle de un proveedor dentro de una campaña: quién es, cuánto aporta y un resumen de sus exámenes y
 * entrevistas, con acceso directo a las vistas donde se gestionan. Las fincas no se vinculan acá: salen de
 * las entrevistas del productor.
 */
export default function CampaignProviderDetailsPage() {
    const { id, cxpId: relationParam } = useParams<{ id: string; cxpId: string }>();
    const campaniaId = Number(id);
    const cxpId = Number(relationParam);
    const navigate = useNavigate();
    const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
    const [apiExams, setApiExams] = useState<ExamenProveedorDto[]>([]);

    const load = useCallback(async () => {
        if (!Number.isInteger(campaniaId) || campaniaId < 1 || !Number.isInteger(cxpId) || cxpId < 1) {
            setLoadState({ status: "error", message: "La campaña o el proveedor no son válidos." });
            return;
        }
        setLoadState({ status: "loading" });
        try {
            const relations = await getCampaniaProveedoresByCampania(campaniaId);
            const relation = relations.find((item) => item.cxpId === cxpId);
            if (!relation) {
                setLoadState({ status: "error", message: "No se encontró el proveedor en esta campaña." });
                return;
            }
            setLoadState({ status: "ready", relation });
            // Los exámenes son una sección secundaria: si su servicio falla, el detalle igual se muestra
            getExamenesProveedor(relation.proveedorId).then(setApiExams).catch(() => setApiExams([]));
        } catch {
            setLoadState({ status: "error", message: "No se pudo cargar la información del proveedor." });
        }
    }, [campaniaId, cxpId]);

    // Carga inicial desde las APIs existentes; el estado se actualiza al resolverse la petición.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);

    const proveedorId = loadState.status === "ready" ? loadState.relation.proveedorId : 0;
    const localExams = useProviderExams(proveedorId);
    const exams = useMemo<ExamSummary[]>(() => [...localExams.map(fromLocal), ...apiExams.map(fromApi)], [localExams, apiExams]);

    if (loadState.status !== "ready") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
                {loadState.status === "loading" ? (
                    <><Spinner className="size-9 text-brand" /><p className="text-ink-muted">Cargando detalle...</p></>
                ) : (
                    <>
                        <TriangleAlert className="size-10 text-brand" aria-hidden="true" />
                        <h1 className="text-xl font-bold text-ink">Detalle no disponible</h1>
                        <p role="alert" className="text-ink-muted">{loadState.message}</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => navigate(`/campaigns/${campaniaId}/providers`)}>Volver a proveedores</Button>
                            <Button onClick={() => void load()}><RotateCw size={17} /> Reintentar</Button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    const { relation } = loadState;
    const proveedor = relation.proveedor;
    const isProducer = relation.tipoProveedor === "productor";
    const roleLabel = isProducer ? "Productor" : "Acopiador";

    const interviews = isProducer ? getCampaignInterviews(cxpId) : [];
    const interviewedHectares = interviews.reduce((sum, record) => sum + (Number(record.values.haCultivo) || 0), 0);
    const withResult = exams.filter((exam) => exam.hasResult).length;
    const pending = exams.length - withResult;

    const goToExams = () => navigate(`/campaigns/${campaniaId}/providers/${cxpId}/exams`);
    const goToInterviews = () => navigate(`/campaigns/${campaniaId}/providers/${cxpId}/interviews`);

    const metrics: Metric[] = [
        { title: "Cantidad estimada", value: formatCampaignNumber(Number(relation.cantidadProveedor)), unit: "kg", description: "Lo que se espera recibir de este proveedor", icon: Scale },
        { title: "MTD Ceratitis", value: formatCampaignNumber(Number(relation.mtdCeratitis)), unit: "", description: "Medida de control de la campaña", icon: Layers },
        { title: "Exámenes", value: String(exams.length), unit: exams.length === 1 ? "examen" : "exámenes", description: exams.length === 0 ? "Aún sin exámenes registrados" : `${withResult} con resultado · ${pending} en seguimiento`, icon: FlaskConical },
        isProducer
            ? { title: "Fincas entrevistadas", value: String(interviews.length), unit: interviews.length === 1 ? "finca" : "fincas", description: interviews.length === 0 ? "Aún sin entrevistas registradas" : `${formatCampaignNumber(interviewedHectares)} ha de cultivo`, icon: UserRoundCheck, warm: true }
            : { title: "Fruta convencional", value: relation.frutaConvencionalEstimado === null ? "—" : formatCampaignNumber(Number(relation.frutaConvencionalEstimado)), unit: relation.frutaConvencionalEstimado === null ? "" : "kg", description: "Estimado informado por el acopiador", icon: ClipboardList, warm: true },
    ];

    const examsCard = (
        <LinkedCard
            icon={<FlaskConical size={22} strokeWidth={2.2} />}
            title="Exámenes"
            description={`${exams.length} ${exams.length === 1 ? "examen registrado" : "exámenes registrados"}`}
            manageLabel="Gestionar exámenes"
            onManage={goToExams}
            stats={[
                { label: "Registrados", value: exams.length },
                { label: "Con resultado", value: withResult },
                { label: "En seguimiento", value: pending },
            ]}
            isEmpty={exams.length === 0}
            emptyMessage="Este proveedor todavía no tiene exámenes de laboratorio en esta campaña."
            emptyActionLabel="Registrar examen"
        >
            {exams.slice(0, PREVIEW_ROWS).map((exam) => (
                <LinkedRow
                    key={exam.key}
                    icon={<FlaskConical size={16} strokeWidth={2.2} />}
                    title={exam.title}
                    subtitle={`${exam.type} · ${displayDate(exam.date)}`}
                    trailing={<StatusBadge status={exam.status} />}
                />
            ))}
            {exams.length > PREVIEW_ROWS && (
                <p className="pt-1 text-center text-[12px] font-medium text-ink-muted">y {exams.length - PREVIEW_ROWS} {exams.length - PREVIEW_ROWS === 1 ? "examen más" : "exámenes más"}</p>
            )}
        </LinkedCard>
    );

    const interviewsCard = isProducer && (
        <LinkedCard
            icon={<UserRoundCheck size={22} strokeWidth={2.2} />}
            title="Entrevistas"
            description={`${interviews.length} ${interviews.length === 1 ? "finca entrevistada" : "fincas entrevistadas"}`}
            manageLabel="Gestionar entrevistas"
            onManage={goToInterviews}
            stats={[
                { label: "Entrevistas", value: interviews.length },
                { label: "Hectáreas de cultivo", value: `${formatCampaignNumber(interviewedHectares)} ha` },
            ]}
            isEmpty={interviews.length === 0}
            emptyMessage="Aún no se registró ninguna entrevista de este productor. Las fincas de la campaña salen de ellas."
            emptyActionLabel="Registrar entrevista"
        >
            {interviews.slice(0, PREVIEW_ROWS).map((record) => (
                <LinkedRow
                    key={record.id}
                    icon={<MapPin size={16} strokeWidth={2.2} />}
                    title={record.values.fincaNombre || "Finca sin nombre"}
                    subtitle={[record.values.distrito, record.values.provincia, record.values.departamento].filter(Boolean).join(" · ") || "Sin ubicación"}
                    trailing={<span className="rounded-md bg-card px-2 py-1 text-[11px] font-bold text-brand ring-1 ring-border">{record.codigoFyv}</span>}
                />
            ))}
            {interviews.length > PREVIEW_ROWS && (
                <p className="pt-1 text-center text-[12px] font-medium text-ink-muted">y {interviews.length - PREVIEW_ROWS} {interviews.length - PREVIEW_ROWS === 1 ? "finca más" : "fincas más"}</p>
            )}
        </LinkedCard>
    );

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<UserRoundCheck size={24} strokeWidth={2.5} />}
                title={`Detalle de ${roleLabel}`}
                description="Su participación en la campaña, sus exámenes y sus entrevistas."
            />

            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 lg:grid-cols-[1.95fr_1fr]">
                {proveedor ? (
                    <ProviderOverviewCard provider={proveedor} eyebrow={`${roleLabel} en la campaña`} />
                ) : (
                    <p className="rounded-2xl border border-border bg-card p-6 text-[13px] text-ink-muted">Los datos de registro de este proveedor no están disponibles.</p>
                )}
                <MetricCards metrics={metrics} label={`Indicadores del ${roleLabel.toLowerCase()}`} />
            </div>

            <div className={`mt-4 grid grid-cols-1 items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 ${isProducer ? "lg:grid-cols-2" : ""}`}>
                {examsCard}
                {interviewsCard}
            </div>
        </div>
    );
}
