import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, FileSignature, Mail, PackageCheck, Pencil, Plus, RotateCw, Trash2, TriangleAlert, UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import ConfirmModal from "@/shared/components/ConfirmModal";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import StatusBadge from "@/shared/components/StatusBadge";
import TableCard from "@/shared/components/TableCard";
import TableGridCard, { TableGridCardField, TableGridCardFields } from "@/shared/components/TableGridCard";
import { TableCountPill, TableToolbar } from "@/shared/components/TableToolbar";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignClientContractModal from "@/modules/campaigns/components/CampaignClientContractModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import { getCampana } from "@/modules/campaigns/api/campaign.api";
import { getClientesNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";
import { getCampaignFruitVisual } from "@/modules/campaigns/campaignFruit";
import type { CampaignClientContractLocal, CampaignClientContractValues } from "@/modules/campaigns/campaignClientContract.utils";
import {
    addCampaignClientContract,
    deleteCampaignClientContract,
    updateCampaignClientContract,
    useCampaignClientContracts,
} from "@/modules/campaigns/campaignClientContracts.store";

const PAGE_SIZE = 8;
const money = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const kilos = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 3 });

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; campaign: Campana; relation: ClienteNegocioCampana };
type Panel = { open: "create" | "edit" | "view" | null; contract: CampaignClientContractLocal | null };

export default function CampaignClientContractsPage() {
    const { id, clientLinkId } = useParams<{ id: string; clientLinkId: string }>();
    const campaniaId = Number(id);
    const relationId = Number(clientLinkId);
    const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

    const load = useCallback(async () => {
        if (!Number.isInteger(campaniaId) || !Number.isInteger(relationId)) {
            setLoadState({ status: "error", message: "El vínculo solicitado no es válido." });
            return;
        }
        setLoadState({ status: "loading" });
        try {
            const [campaign, relations] = await Promise.all([getCampana(campaniaId), getClientesNegocioCampana(campaniaId)]);
            const relation = relations.find((item) => item.clienteNegocioCampanaId === relationId);
            if (!relation) throw new Error("not-found");
            setLoadState({ status: "ready", campaign, relation });
        } catch {
            setLoadState({ status: "error", message: "No se pudo cargar el cliente vinculado a esta campaña." });
        }
    }, [campaniaId, relationId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);

    if (loadState.status !== "ready") return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
            {loadState.status === "loading" ? <><Spinner className="size-9 text-brand" /><p className="text-ink-muted">Cargando contratos...</p></> : <>
                <TriangleAlert className="size-10 text-brand" /><h1 className="text-xl font-bold text-ink">Contratos no disponibles</h1>
                <p role="alert" className="text-ink-muted">{loadState.message}</p><Button onClick={() => void load()}><RotateCw size={17} /> Reintentar</Button>
            </>}
        </div>
    );

    return <ContractsView campaign={loadState.campaign} relation={loadState.relation} />;
}

