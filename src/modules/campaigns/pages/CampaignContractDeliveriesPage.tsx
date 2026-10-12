import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileSignature, PackageCheck, Pencil, Plus, RotateCw, Trash2, TriangleAlert, UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import ConfirmModal from "@/shared/components/ConfirmModal";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import TableCard from "@/shared/components/TableCard";
import TableGridCard, { TableGridCardField, TableGridCardFields } from "@/shared/components/TableGridCard";
import { TableCountPill, TableToolbar } from "@/shared/components/TableToolbar";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignContractDeliveryModal from "@/modules/campaigns/components/CampaignContractDeliveryModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import { getCampana } from "@/modules/campaigns/api/campaign.api";
import { getClientesNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";
import { getCampaignFruitVisual } from "@/modules/campaigns/campaignFruit";
import type { CampaignClientContractLocal } from "@/modules/campaigns/campaignClientContract.utils";
import { useCampaignClientContracts } from "@/modules/campaigns/campaignClientContracts.store";
import type { CampaignContractDeliveryLocal, CampaignContractDeliveryValues } from "@/modules/campaigns/campaignContractDelivery.utils";
import { addCampaignContractDelivery, deleteCampaignContractDelivery, updateCampaignContractDelivery, useCampaignContractDeliveries } from "@/modules/campaigns/campaignContractDeliveries.store";

const PAGE_SIZE = 8;
const kilos = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 3 });
const displayDate = (value: string) => value.split("-").reverse().join("/");

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; campaign: Campana; relation: ClienteNegocioCampana };

export default function CampaignContractDeliveriesPage() {
    const { id, clientLinkId, contractId } = useParams<{ id: string; clientLinkId: string; contractId: string }>();
    const campaniaId = Number(id);
    const relationId = Number(clientLinkId);
    const selectedContractId = Number(contractId);
    const contracts = useCampaignClientContracts(campaniaId, relationId);
    const contract = contracts.find((item) => item.id === selectedContractId) ?? null;
    const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

    const load = useCallback(async () => {
        if (![campaniaId, relationId, selectedContractId].every(Number.isInteger)) {
            setLoadState({ status: "error", message: "La ruta de entregas no es válida." });
            return;
        }
        try {
            const [campaign, relations] = await Promise.all([getCampana(campaniaId), getClientesNegocioCampana(campaniaId)]);
            const relation = relations.find((item) => item.clienteNegocioCampanaId === relationId);
            if (!relation) throw new Error("not-found");
            setLoadState({ status: "ready", campaign, relation });
        } catch {
            setLoadState({ status: "error", message: "No se pudo cargar el contexto de esta entrega." });
        }
    }, [campaniaId, relationId, selectedContractId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);

    if (loadState.status !== "ready" || !contract) return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
            {loadState.status === "loading" ? <><Spinner className="size-9 text-brand" /><p className="text-ink-muted">Cargando entregas...</p></> : <>
                <TriangleAlert className="size-10 text-brand" /><h1 className="text-xl font-bold text-ink">Entregas no disponibles</h1>
                <p role="alert" className="text-ink-muted">{loadState.status === "error" ? loadState.message : "El contrato no está disponible en esta sesión."}</p>
                <Button onClick={() => void load()}><RotateCw size={17} /> Reintentar</Button>
            </>}
        </div>
    );

    return <DeliveriesView campaign={loadState.campaign} relation={loadState.relation} contract={contract} />;
}

function ContractBanner({ campaign, relation, contract }: { campaign: Campana; relation: ClienteNegocioCampana; contract: CampaignClientContractLocal }) {
    const fruit = getCampaignFruitVisual(campaign.nombre, campaign.fruta?.name);
    return (
        <section className="relative mb-7 isolate min-h-39 overflow-hidden rounded-2xl border border-brand-border bg-card shadow-sm">
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-surface/70 via-card to-card dark:from-brand/15" />
            <div className="relative z-10 flex max-w-full flex-col gap-3 px-5 py-5 sm:max-w-[68%] sm:px-7 sm:py-6">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand"><FileSignature size={15} /> Contrato comercial</div>
                <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Contrato #{String(contract.id).padStart(2, "0")}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] font-medium text-ink-body">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-brand"><UserRound size={15} />{relation.clienteNegocio?.nombreEmpresa ?? "Cliente"}</span>
                    <span className="hidden h-4 w-px bg-border sm:block" /><span>{campaign.nombre}</span>
                    <span className="hidden h-4 w-px bg-border sm:block" /><span className="text-ink-muted">{contract.moneda} {contract.precioKg.toLocaleString("es-PE")} / kg · {kilos.format(contract.cantidadPropuestaKg)} kg</span>
                </div>
            </div>
            <div className="absolute inset-y-0 right-0 hidden w-[34%] overflow-hidden sm:block" style={{ clipPath: "ellipse(96% 118% at 100% 50%)" }}>
                <img src={fruit.image} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-r from-brand/25 via-transparent to-ink/15" />
            </div>
        </section>
    );
}

