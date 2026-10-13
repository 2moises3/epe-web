import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CalendarCheck, CalendarDays, Contact, ExternalLink, FileSignature, Pencil, Plus, RotateCw, Scale, TriangleAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import MetricCards, { type Metric } from "@/shared/components/MetricCards";
import TableCard from "@/shared/components/TableCard";
import TableGridCard, { TableGridCardField, TableGridCardFields } from "@/shared/components/TableGridCard";
import { TableCountPill, TableToolbar } from "@/shared/components/TableToolbar";
import PageHeader from "@/shared/layout/PageHeader";
import ClientFormModal from "@/modules/commercial-planning/components/ClientFormModal";
import ClientOverviewCard from "@/modules/commercial-planning/components/ClientOverviewCard";
import ClientSuccessModal from "@/modules/commercial-planning/components/ClientSuccessModal";
import CampaignLinkClientModal from "@/modules/campaigns/components/CampaignLinkClientModal";
import { getClienteNegocioContratos } from "@/modules/clients/api/cliente-negocio-contratos.api";
import type { ContratoClienteNegocioDto } from "@/modules/clients/api/cliente-negocio-contratos.dto";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";

const PAGE_SIZE = 8;

const kilos = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 3 });

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; client: ClienteNegocio; contracts: ContratoClienteNegocioDto[] };

function displayDate(value: string): string {
    const date = parseFecha(value);
    return Number.isNaN(date.getTime()) ? "—" : format(date, "dd/MM/yyyy");
}

