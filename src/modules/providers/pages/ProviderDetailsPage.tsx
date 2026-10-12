import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, CalendarCheck, FileText, LandPlot, MapPin, ShieldCheck, Sprout, UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import PageHeader from "@/shared/layout/PageHeader";
import ProviderOverviewCard from "@/modules/providers/components/ProviderOverviewCard";
import ProviderMetricCards from "@/modules/providers/components/ProviderMetricCards";
import ProviderProductionCard from "@/modules/providers/components/ProviderProductionCard";
import ProviderLinkedCard, { ProviderLinkedRow } from "@/modules/providers/components/ProviderLinkedCard";
import { getProveedor } from "@/modules/providers/api/proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import { useProviderLocalData } from "@/modules/providers/providerLocalData.store";
import { displayCertificadoDate } from "@/modules/providers/providerCertificado.utils";

/** Cuántas filas muestra cada resumen; el resto se ve en su vista de gestión */
const PREVIEW_ROWS = 3;

const hectares = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 });

/** "senasa-2026.pdf" → "PDF": la tarjeta muestra el tipo y deja el nombre completo para el tooltip */
const fileExtension = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase() : "ARCHIVO");

/**
 * Detalle del proveedor: sus datos de registro, y un resumen de sus fincas y certificados con acceso directo
 * a las vistas donde se gestionan. Los datos agronómicos no van acá: pertenecen a otro módulo.
 */
export default function ProviderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const providerId = Number(id);
    const [provider, setProvider] = useState<Proveedor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProvider = useCallback(async () => {
        if (!Number.isInteger(providerId) || providerId < 1) {
            setError("El proveedor no es válido.");
            setIsLoading(false);
            return;
        }
        try {
            setError(null);
            setProvider(await getProveedor(providerId));
        } catch {
            setError("No se pudo cargar el proveedor desde el backend.");
        } finally {
            setIsLoading(false);
        }
    }, [providerId]);

    // Carga inicial desde la API: el estado se actualiza al resolverse la petición.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void loadProvider(); }, [loadProvider]);

    if (isLoading) {
        return (
            <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-muted">
                <Spinner className="size-8 text-brand" />
                <p className="text-[14px] font-medium">Cargando proveedor...</p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <UserRound size={44} className="text-brand" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-ink">Proveedor no disponible</h1>
                <p role="alert" className="text-ink-muted">{error}</p>
                <Button nativeButton={false} render={<Link to="/proveedores" />}><ArrowLeft />Volver a proveedores</Button>
            </div>
        );
    }

    return <ProviderDetailsView key={provider.proveedorId} provider={provider} />;
}

function ProviderDetailsView({ provider }: { provider: Proveedor }) {
    const navigate = useNavigate();
    const { fincas, certificados, produccion } = useProviderLocalData();
    const providerFincas = fincas[provider.proveedorId] ?? [];
    const providerCertificates = certificados[provider.proveedorId] ?? [];

    const totalHectares = providerFincas.reduce((sum, finca) => sum + finca.haTotal, 0);
    const cultivatedHectares = providerFincas.reduce((sum, finca) => sum + finca.haCultivo, 0);

    const goToFincas = () => navigate(`/proveedores/${provider.proveedorId}/fincas`);
    const goToCertificates = () => navigate(`/proveedores/${provider.proveedorId}/certificados`);

    const hiddenFincas = providerFincas.length - PREVIEW_ROWS;
    const hiddenCertificates = providerCertificates.length - PREVIEW_ROWS;

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<UserRound size={24} strokeWidth={2.5} />}
                title="Detalle de Proveedor"
                description="Datos de registro, fincas y certificados del proveedor."
            />

            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 lg:grid-cols-[1.95fr_1fr]">
                <ProviderOverviewCard provider={provider} />
                <ProviderMetricCards
                    fincas={providerFincas.length}
                    totalHectares={totalHectares}
                    cultivatedHectares={cultivatedHectares}
                    certificates={providerCertificates.length}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 lg:grid-cols-[1.35fr_1fr]">
                <ProviderLinkedCard
                    icon={<LandPlot size={22} strokeWidth={2.2} />}
                    title="Fincas"
                    description={`${providerFincas.length} ${providerFincas.length === 1 ? "finca registrada" : "fincas registradas"}`}
                    manageLabel="Gestionar fincas"
                    onManage={goToFincas}
                    stats={[
                        { label: "Fincas", value: providerFincas.length },
                        { label: "Hectáreas totales", value: `${hectares.format(totalHectares)} ha` },
                        { label: "Hectáreas de cultivo", value: `${hectares.format(cultivatedHectares)} ha` },
                    ]}
                    isEmpty={providerFincas.length === 0}
                    emptyMessage="Este proveedor todavía no tiene fincas registradas."
                    emptyActionLabel="Registrar finca"
                >
                    {providerFincas.slice(0, PREVIEW_ROWS).map((finca) => (
                        <ProviderLinkedRow
                            key={finca.nombre}
                            icon={<Sprout size={16} strokeWidth={2.2} />}
                            title={finca.nombre}
                            metaIcon={<MapPin size={12} className="shrink-0" aria-hidden="true" />}
                            subtitle={`${finca.departamento} · ${finca.provincia} · ${finca.distrito}`}
                            trailing={
                                <>
                                    <p className="text-[13px] font-bold tabular-nums text-ink">{hectares.format(finca.haTotal)} ha</p>
                                    <p className="text-[11px] tabular-nums text-ink-muted">{hectares.format(finca.haCultivo)} ha de cultivo</p>
                                </>
                            }
                        />
                    ))}
                    {hiddenFincas > 0 && <p className="pt-1 text-center text-[12px] font-medium text-ink-muted">y {hiddenFincas} {hiddenFincas === 1 ? "finca más" : "fincas más"}</p>}
                </ProviderLinkedCard>

                <div className="flex flex-col gap-4">
                    <ProviderProductionCard produccion={produccion[provider.proveedorId]} />

                    <ProviderLinkedCard
                        icon={<ShieldCheck size={22} strokeWidth={2.2} />}
                        title="Certificados"
                        description={`${providerCertificates.length} ${providerCertificates.length === 1 ? "certificado registrado" : "certificados registrados"}`}
                        manageLabel="Gestionar certificados"
                        onManage={goToCertificates}
                        isEmpty={providerCertificates.length === 0}
                        emptyMessage="Este proveedor todavía no tiene certificados registrados."
                        emptyActionLabel="Registrar certificado"
                    >
                        {providerCertificates.slice(0, PREVIEW_ROWS).map((certificate) => (
                            <ProviderLinkedRow
                                key={certificate.certificadoId}
                                icon={<Award size={16} strokeWidth={2.2} />}
                                title={certificate.nombre}
                                metaIcon={<CalendarCheck size={12} className="shrink-0" aria-hidden="true" />}
                                subtitle={`Revisión SENASA · ${displayCertificadoDate(certificate.fechaRevisionSenasa)}`}
                                trailing={
                                    <span className="inline-flex items-center gap-1 rounded-md bg-card px-2 py-1 text-[11px] font-bold text-ink-body ring-1 ring-border" title={certificate.documento.name}>
                                        <FileText size={12} aria-hidden="true" />{fileExtension(certificate.documento.name)}
                                    </span>
                                }
                            />
                        ))}
                        {hiddenCertificates > 0 && <p className="pt-1 text-center text-[12px] font-medium text-ink-muted">y {hiddenCertificates} {hiddenCertificates === 1 ? "certificado más" : "certificados más"}</p>}
                    </ProviderLinkedCard>
                </div>
            </div>
        </div>
    );
}
