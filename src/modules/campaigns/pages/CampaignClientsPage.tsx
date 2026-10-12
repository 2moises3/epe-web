import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContactRound, Eye, FileSignature, Link, Link2Off, Pencil, Plus, RotateCw, TriangleAlert, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import TableCard from "@/shared/components/TableCard";
import TableGridCard, { TableGridCardField, TableGridCardFields } from "@/shared/components/TableGridCard";
import { TableCountPill, TableToolbar } from "@/shared/components/TableToolbar";
import ConfirmModal from "@/shared/components/ConfirmModal";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignContextBanner from "@/modules/campaigns/components/CampaignContextBanner";
import CampaignLinkClientModal from "@/modules/campaigns/components/CampaignLinkClientModal";
import CampaignClientRecordModal from "@/modules/campaigns/components/CampaignClientRecordModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import { getCampana } from "@/modules/campaigns/api/campaign.api";
import { deleteClienteNegocioCampana, getClientesNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";
import { formatCampaignNumber } from "@/modules/campaigns/campaignDetails.utils";

const PAGE_SIZE = 8;
const TYPE_LABEL: Record<string, string> = { exportador: "Exportador", industria: "Industria" };
const clientName = (row: ClienteNegocioCampana) => row.clienteNegocio?.nombreEmpresa ?? "Cliente";
const clientType = (row: ClienteNegocioCampana) => row.clienteNegocio ? TYPE_LABEL[row.clienteNegocio.tipoCliente] ?? row.clienteNegocio.tipoCliente : "—";

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; campaign: Campana };
type RecordModal = { open: boolean; mode: "view" | "edit"; client: ClienteNegocioCampana | null };
const CLOSED_RECORD: RecordModal = { open: false, mode: "view", client: null };

