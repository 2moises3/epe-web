import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Tag, Sprout, TrendingUp, ShieldCheck, Users, Briefcase, ArrowLeft } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import StatusBadge from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import CampaignManagementProvidersModal from "@/modules/campaigns/components/CampaignManagementProvidersModal";
import CampaignManagementClientsModal from "@/modules/campaigns/components/CampaignManagementClientsModal";
import PageHeader from "@/shared/layout/PageHeader";
import { getCampana } from "@/modules/campaigns/api/campaign.api";
import { getCertificadosCampana } from "@/modules/campaigns/api/certificado-campana.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { CertificadoCampana } from "@/modules/campaigns/api/certificado-campana.mapper";
import type { EstadoCertificadoCampana } from "@/modules/campaigns/api/certificado-campana.dto";

const CERT_ESTADO_STYLES: Record<EstadoCertificadoCampana, { icon: string; badge: string; dot: string; label: string }> = {
    vigente: {
        icon: "bg-brand-surface text-brand",
        badge: "bg-brand-surface text-brand border-brand-border",
        dot: "bg-brand",
        label: "Vigente",
    },
    "por vencer": {
        icon: "bg-status-warning/10 text-status-warning",
        badge: "bg-status-warning/10 text-status-warning border-status-warning/20",
        dot: "bg-status-warning",
        label: "Por Vencer",
    },
    vencida: {
        icon: "bg-destructive/10 text-destructive",
        badge: "bg-destructive/10 text-destructive border-destructive/20",
        dot: "bg-destructive",
        label: "Vencida",
    },
};

