import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FlaskConical, UserCheck, Tractor, Truck, TriangleAlert, ClipboardList, MapPin, Sprout, Leaf, Ruler, Droplets, LandPlot } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { InfoField, InfoSection, StatTile, LocationTrail } from "@/shared/components/InfoField";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";
import StatusBadge from "@/shared/components/StatusBadge";
import { TABLE_HEAD_BG } from "@/shared/components/DataTableRow";
import { getExamenesProveedor } from "@/modules/providers/api/provider-subresources.api";
import type { ExamenProveedorDto } from "@/modules/providers/api/provider-subresources.dto";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";
import { examEstadoLabel, type LocalExam } from "@/modules/campaigns/campaignExam";
import type { InterviewValues } from "@/modules/campaigns/campaignInterview";

interface CampaignProviderDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    relation: CampaniaProveedor | null;
    /** Exámenes registrados en esta sesión que aún no existen en el backend (ver campaignExam.ts) */
    localExams?: LocalExam[];
    /** Informe de entrevista del proveedor en esta campaña, si ya se registró (ver campaignInterview.ts) */
    interview?: InterviewValues | null;
    /** Abre el formulario de entrevista desde la pestaña vacía */
    onRegisterInterview?: () => void;
    /** Abre el formulario de examen desde la pestaña vacía */
    onRegisterExam?: () => void;
}



type ExamState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "success"; exams: ExamenProveedorDto[] };

function formatExamDate(value: string) {
    const date = parseFecha(value);
    return Number.isNaN(date.getTime()) ? "—" : format(date, "dd/MM/yyyy");
}