function ClientContractBanner({ campaign, relation }: { campaign: Campana; relation: ClienteNegocioCampana }) {
    const client = relation.clienteNegocio;
    const fruit = getCampaignFruitVisual(campaign.nombre, campaign.fruta?.name);
    return (
        <section className="relative mb-7 isolate min-h-39 overflow-hidden rounded-2xl border border-brand-border bg-card shadow-sm">
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-surface/70 via-card to-card dark:from-brand/15" />
            <div className="relative z-10 flex max-w-full flex-col gap-3 px-5 py-5 sm:max-w-[66%] sm:px-7 sm:py-6">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand"><UserRound size={15} /> Cliente vinculado</div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{client?.nombreEmpresa ?? "Cliente"}</h2>
                    {client?.tipoCliente && <StatusBadge status={client.tipoCliente === "exportador" ? "Exportador" : "Industria"} />}
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-medium text-ink-body">
                    <span className="font-semibold text-brand">{campaign.nombre}</span>
                    {client?.correoCorporativo && <><span className="hidden h-4 w-px bg-border sm:block" /><span className="inline-flex items-center gap-2 text-ink-muted"><Mail size={15} />{client.correoCorporativo}</span></>}
                </div>
            </div>
            <div className="absolute inset-y-0 right-0 hidden w-[35%] overflow-hidden sm:block" style={{ clipPath: "ellipse(96% 118% at 100% 50%)" }}>
                <img src={fruit.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-r from-brand/25 via-transparent to-ink/15" />
            </div>
        </section>
    );
}

function ContractsView({ campaign, relation }: { campaign: Campana; relation: ClienteNegocioCampana }) {
    const navigate = useNavigate();
    const contracts = useCampaignClientContracts(campaign.campaniaId, relation.clienteNegocioCampanaId);
    const [page, setPage] = useState(1);
    const [panel, setPanel] = useState<Panel>({ open: null, contract: null });
    const [deleting, setDeleting] = useState<CampaignClientContractLocal | null>(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const pageCount = Math.max(1, Math.ceil(contracts.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = contracts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const actionsFor = (contract: CampaignClientContractLocal): { primary: RowAction[]; secondary: RowAction[] } => ({ primary: [
        { label: "Ver detalles", icon: <Eye size={18} />, onClick: () => setPanel({ open: "view", contract }) },
        { label: "Editar", icon: <Pencil size={18} />, onClick: () => setPanel({ open: "edit", contract }) },
        { label: "Eliminar", icon: <Trash2 size={17} />, variant: "destructive", onClick: () => setDeleting(contract) },
    ], secondary: [
        { label: "Entregas", icon: <PackageCheck size={17} />, variant: "brand", onClick: () => navigate(`/campaigns/${campaign.campaniaId}/clients/${relation.clienteNegocioCampanaId}/contracts/${contract.id}/deliveries`) },
    ] });

    const save = (values: CampaignClientContractValues, archivo: File | null) => {
        if (panel.open === "edit" && panel.contract) updateCampaignClientContract(campaign.campaniaId, relation.clienteNegocioCampanaId, panel.contract.id, values, archivo);
        else if (archivo) addCampaignClientContract(campaign.campaniaId, relation.clienteNegocioCampanaId, values, archivo);
        setPanel((current) => ({ ...current, open: null }));
        setSuccessOpen(true);
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <ClientContractBanner campaign={campaign} relation={relation} />
            <PageHeader icon={<FileSignature size={24} strokeWidth={2.5} />} title="Gestión de Contratos" description="Registra y consulta los acuerdos comerciales establecidos con este cliente."
                action={<Button size="xl" onClick={() => setPanel({ open: "create", contract: null })}><Plus size={19} /> Registrar contrato</Button>} />

            <TableCard icon={<FileSignature size={24} strokeWidth={2.5} />} title="Contratos del Cliente" description="Consulta las condiciones, cantidades y documentos de cada acuerdo."
                headerRight={<TableToolbar><TableCountPill icon={<FileSignature size={16} className="text-brand" />} count={contracts.length} label={contracts.length === 1 ? "contrato" : "contratos"} /></TableToolbar>}
                isEmpty={contracts.length === 0} emptyIcon={<FileSignature size={28} />} emptyTitle="Aún no hay contratos"
                emptyDescription="Este cliente todavía no tiene contratos registrados en la campaña."
                emptyAction={{ label: "Registrar contrato", icon: <Plus size={18} />, onClick: () => setPanel({ open: "create", contract: null }) }}
                page={currentPage} pageCount={pageCount} onPageChange={setPage}>
                <div className="flex flex-col gap-3 sm:hidden">
                    {visible.map((contract) => <TableGridCard key={contract.id} accentColor="border-l-brand" icon={<FileSignature size={18} />} title={`${contract.moneda} ${money.format(contract.precioKg)} / kg`} subtitle={contract.condicionesPago} actions={<RowActions {...actionsFor(contract)} />}>
                        <TableGridCardFields><TableGridCardField label="Cantidad" value={`${kilos.format(contract.cantidadPropuestaKg)} kg`} /><TableGridCardField label="Entrega" value={contract.condicionesEntrega} /></TableGridCardFields>
                    </TableGridCard>)}
                </div>
                <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
                    <Table><TableHeader className={TABLE_HEAD_BG}><TableRow className="border-border hover:bg-transparent">
                        <TableHead className="h-14 px-6 font-semibold text-ink">Contrato</TableHead><TableHead className="font-semibold text-ink">Precio por kg</TableHead><TableHead className="font-semibold text-ink">Cantidad propuesta</TableHead><TableHead className="font-semibold text-ink">Condiciones</TableHead><TableHead className="w-44 px-6 text-center font-semibold text-ink">Acciones</TableHead>
                    </TableRow></TableHeader><TableBody>{visible.map((contract) => <TableRow key={contract.id} className="border-border">
                        <TableCell className="relative h-20 px-6"><TableRowAccent color="bg-brand" /><TableRowLead icon={<FileSignature size={19} />} title={`Contrato #${String(contract.id).padStart(2, "0")}`} subtitle={contract.fechaRegistro} /></TableCell>
                        <TableCell className="font-bold text-ink">{contract.moneda} {money.format(contract.precioKg)}</TableCell><TableCell className="text-ink-body">{kilos.format(contract.cantidadPropuestaKg)} kg</TableCell>
                        <TableCell><p className="max-w-72 truncate font-medium text-ink-body">{contract.condicionesPago}</p><p className="max-w-72 truncate text-xs text-ink-muted">{contract.condicionesEntrega}</p></TableCell>
                        <TableCell className="px-6"><RowActions {...actionsFor(contract)} className="justify-center" /></TableCell>
                    </TableRow>)}</TableBody></Table>
                </div>
            </TableCard>

            <CampaignClientContractModal open={panel.open !== null} mode={panel.open ?? "create"} contract={panel.contract} onOpenChange={(open) => { if (!open) setPanel((current) => ({ ...current, open: null })); }} onSave={save} />
            <ConfirmModal open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }} icon={<Trash2 size={28} />} title="¿Eliminar contrato?" description="El contrato se quitará de esta participación comercial." confirmLabel="Sí, eliminar" onConfirm={() => { if (deleting) deleteCampaignClientContract(campaign.campaniaId, relation.clienteNegocioCampanaId, deleting.id); setDeleting(null); }} />
            <CampaignSuccessModal open={successOpen} onOpenChange={setSuccessOpen} mode="contract" />
        </div>
    );
}
