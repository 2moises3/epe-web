import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Leaf, Sprout } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { getCampana, getFrutaDerivadas } from "@/modules/campaigns/api/campaign.api";
import { getCertificadosCampana } from "@/modules/campaigns/api/certificado-campana.api";
import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import { getClientesNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { CertificadoCampana } from "@/modules/campaigns/api/certificado-campana.mapper";
import type { FrutaDerivadaDto } from "@/modules/campaigns/api/campaign.dto";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";

import { getCampaignTiming } from "@/modules/campaigns/campaignDetails.utils";
import type { Campaign } from "@/modules/campaigns/campaigns.data";
import type { CampaignGrower, CampaignClient, CampaignCertification } from "@/modules/campaigns/campaignDetails.data";

import CampaignOverviewCard from "@/modules/campaigns/components/CampaignOverviewCard";
import CampaignMetricCards from "@/modules/campaigns/components/CampaignMetricCards";
import CampaignHarvestCard from "@/modules/campaigns/components/CampaignHarvestCard";
import CampaignProvidersSummary from "@/modules/campaigns/components/CampaignProvidersSummary";
import CampaignClientsSummary from "@/modules/campaigns/components/CampaignClientsSummary";
import CampaignCertificationsList from "@/modules/campaigns/components/CampaignCertificationsList";
import CampaignBrandBanner from "@/modules/campaigns/components/CampaignBrandBanner";
import CampaignManagementProvidersModal from "@/modules/campaigns/components/CampaignManagementProvidersModal";
import CampaignManagementClientsModal from "@/modules/campaigns/components/CampaignManagementClientsModal";
import "@/modules/campaigns/campaignDetails.css";

// Adaptadores: llevan los datos de la API a la forma que reciben las tarjetas del diseño
function toOverviewCampaign(campana: Campana): Campaign {
    return {
        id: campana.campaniaId,
        nombre: campana.nombre,
        inicio: format(campana.fechaInicio, "dd/MM/yyyy"),
        fin: format(campana.fechaFin, "dd/MM/yyyy"),
        kilos: String(campana.requerimientoComercial),
        estado: campana.estado === "planificacion" ? "Planificado" : campana.estado === "en proceso" ? "En proceso" : "Terminado",
        fruta: campana.fruta?.name,
        variedades: [],
    };
}

// La relación campaña-proveedor no devuelve hectáreas ni variedades: se dejan en 0/vacío en vez de inventarlas
function toProviderSummaries(proveedores: CampaniaProveedor[]): CampaignGrower[] {
    return proveedores.map((relation) => {
        const name = relation.proveedor ? `${relation.proveedor.nombres} ${relation.proveedor.apellido}` : "Proveedor";
        return {
            id: relation.cxpId,
            name,
            location: relation.proveedor?.zona || "—",
            hectares: 0,
            owner: name,
            phone: relation.proveedor?.telefono ? String(relation.proveedor.telefono) : "—",
            varieties: [],
        };
    });
}

const TIPO_CLIENTE_LABEL: Record<string, string> = { exportador: "Exportador", industria: "Industria" };

// La API no registra pedidos ni estado del cliente en la campaña: pedidos en 0 y todos se consideran activos
function toClientSummaries(clientes: ClienteNegocioCampana[]): CampaignClient[] {
    return clientes.map((relation) => ({
        id: relation.clienteNegocioCampanaId,
        name: relation.clienteNegocio?.nombreEmpresa ?? "Cliente",
        type: relation.clienteNegocio ? TIPO_CLIENTE_LABEL[relation.clienteNegocio.tipoCliente] ?? relation.clienteNegocio.tipoCliente : "—",
        contact: relation.clienteNegocio?.nombreContacto ?? "—",
        email: relation.clienteNegocio?.correoCorporativo ?? "—",
        orders: 0,
        status: "Activo",
    }));
}

function toCertificationItems(certificados: CertificadoCampana[]): CampaignCertification[] {
    return certificados.map((certificado) => ({
        id: certificado.certificadoId,
        name: certificado.nombre,
        files: [certificado.documentoUrl],
        expires: format(certificado.fechaVencimiento, "dd/MM/yyyy"),
        icon: "leaf",
    }));
}

interface CampaignDetailsData {
    campana: Campana;
    certificados: CertificadoCampana[];
    proveedores: CampaniaProveedor[];
    clientes: ClienteNegocioCampana[];
    derivadas: FrutaDerivadaDto[];
}

type LoadState = { status: "loading" } | { status: "error" } | { status: "success"; data: CampaignDetailsData };

export default function CampaignDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const campaniaId = Number(id);

    if (!Number.isInteger(campaniaId) || campaniaId < 1) {
        return <CampaignNotFound message="Campaña inválida" />;
    }

    // Cambiar de campaña reinicia la carga, los modales y las secciones desplegadas
    return <CampaignDetailsView key={campaniaId} campaniaId={campaniaId} />;
}