function PanelMessage({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <Empty className="min-h-100 rounded-xl border border-border bg-card">
            <EmptyHeader>
                <EmptyMedia variant="brand">{icon}</EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

/** Informe de entrevista en solo lectura: cultivo, fertilización y ubicación de la finca */
function InterviewReport({ interview }: { interview: InterviewValues }) {
    return (
        <div className="bg-surface-page/40 rounded-xl p-4 sm:p-6 min-h-100 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="flex flex-col gap-6">
                    <InfoSection icon={Sprout} title="Cultivo">
                        <div className="grid grid-cols-2 gap-3">
                            <StatTile icon={Ruler} label="Densidad Plantación" value={interview.densidadPlantacion} />
                            <StatTile icon={Ruler} label="Distanciamiento" value={interview.distanciamiento} hint="m entre plantas" />
                            <StatTile icon={Droplets} label="Frecuencia de Riego" value={interview.frecuenciaRiego} hint="veces por día" />
                            <StatTile icon={LandPlot} label="HA del Cultivo" value={`${interview.haCultivo} ha`} />
                        </div>
                        <StatTile icon={LandPlot} label="HA Total Finca" value={`${interview.haTotalFinca} ha`} />
                    </InfoSection>

                    <InfoSection icon={Leaf} title="Fertilización">
                        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                                <Leaf size={18} strokeWidth={2.5} />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[13.5px] font-bold text-ink">{interview.nombreAplicacion}</p>
                                <p className="text-[12px] text-ink-muted">{interview.aplicacionesAlAno} aplicaciones al año</p>
                            </div>
                        </div>
                    </InfoSection>
                </div>

                <InfoSection icon={MapPin} title="Ubicación">
                    <LocationTrail parts={[interview.departamento, interview.provincia, interview.distrito]} />

                    <div
                        className="w-full h-40 sm:h-48 bg-brand/5 border border-brand/20 rounded-xl flex flex-col items-center justify-center text-brand relative overflow-hidden"
                        style={{
                            backgroundImage: "linear-gradient(to right, rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 197, 94, 0.1) 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}
                    >
                        <MapPin size={28} strokeWidth={2.5} className="mb-2" />
                        <span className="text-xs font-bold">Mapa de ubicación</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <InfoField label="Latitud" value={interview.latitud} />
                        <InfoField label="Longitud" value={interview.longitud} />
                    </div>
                </InfoSection>
            </div>
        </div>
    );
}

/** Resumen de la información de la vinculación del proveedor con la campaña */
function RelationInfo({ relation }: { relation: CampaniaProveedor }) {
    return (
        <div className="bg-surface-page/40 rounded-xl p-4 sm:p-6 min-h-100 border border-border">
            <div className="flex flex-col gap-6">
                <InfoSection icon={ClipboardList} title="Datos de la Vinculación">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatTile icon={Ruler} label="Cantidad Estimada" value={`${formatCampaignNumber(Number(relation.cantidadProveedor))} kg`} />
                        <StatTile icon={FlaskConical} label="MTD Ceratitis" value={formatCampaignNumber(Number(relation.mtdCeratitis))} />
                        <StatTile icon={UserCheck} label="Precio Estimado" value="—" hint="No disponible" />
                        <StatTile icon={UserCheck} label="Moneda" value="—" hint="No disponible" />
                    </div>
                </InfoSection>
                <InfoSection icon={ClipboardList} title="Observaciones">
                    <div className="text-[14px] text-ink-body font-medium p-4 bg-card border border-border rounded-lg">
                        Sin observaciones registradas.
                    </div>
                </InfoSection>
            </div>
        </div>
    );
}

/** Detalle de un proveedor dentro de la campaña: datos del vínculo y exámenes registrados del proveedor. */
export default function CampaignProviderDetailsModal({ open, onOpenChange, relation, localExams = [], interview = null, onRegisterInterview, onRegisterExam }: CampaignProviderDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<"informacion" | "fincas" | "examen" | "entrevista">("informacion");
    const [examState, setExamState] = useState<ExamState>({ status: "loading" });
    const proveedorId = relation?.proveedorId;

    useEffect(() => {
        if (!open || proveedorId === undefined) return;
        let active = true;
        // Al abrir arranca en la pestaña de información y con la lista de exámenes cargando de fondo
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab("informacion");
        setExamState({ status: "loading" });
        getExamenesProveedor(proveedorId)
            .then((exams) => { if (active) setExamState({ status: "success", exams }); })
            .catch(() => { if (active) setExamState({ status: "error" }); });
        return () => { active = false; };
    }, [open, proveedorId]);

    if (!relation) return null;

    const isProducer = relation.tipoProveedor === "productor";
    const name = relation.proveedor ? `${relation.proveedor.nombres} ${relation.proveedor.apellido}` : "Proveedor sin datos";

    // Pestañas dinámicas según el tipo de proveedor
    const TABS: SegmentedTabItem[] = [
        { id: "informacion", label: "Información", icon: isProducer ? Tractor : Truck },
        { id: "fincas", label: "Fincas", icon: MapPin },
        { id: "examen", label: "Examen", icon: FlaskConical },
        ...(isProducer ? [{ id: "entrevista", label: "Entrevista", icon: UserCheck }] : []),
    ];

    // Los registrados en esta sesión van primero; así lo recién guardado se ve sin esperar al backend
    const apiExams = examState.status === "success" ? examState.exams : [];
    // Cada fila lleva lo mismo sin importar de dónde venga: la muestra, la etapa y el resultado si ya lo hay
    const rows = [
        ...localExams.filter((exam) => exam.proveedorId === relation.proveedorId).map((exam) => ({
            key: exam.id,
            tipoExamen: exam.tipoExamen,
            fecha: exam.fecha,
            muestra: exam.identificacionMuestra,
            estado: exam.estado === "resultado" && exam.resultado
                ? (exam.resultado === "positivo" ? "Positivo" : "Negativo")
                : examEstadoLabel(exam.estado),
            observacion: exam.observacion,
        })),
        ...apiExams.map((exam) => ({
            key: `api-${exam.examenProveedorId}`,
            tipoExamen: exam.tipoExamen,
            fecha: exam.fecha,
            muestra: exam.origen,
            estado: exam.resultado === "positivo" ? "Positivo" : "Negativo",
            observacion: exam.observacion,
        })),
    ];

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={isProducer ? <Tractor size={22} strokeWidth={2} /> : <Truck size={22} strokeWidth={2} />}
            title={`${isProducer ? "Productor" : "Acopiador"} - ${name}`}
            description={`Cantidad: ${formatCampaignNumber(Number(relation.cantidadProveedor))} kg · MTD Ceratitis: ${formatCampaignNumber(Number(relation.mtdCeratitis))}`}
            className="sm:max-w-275 md:max-w-250"
        >
            <SegmentedTabs
                tabs={TABS}
                value={activeTab}
                onChange={(val) => setActiveTab(val as "informacion" | "fincas" | "examen" | "entrevista")}
                className="mb-5"
            />

            {activeTab === "informacion" ? (
                <RelationInfo relation={relation} />
            ) : activeTab === "fincas" ? (
                <Empty className="min-h-100 rounded-xl border border-border bg-card">
                    <EmptyHeader>
                        <EmptyMedia variant="brand"><MapPin size={28} strokeWidth={2} /></EmptyMedia>
                        <EmptyTitle>Fincas Participantes</EmptyTitle>
                        <EmptyDescription>
                            Las fincas vinculadas a este proveedor aparecerán aquí. (Por conectar con API)
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : activeTab === "entrevista" ? (
                interview ? (
                    <InterviewReport interview={interview} />
                ) : (
                    <Empty className="min-h-100 rounded-xl border border-border bg-card">
                        <EmptyHeader>
                            <EmptyMedia variant="brand"><ClipboardList size={28} strokeWidth={2} /></EmptyMedia>
                            <EmptyTitle>Sin entrevista registrada</EmptyTitle>
                            <EmptyDescription>
                                {isProducer ? "Aún no se registró el informe de entrevista de este productor." : "La entrevista solo aplica a productores."}
                            </EmptyDescription>
                        </EmptyHeader>
                        {isProducer && onRegisterInterview && (
                            <Button size="xl" onClick={onRegisterInterview}><ClipboardList size={20} strokeWidth={2.5} /> Registrar entrevista</Button>
                        )}
                    </Empty>
                )
            ) : examState.status === "loading" ? (
                <PanelMessage icon={<Spinner className="size-7" />} title="Cargando exámenes" description="Consultando los exámenes registrados del proveedor." />
            ) : examState.status === "error" ? (
                <PanelMessage icon={<TriangleAlert size={28} strokeWidth={2} />} title="No se pudieron cargar los exámenes" description="Cierra y vuelve a abrir el detalle para intentarlo nuevamente." />
            ) : rows.length === 0 ? (
                <Empty className="min-h-100 rounded-xl border border-border bg-card">
                    <EmptyHeader>
                        <EmptyMedia variant="brand"><FlaskConical size={28} strokeWidth={2} /></EmptyMedia>
                        <EmptyTitle>Sin exámenes registrados</EmptyTitle>
                        <EmptyDescription>Este proveedor aún no tiene exámenes de laboratorio registrados.</EmptyDescription>
                    </EmptyHeader>
                    {onRegisterExam && (
                        <Button size="xl" onClick={onRegisterExam}><FlaskConical size={20} strokeWidth={2.5} /> Registrar examen</Button>
                    )}
                </Empty>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden overflow-x-auto min-h-100 bg-card">
                    <Table className="min-w-150">
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="text-ink font-semibold h-14 px-6">Nombre Análisis</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Estado</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Fecha</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Muestra</TableHead>
                                <TableHead className="text-ink font-semibold h-14 pr-6">Detalles</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((exam) => (
                                <TableRow key={exam.key} className="border-b border-border hover:bg-surface-page/60">
                                    <TableCell className="text-ink-body font-medium h-16 px-6">{exam.tipoExamen}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={exam.estado} />
                                    </TableCell>
                                    <TableCell className="text-ink-body font-medium">{formatExamDate(exam.fecha)}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{exam.muestra || "—"}</TableCell>
                                    <TableCell className="text-ink-muted font-medium text-xs pr-6">{exam.observacion || "—"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AppModal>
    );
}