/** Solo se enlaza a documentos http(s): cualquier otro esquema (javascript:, data:) se descarta */
function safeExternalUrl(value: string): string | null {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

function DocumentLink({ label, value }: { label: string; value: string }) {
    const url = safeExternalUrl(value);
    if (!value.trim()) return <span className="text-[12px] text-ink-muted">{label}: no disponible</span>;
    if (!url) return <span className="break-all text-[12px] text-ink-muted">{label}: {value}</span>;
    return (
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:underline">
            {label} <ExternalLink size={12} aria-hidden="true" />
        </a>
    );
}

/**
 * Detalle de un cliente: sus datos de registro y todos sus contratos con las campañas, del más reciente al
 * más antiguo. Es el lugar donde se consulta lo que la tabla solo resume.
 */
export default function ClientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const clientId = Number(id);
    const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(false);
    const [addingContract, setAddingContract] = useState(false);
    const [success, setSuccess] = useState<{ open: boolean; mode: "edit" | "contract" }>({ open: false, mode: "edit" });

    const load = useCallback(async (showLoading: boolean) => {
        if (!Number.isInteger(clientId) || clientId < 1) {
            setLoadState({ status: "error", message: "El cliente no es válido." });
            return;
        }
        if (showLoading) setLoadState({ status: "loading" });
        try {
            const { clienteNegocio, contratos } = await getClienteNegocioContratos(clientId);
            // El detalle del cliente que devuelve este servicio es un resumen: se completa con las fechas que no trae
            const client: ClienteNegocio = { ...clienteNegocio, createdAt: "", updatedAt: "" };
            setLoadState({ status: "ready", client, contracts: contratos });
        } catch {
            setLoadState({ status: "error", message: "No se pudo cargar el cliente. Verifica la conexión e inténtalo nuevamente." });
        }
    }, [clientId]);

    // Carga inicial desde la API: el estado se actualiza al resolverse la petición.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(true); }, [load]);

    const contracts = useMemo(() => {
        if (loadState.status !== "ready") return [];
        return [...loadState.contracts].sort((a, b) => parseFecha(b.fechaRegistro).getTime() - parseFecha(a.fechaRegistro).getTime());
    }, [loadState]);

    if (loadState.status === "loading") {
        return (
            <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-muted">
                <Spinner className="size-8 text-brand" />
                <p className="text-[14px] font-medium">Cargando cliente...</p>
            </div>
        );
    }

    if (loadState.status === "error") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <TriangleAlert size={44} className="text-brand" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-ink">Cliente no disponible</h1>
                <p role="alert" className="text-ink-muted">{loadState.message}</p>
                <div className="flex gap-3">
                    <Button nativeButton={false} variant="outline" render={<Link to="/planificacion-comercial" />}><ArrowLeft /> Volver a clientes</Button>
                    <Button onClick={() => void load(true)}><RotateCw size={17} /> Reintentar</Button>
                </div>
            </div>
        );
    }

    const { client } = loadState;
    const totalKilos = contracts.reduce((sum, contract) => sum + contract.kilosAcordados, 0);
    const campaigns = new Set(contracts.map((contract) => contract.campaniaId)).size;
    const latest = contracts[0];

    const metrics: Metric[] = [
        { title: "Contratos", value: String(contracts.length), unit: contracts.length === 1 ? "contrato" : "contratos", description: "Acuerdos registrados con campañas", icon: FileSignature },
        { title: "Kilos acordados", value: kilos.format(totalKilos), unit: "kg", description: "Suma de todos sus contratos", icon: Scale },
        { title: "Campañas", value: String(campaigns), unit: campaigns === 1 ? "campaña" : "campañas", description: "Campañas donde tiene contrato", icon: CalendarDays },
        { title: "Último contrato", value: latest ? displayDate(latest.fechaRegistro) : "—", unit: "", description: latest ? latest.nombreCampania : "Aún sin contratos registrados", icon: CalendarCheck, warm: true },
    ];

    const pageCount = Math.max(1, Math.ceil(contracts.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = contracts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const openContractModal = () => setAddingContract(true);

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Contact size={24} strokeWidth={2.5} />}
                title="Detalle de Cliente"
                description="Datos del cliente y todos sus contratos con las campañas."
                action={
                    <div className="flex flex-col gap-3 sm:flex-row [&>button]:w-full sm:[&>button]:w-auto">
                        <Button variant="outline" size="xl" onClick={() => setEditing(true)}><Pencil size={19} strokeWidth={2.5} /> Editar cliente</Button>
                        <Button size="xl" onClick={openContractModal}><Plus size={20} strokeWidth={2.5} /> Añadir contrato</Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 lg:grid-cols-[1.95fr_1fr]">
                <ClientOverviewCard client={client} />
                <MetricCards metrics={metrics} label="Indicadores del cliente" />
            </div>

            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <TableCard
                    icon={<FileSignature size={24} strokeWidth={2.5} />}
                    title="Contratos por campaña"
                    description="Todos los acuerdos del cliente, del más reciente al más antiguo."
                    headerRight={
                        <TableToolbar>
                            <TableCountPill icon={<FileSignature size={16} strokeWidth={2.5} className="text-brand" />} count={contracts.length} label={contracts.length === 1 ? "contrato" : "contratos"} />
                        </TableToolbar>
                    }
                    isEmpty={contracts.length === 0}
                    emptyIcon={<FileSignature size={28} strokeWidth={2} />}
                    emptyTitle="Aún no hay contratos"
                    emptyDescription="Este cliente todavía no tiene contratos con campañas. Haz clic en 'Añadir contrato' para registrar el primero."
                    emptyAction={{ label: "Añadir contrato", icon: <Plus size={18} strokeWidth={2.5} />, onClick: openContractModal }}
                    page={currentPage}
                    pageCount={pageCount}
                    onPageChange={setPage}
                >
                    {/* Móvil en tarjetas; desde sm, tabla */}
                    <div className="flex flex-col gap-3 sm:hidden">
                        {visible.map((contract) => (
                            <TableGridCard
                                key={contract.clienteNegocioCampanaId}
                                accentColor="border-l-brand"
                                icon={<FileSignature size={18} strokeWidth={2} />}
                                title={contract.nombreCampania}
                                subtitle={`Registrado el ${displayDate(contract.fechaRegistro)}`}
                            >
                                <TableGridCardFields>
                                    <TableGridCardField label="Kilos acordados" value={`${kilos.format(contract.kilosAcordados)} kg`} />
                                    <TableGridCardField
                                        label="Documentos"
                                        value={<span className="flex flex-col items-start gap-1"><DocumentLink label="Contrato" value={contract.documentoUrl} /><DocumentLink label="Ficha técnica" value={contract.fichaTecnicaUrl} /></span>}
                                    />
                                </TableGridCardFields>
                            </TableGridCard>
                        ))}
                    </div>

                    <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
                        <Table aria-label="Contratos del cliente con campañas">
                            <TableHeader className={TABLE_HEAD_BG}>
                                <TableRow className="border-b border-border hover:bg-transparent">
                                    <TableHead className="h-14 px-6 font-semibold text-ink">Campaña</TableHead>
                                    <TableHead className="h-14 font-semibold text-ink">Fecha de registro</TableHead>
                                    <TableHead className="h-14 font-semibold text-ink">Kilos acordados</TableHead>
                                    <TableHead className="h-14 px-6 font-semibold text-ink">Documentos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visible.map((contract) => (
                                    <TableRow key={contract.clienteNegocioCampanaId} className="border-b border-border transition-colors hover:bg-surface-page/60">
                                        <TableCell className="relative h-20 px-6">
                                            <TableRowAccent color="bg-brand" />
                                            <TableRowLead icon={<FileSignature size={20} strokeWidth={2} />} title={contract.nombreCampania} />
                                        </TableCell>
                                        <TableCell className="font-medium text-ink-body">{displayDate(contract.fechaRegistro)}</TableCell>
                                        <TableCell className="font-bold tabular-nums text-ink">{kilos.format(contract.kilosAcordados)} kg</TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex flex-col items-start gap-1">
                                                <DocumentLink label="Contrato" value={contract.documentoUrl} />
                                                <DocumentLink label="Ficha técnica" value={contract.fichaTecnicaUrl} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TableCard>
            </div>

            <ClientFormModal
                open={editing}
                onOpenChange={setEditing}
                mode="edit"
                clientId={client.clienteNegocioId}
                initialValues={client}
                onSuccess={() => {
                    setEditing(false);
                    setSuccess({ open: true, mode: "edit" });
                    void load(false);
                }}
            />

            <CampaignLinkClientModal
                open={addingContract}
                onOpenChange={setAddingContract}
                cliente={client}
                onSave={() => {
                    setAddingContract(false);
                    setSuccess({ open: true, mode: "contract" });
                    void load(false);
                }}
            />

            <ClientSuccessModal
                open={success.open}
                onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))}
                mode={success.mode}
            />
        </div>
    );
}