export default function CampaignDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const campaniaId = id ? Number(id) : null;

    const [campana, setCampana] = useState<Campana | null>(null);
    const [certificados, setCertificados] = useState<CertificadoCampana[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);
    const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);

    useEffect(() => {
        if (campaniaId === null) {
            setError("Campaña inválida.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        Promise.all([getCampana(campaniaId), getCertificadosCampana(campaniaId)])
            .then(([campanaData, certificadosData]) => {
                setCampana(campanaData);
                setCertificados(certificadosData);
            })
            .catch(() => setError("No se pudo cargar la campaña."))
            .finally(() => setIsLoading(false));
    }, [campaniaId]);

    if (isLoading) {
        return <div className="px-14 py-5 text-center text-[#545454]">Cargando campaña...</div>;
    }

    if (error || !campana) {
        return <div className="px-14 py-5 text-center text-red-600">{error ?? "Campaña no encontrada."}</div>;
    }

    const duracionDias = differenceInCalendarDays(campana.fechaFin, campana.fechaInicio);

    return (
        <div className="px-14 py-5">
            <PageHeader
                icon={<Sprout size={24} strokeWidth={2.5} />}
                title="Detalle de Campaña"
                description="Visualización general y estado de la campaña"
                action={
                    <Button
                        variant="outline"
                        onClick={() => navigate('/campaigns')}
                        className="h-11 rounded-lg px-4 border-border text-ink-muted hover:text-ink shadow-none font-semibold transition-colors active:scale-95"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} className="mr-2" />
                        Volver a Campañas
                    </Button>
                }
            />

            {/* Content Body */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column (Main Info) */}
                <div className="xl:col-span-2 flex flex-col gap-6">

                    {/* Info Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-border border-t-[5px] border-t-brand flex flex-col gap-6">
                        <div className="flex justify-between items-start mt-2">
                            <div>
                                <p className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1">Campaña</p>
                                <h1 className="text-3xl font-extrabold text-ink">{campana.nombre}</h1>
                            </div>
                            <StatusBadge status={campana.estado} />
                        </div>

                        {/* Dates Section */}
                        <div className="flex items-center gap-4 bg-status-neutral-surface/60 rounded-xl p-4 border border-border">
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1">Fecha Inicio</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-brand" />
                                    <span className="text-[15px] font-bold text-ink">{format(campana.fechaInicio, "dd / MM / yyyy")}</span>
                                </div>
                            </div>
                            <div className="w-8 flex justify-center text-status-neutral">
                                <TrendingUp size={20} strokeWidth={3} className="rotate-45" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1">Fecha Fin</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-brand" />
                                    <span className="text-[15px] font-bold text-ink">{format(campana.fechaFin, "dd / MM / yyyy")}</span>
                                </div>
                            </div>
                            <div className="pl-6 border-l border-border flex flex-col items-center justify-center">
                                <p className="text-[11px] font-bold text-brand tracking-wider uppercase mb-0.5">Días</p>
                                <span className="text-xl font-black text-brand">{duracionDias}</span>
                            </div>
                        </div>

                        {/* Derivados */}
                        <div>
                            <p className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-3">Derivados de Fruta</p>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                                    <span className="text-[13px] font-bold">Mango Kent</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                                    <span className="text-[13px] font-bold">Mango Eduard</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Avance de Cosecha Card */}
                    {/* TODO: pendiente de backend, no existe campo de avance de cosecha */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-border flex flex-col gap-5">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-[17px] font-bold text-ink">Avance de cosecha</h3>
                                <p className="text-[13px] text-ink-muted font-medium mt-0.5">Kilos cosechados vs. estimados</p>
                            </div>
                            <span className="text-2xl font-black text-status-neutral">0%</span>
                        </div>

                        <div>
                            <Progress value={0} className="h-3 bg-status-neutral-surface" />
                            <div className="flex justify-between items-center mt-3 text-[12.5px] font-bold">
                                <span className="text-ink-muted">0 Kg cosechados</span>
                                <span className="text-ink-muted">0 Kg estimados</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={() => setIsProvidersModalOpen(true)}
                            className="h-14 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-[15px] flex items-center justify-center gap-3 shadow-sm border-b-[3px] border-brand-dark active:border-b-0 active:translate-y-[3px] transition-all"
                        >
                            <Briefcase size={22} strokeWidth={2.5} />
                            Proveedores
                        </Button>
                        <Button
                            onClick={() => setIsClientsModalOpen(true)}
                            className="h-14 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-[15px] flex items-center justify-center gap-3 shadow-sm border-b-[3px] border-brand-dark active:border-b-0 active:translate-y-[3px] transition-all"
                        >
                            <Users size={22} strokeWidth={2.5} />
                            Clientes
                        </Button>
                    </div>
                </div>

                {/* Right Column (Stats & Certs) */}
                <div className="flex flex-col gap-4">
                    {/* Stat Cards - Grid with 2 columns as requested */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Kilos Estimados */}
                        {/* TODO: pendiente de backend, no existe campo de avance de cosecha */}
                        <div className="bg-white p-5 rounded-2xl border border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-bold text-ink-muted tracking-wider uppercase leading-tight w-20">Kilos Estimados</p>
                                <div className="w-8 h-8 rounded-full bg-status-warning/10 flex items-center justify-center text-status-warning shrink-0">
                                    <Tag size={14} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1 mt-auto">
                                <span className="text-xl font-black text-status-neutral">----</span>
                                <span className="text-[12px] font-bold text-status-neutral">Kg</span>
                            </div>
                        </div>

                        {/* Kilos Cosechados */}
                        <div className="bg-white p-5 rounded-2xl border border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-bold text-ink-muted tracking-wider uppercase leading-tight w-20">Kilos Cosechados</p>
                                <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                    <TrendingUp size={14} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1 mt-auto">
                                <span className="text-xl font-black text-status-neutral">----</span>
                                <span className="text-[12px] font-bold text-status-neutral">Kg</span>
                            </div>
                        </div>
                    </div>

                    {/* Certificaciones List */}
                    <div className="bg-white rounded-2xl border border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-border flex justify-between items-center bg-surface-page">
                            <div>
                                <h3 className="text-[15px] font-bold text-ink">Certificaciones</h3>
                                <p className="text-[12px] text-ink-muted font-medium">{certificados.length} certificaciones</p>
                            </div>
                        </div>

                        <div className="flex flex-col p-2">
                            {certificados.length === 0 ? (
                                <p className="text-[13px] text-ink-muted p-3">Esta campaña aún no tiene certificados registrados.</p>
                            ) : (
                                certificados.map((certificado) => {
                                    const tone = CERT_ESTADO_STYLES[certificado.estado];
                                    return (
                                        <a
                                            key={certificado.certificadoId}
                                            href={certificado.documentoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 hover:bg-status-neutral-surface/50 rounded-xl transition-colors flex items-center gap-3 cursor-pointer"
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tone.icon}`}>
                                                <ShieldCheck size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[13.5px] font-bold text-ink truncate">{certificado.nombre}</p>
                                                <p className="text-[11px] font-medium text-ink-muted truncate">Vence: {format(certificado.fechaVencimiento, "dd/MM/yyyy")}</p>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shrink-0 ${tone.badge}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}></div>
                                                {tone.label}
                                            </div>
                                        </a>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <CampaignManagementProvidersModal
                open={isProvidersModalOpen}
                onOpenChange={setIsProvidersModalOpen}
                campaniaId={campaniaId}
            />

            <CampaignManagementClientsModal
                open={isClientsModalOpen}
                onOpenChange={setIsClientsModalOpen}
                campaniaId={campaniaId}
            />
        </div>
    );
}