function CampaignNotFound({ message }: { message: string }) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
            <Sprout size={44} className="text-brand" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-ink">{message}</h1>
            <p className="text-ink-muted">La campaña que buscas no está disponible.</p>
            <Button nativeButton={false} render={<Link to="/campaigns" />}><ArrowLeft />Volver a campañas</Button>
        </div>
    );
}

function CampaignDetailsView({ campaniaId }: { campaniaId: number }) {
    const [state, setState] = useState<LoadState>({ status: "loading" });
    const [openModal, setOpenModal] = useState<"providers" | "clients" | null>(null);

    useEffect(() => {
        let active = true;
        Promise.all([
            getCampana(campaniaId),
            getCertificadosCampana(campaniaId),
            // Proveedores y clientes son secciones secundarias: si fallan, la campaña igual se muestra
            getCampaniaProveedoresByCampania(campaniaId).catch(() => []),
            getClientesNegocioCampana(campaniaId).catch(() => []),
        ])
            .then(async ([campana, certificados, proveedores, clientes]) => {
                const derivadas = campana.frutaId ? await getFrutaDerivadas(campana.frutaId).catch(() => []) : [];
                if (active) setState({ status: "success", data: { campana, certificados, proveedores, clientes, derivadas } });
            })
            .catch(() => { if (active) setState({ status: "error" }); });
        return () => { active = false; };
    }, [campaniaId]);

    if (state.status === "loading") {
        return (
            <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-muted">
                <Spinner className="size-8 text-brand" />
                <p className="text-[14px] font-medium">Cargando campaña...</p>
            </div>
        );
    }
    if (state.status === "error") return <CampaignNotFound message="No se pudo cargar la campaña" />;

    const { campana, certificados, proveedores, clientes, derivadas } = state.data;
    const campaign = { ...toOverviewCampaign(campana), variedades: derivadas.map((derivada) => derivada.name) };
    const timing = getCampaignTiming(campaign.inicio, campaign.fin);

    return (
        <div className="campaign-details px-4 py-5 sm:px-8 lg:px-14">
            <div className="campaign-details-inner">
                <header className="campaign-page-heading">
                    <div><h1>Detalle de Campaña</h1><p>Control y seguimiento integral de la campaña</p></div>
                    <div className="campaign-heading-signature" aria-hidden="true">
                        <span>Del campo al mundo <Leaf size={26} /></span>
                        <div /><p>Productos que conectan personas</p>
                    </div>
                </header>
                <div className="campaign-top-grid">
                    <CampaignOverviewCard campaign={campaign} duration={timing.duration} />
                    <CampaignMetricCards requirement={campana.requerimientoComercial} estimated={null} harvested={0} remaining={timing.remaining} hasEnded={timing.hasEnded} hasStarted={timing.hasStarted} />
                </div>
                <div className="campaign-bottom-grid">
                    <div className="campaign-main-column">
                        <CampaignHarvestCard harvested={0} estimated={null} />
                        <div className="campaign-contacts-grid">
                            <CampaignProvidersSummary providers={toProviderSummaries(proveedores)} campaignName={campana.nombre} onViewAll={() => setOpenModal("providers")} />
                            <CampaignClientsSummary clients={toClientSummaries(clientes)} campaignName={campana.nombre} onViewAll={() => setOpenModal("clients")} />
                        </div>
                    </div>
                    <div className="campaign-side-column">
                        <CampaignCertificationsList certifications={toCertificationItems(certificados)} />
                        <CampaignBrandBanner />
                    </div>
                </div>
                <CampaignManagementProvidersModal open={openModal === "providers"} onOpenChange={(open) => setOpenModal(open ? "providers" : null)} campaniaId={campaniaId} />
                <CampaignManagementClientsModal open={openModal === "clients"} onOpenChange={(open) => setOpenModal(open ? "clients" : null)} campaniaId={campaniaId} />
            </div>
        </div>
    );
}