/** Gestión de los clientes vinculados a una campaña, con datos y operaciones reales del vínculo. */
export default function CampaignClientsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const campaniaId = Number(id);
    const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
    const [clients, setClients] = useState<ClienteNegocioCampana[]>([]);
    const [page, setPage] = useState(1);
    const [linkOpen, setLinkOpen] = useState(false);
    const [recordModal, setRecordModal] = useState<RecordModal>(CLOSED_RECORD);
    const [unlinkClient, setUnlinkClient] = useState<ClienteNegocioCampana | null>(null);
    const [unlinking, setUnlinking] = useState(false);
    const [actionError, setActionError] = useState<string>();
    const [successMode, setSuccessMode] = useState<"client" | "edit">("client");
    const [successOpen, setSuccessOpen] = useState(false);

    const load = useCallback(async () => {
        if (!Number.isInteger(campaniaId) || campaniaId < 1) {
            setLoadState({ status: "error", message: "La campaña no es válida." });
            return;
        }
        try {
            const [campaign, relations] = await Promise.all([getCampana(campaniaId), getClientesNegocioCampana(campaniaId)]);
            setClients(relations);
            setLoadState({ status: "ready", campaign });
            setActionError(undefined);
        } catch {
            setLoadState({ status: "error", message: "No se pudieron cargar los clientes de esta campaña." });
        }
    }, [campaniaId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);

    const pageCount = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = clients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const actionsFor = (row: ClienteNegocioCampana): { primary: RowAction[]; secondary: RowAction[] } => ({
        primary: [
            { label: "Ver detalles", icon: <Eye size={18} />, onClick: () => setRecordModal({ open: true, mode: "view", client: row }) },
            { label: "Editar vínculo", icon: <Pencil size={18} />, onClick: () => setRecordModal({ open: true, mode: "edit", client: row }) },
            { label: "Desvincular", icon: <Link2Off size={18} />, variant: "destructive", onClick: () => setUnlinkClient(row) },
        ],
        secondary: [
            { label: "Contratos", icon: <FileSignature size={17} />, variant: "brand", onClick: () => navigate(`/campaigns/${campaniaId}/clients/${row.clienteNegocioCampanaId}/contracts`) },
        ],
    });

    const unlink = async () => {
        if (!unlinkClient || unlinking) return;
        setUnlinking(true);
        setActionError(undefined);
        try {
            await deleteClienteNegocioCampana(campaniaId, unlinkClient.clienteNegocioCampanaId);
            setClients((current) => current.filter((row) => row.clienteNegocioCampanaId !== unlinkClient.clienteNegocioCampanaId));
            setUnlinkClient(null);
        } catch {
            setActionError(`No se pudo desvincular a ${clientName(unlinkClient)}. Inténtalo otra vez.`);
        } finally {
            setUnlinking(false);
        }
    };

    if (loadState.status !== "ready") return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
            {loadState.status === "loading" ? <><Spinner className="size-9 text-brand" /><p className="text-ink-muted">Cargando clientes...</p></> : <>
                <TriangleAlert className="size-10 text-brand" aria-hidden="true" />
                <h1 className="text-xl font-bold text-ink">Clientes no disponibles</h1>
                <p role="alert" className="text-ink-muted">{loadState.message}</p>
                <Button onClick={() => { setLoadState({ status: "loading" }); void load(); }}><RotateCw size={17} /> Reintentar</Button>
            </>}
        </div>
    );

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <CampaignContextBanner campaign={loadState.campaign} caption="Clientes · gestión comercial" />
            <PageHeader icon={<Users size={24} strokeWidth={2.5} />} title="Gestión de Clientes" description="Vincula clientes y da seguimiento a sus requerimientos comerciales en esta campaña."
                action={<Button size="xl" onClick={() => setLinkOpen(true)}><Link size={19} /> Vincular cliente</Button>} />

            {actionError && <p role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive">{actionError}</p>}
            <TableCard icon={<ContactRound size={24} strokeWidth={2.5} />} title="Clientes de la Campaña" description="Consulta los vínculos; los datos completos están en Ver detalles."
                headerRight={<TableToolbar><TableCountPill icon={<Users size={16} className="text-brand" />} count={clients.length} label={clients.length === 1 ? "cliente" : "clientes"} /></TableToolbar>}
                isEmpty={clients.length === 0}
                emptyIcon={<Users size={28} />}
                emptyTitle="Aún no hay clientes vinculados"
                emptyDescription="Esta campaña todavía no tiene clientes vinculados. Vincula el primero para comenzar."
                emptyAction={{ label: "Vincular cliente", icon: <Plus size={18} />, onClick: () => setLinkOpen(true) }}
                page={currentPage} pageCount={pageCount} onPageChange={setPage}>
                <div className="flex flex-col gap-3 sm:hidden">
                    {visible.map((row) => <TableGridCard key={row.clienteNegocioCampanaId} accentColor="border-l-brand" icon={<Users size={18} />} title={clientName(row)} subtitle={clientType(row)} actions={<RowActions className="justify-center" {...actionsFor(row)} />}>
                        <TableGridCardFields>
                            <TableGridCardField label="Cantidad" value={`${formatCampaignNumber(row.cantidadKg)} kg`} />
                            <TableGridCardField label="Contacto" value={row.clienteNegocio?.nombreContacto ?? "—"} />
                        </TableGridCardFields>
                    </TableGridCard>)}
                </div>
                <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}><TableRow className="border-border hover:bg-transparent">
                            <TableHead className="h-14 px-6 font-semibold text-ink">Cliente</TableHead>
                            <TableHead className="font-semibold text-ink">Tipo</TableHead>
                            <TableHead className="font-semibold text-ink">Cantidad requerida</TableHead>
                            <TableHead className="font-semibold text-ink">Kilos acordados</TableHead>
                            <TableHead className="font-semibold text-ink">Contacto</TableHead>
                            <TableHead className="w-36 px-6 text-center font-semibold text-ink">Acciones</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>{visible.map((row) => <TableRow key={row.clienteNegocioCampanaId} className="border-border">
                            <TableCell className="relative h-20 px-6"><TableRowAccent color="bg-brand" /><TableRowLead icon={<Users size={18} />} title={clientName(row)} subtitle={row.clienteNegocio?.correoCorporativo ?? "—"} /></TableCell>
                            <TableCell className="text-ink-body">{clientType(row)}</TableCell>
                            <TableCell className="font-semibold text-ink">{formatCampaignNumber(row.cantidadKg)} kg</TableCell>
                            <TableCell className="text-ink-body">{formatCampaignNumber(row.kilosAcordados)} kg</TableCell>
                            <TableCell className="text-ink-body">{row.clienteNegocio?.nombreContacto ?? "—"}</TableCell>
                            <TableCell className="px-6"><RowActions className="justify-center" {...actionsFor(row)} /></TableCell>
                        </TableRow>)}</TableBody>
                    </Table>
                </div>
            </TableCard>

            <CampaignLinkClientModal open={linkOpen} onOpenChange={setLinkOpen} campaniaId={campaniaId} campaign={loadState.campaign} onSave={() => setLinkOpen(false)} />
            <CampaignClientRecordModal open={recordModal.open} mode={recordModal.mode} client={recordModal.client} campaniaId={campaniaId}
                onOpenChange={(open) => setRecordModal((current) => ({ ...current, open }))}
                onSaved={(updated) => {
                    setClients((current) => current.map((row) => row.clienteNegocioCampanaId === updated.clienteNegocioCampanaId ? updated : row));
                    setRecordModal((current) => ({ ...current, open: false }));
                    setSuccessMode("edit"); setSuccessOpen(true);
                }} />
            <ConfirmModal open={unlinkClient !== null} onOpenChange={(open) => { if (!open && !unlinking) setUnlinkClient(null); }}
                icon={<Link2Off size={28} />} title="¿Desvincular cliente?"
                description={<>Se quitará a <strong className="font-bold text-ink">{unlinkClient ? clientName(unlinkClient) : ""}</strong> de esta campaña. Su ficha seguirá en Planificación Comercial.</>}
                confirmLabel={unlinking ? "Desvinculando..." : "Sí, desvincular"} onConfirm={() => void unlink()} />
            <CampaignSuccessModal open={successOpen} onOpenChange={setSuccessOpen} mode={successMode} />
        </div>
    );
}