function DeliveriesView({ campaign, relation, contract }: { campaign: Campana; relation: ClienteNegocioCampana; contract: CampaignClientContractLocal }) {
    const deliveries = useCampaignContractDeliveries(campaign.campaniaId, relation.clienteNegocioCampanaId, contract.id);
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<{ open: boolean; delivery: CampaignContractDeliveryLocal | null }>({ open: false, delivery: null });
    const [deleting, setDeleting] = useState<CampaignContractDeliveryLocal | null>(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const pageCount = Math.max(1, Math.ceil(deliveries.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = deliveries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const openCreate = () => setEditing({ open: true, delivery: null });
    const actionsFor = (delivery: CampaignContractDeliveryLocal): { primary: RowAction[] } => ({ primary: [
        { label: "Editar", icon: <Pencil size={18} />, onClick: () => setEditing({ open: true, delivery }) },
        { label: "Eliminar", icon: <Trash2 size={17} />, variant: "destructive", onClick: () => setDeleting(delivery) },
    ] });

    const save = (values: CampaignContractDeliveryValues) => {
        if (editing.delivery) updateCampaignContractDelivery(campaign.campaniaId, relation.clienteNegocioCampanaId, contract.id, editing.delivery.id, values);
        else addCampaignContractDelivery(campaign.campaniaId, relation.clienteNegocioCampanaId, contract.id, values);
        setEditing((current) => ({ ...current, open: false }));
        setSuccessOpen(true);
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <ContractBanner campaign={campaign} relation={relation} contract={contract} />
            <PageHeader icon={<PackageCheck size={24} strokeWidth={2.5} />} title="Gestión de Entregas" description="Programa una o varias entregas asociadas a este contrato."
                action={<Button size="xl" onClick={openCreate}><Plus size={19} /> Registrar entrega</Button>} />
            <TableCard icon={<PackageCheck size={24} strokeWidth={2.5} />} title="Entregas del Contrato" description="Consulta la programación completa y corrige cualquier entrega cuando sea necesario."
                headerRight={<TableToolbar><TableCountPill icon={<PackageCheck size={16} className="text-brand" />} count={deliveries.length} label={deliveries.length === 1 ? "entrega" : "entregas"} /></TableToolbar>}
                isEmpty={deliveries.length === 0} emptyIcon={<PackageCheck size={28} />} emptyTitle="Aún no hay entregas" emptyDescription="Este contrato todavía no tiene entregas programadas."
                emptyAction={{ label: "Registrar entrega", icon: <Plus size={18} />, onClick: openCreate }} page={currentPage} pageCount={pageCount} onPageChange={setPage}>
                <div className="flex flex-col gap-3 sm:hidden">{visible.map((delivery) => <TableGridCard key={delivery.id} accentColor="border-l-brand" icon={<PackageCheck size={18} />} title={displayDate(delivery.fecha)} subtitle={delivery.destino} actions={<RowActions {...actionsFor(delivery)} />}>
                    <TableGridCardFields><TableGridCardField label="Kilos" value={`${kilos.format(delivery.kilosProgramados)} kg`} /><TableGridCardField label="Observaciones" value={delivery.observaciones || "Sin observaciones"} /></TableGridCardFields>
                </TableGridCard>)}</div>
                <div className="hidden overflow-x-auto rounded-xl border border-border sm:block"><Table><TableHeader className={TABLE_HEAD_BG}><TableRow className="border-border hover:bg-transparent">
                    <TableHead className="h-14 px-6 font-semibold text-ink">Fecha</TableHead><TableHead className="font-semibold text-ink">Kilos programados</TableHead><TableHead className="font-semibold text-ink">Destino</TableHead><TableHead className="font-semibold text-ink">Observaciones</TableHead><TableHead className="w-36 px-6 text-right font-semibold text-ink">Acciones</TableHead>
                </TableRow></TableHeader><TableBody>{visible.map((delivery) => <TableRow key={delivery.id} className="border-border">
                    <TableCell className="relative h-20 px-6"><TableRowAccent color="bg-brand" /><TableRowLead icon={<PackageCheck size={19} />} title={displayDate(delivery.fecha)} subtitle={`Entrega #${String(delivery.id).padStart(2, "0")}`} /></TableCell>
                    <TableCell className="font-bold text-ink">{kilos.format(delivery.kilosProgramados)} kg</TableCell><TableCell className="font-medium text-ink-body">{delivery.destino}</TableCell><TableCell className="max-w-80 text-ink-muted"><p className="truncate">{delivery.observaciones || "Sin observaciones"}</p></TableCell><TableCell className="px-6"><RowActions {...actionsFor(delivery)} className="justify-end" /></TableCell>
                </TableRow>)}</TableBody></Table></div>
            </TableCard>
            <CampaignContractDeliveryModal open={editing.open} delivery={editing.delivery} onOpenChange={(open) => setEditing((current) => ({ ...current, open }))} onSave={save} />
            <ConfirmModal open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }} icon={<Trash2 size={28} />} title="¿Eliminar entrega?" description="La entrega programada se retirará de este contrato." confirmLabel="Sí, eliminar" onConfirm={() => { if (deleting) deleteCampaignContractDelivery(campaign.campaniaId, relation.clienteNegocioCampanaId, contract.id, deleting.id); setDeleting(null); }} />
            <CampaignSuccessModal open={successOpen} onOpenChange={setSuccessOpen} mode="delivery" />
        </div>
    );
}
