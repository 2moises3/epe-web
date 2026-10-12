import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { ClipboardList, Eye, LandPlot, MapPin, Pencil, Plus, RotateCw, TriangleAlert, UserRoundCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableCard from "@/shared/components/TableCard";
import { TableCountPill, TableToolbar } from "@/shared/components/TableToolbar";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignContextBanner from "@/modules/campaigns/components/CampaignContextBanner";
import CampaignInterviewModal, { type InterviewSubmission } from "@/modules/campaigns/components/CampaignInterviewModal";
import { getCampana, getFrutas } from "@/modules/campaigns/api/campaign.api";
import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import type { Campana } from "@/modules/campaigns/api/campaign.mapper";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import { getCampaignInterviews, getNextCampaignFincaCode, saveCampaignInterview, type CampaignInterviewRecord } from "@/modules/campaigns/campaignInterview.utils";
import { addFinca, useProviderLocalData } from "@/modules/providers/providerLocalData.store";

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; campaign: Campana; relation: CampaniaProveedor; fruitName: string };

type ModalState = { open: boolean; mode: "create" | "edit" | "view"; record: CampaignInterviewRecord | null };
const CLOSED_MODAL: ModalState = { open: false, mode: "create", record: null };

const providerName = (relation: CampaniaProveedor) => relation.proveedor
    ? `${relation.proveedor.nombres} ${relation.proveedor.apellido}`.trim()
    : "Productor";

/** Gestión de las entrevistas de un productor vinculado a una campaña. */
export default function CampaignInterviewsPage() {
    const { id, cxpId: relationParam } = useParams<{ id: string; cxpId: string }>();
    const campaignId = Number(id);
    const cxpId = Number(relationParam);
    const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
    const [records, setRecords] = useState<CampaignInterviewRecord[]>(() => getCampaignInterviews(cxpId));
    const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
    const { fincas } = useProviderLocalData();

    const load = useCallback(async () => {
        if (!Number.isInteger(campaignId) || campaignId < 1 || !Number.isInteger(cxpId) || cxpId < 1) {
            setLoadState({ status: "error", message: "La campaña o el proveedor no son válidos." });
            return;
        }
        setLoadState({ status: "loading" });
        try {
            const [campaign, relations] = await Promise.all([
                getCampana(campaignId),
                getCampaniaProveedoresByCampania(campaignId),
            ]);
            const relation = relations.find((item) => item.cxpId === cxpId);
            if (!relation || relation.tipoProveedor !== "productor") {
                setLoadState({ status: "error", message: "No se encontró este productor en la campaña." });
                return;
            }
            const fruitName = campaign.fruta?.name ?? (await getFrutas()).find((fruit) => fruit.frutaId === campaign.frutaId)?.name;
            if (!fruitName) {
                setLoadState({ status: "error", message: "No se pudo identificar la fruta de esta campaña para generar el código FYV." });
                return;
            }
            setLoadState({ status: "ready", campaign, relation, fruitName });
        } catch {
            setLoadState({ status: "error", message: "No se pudo cargar la campaña o el proveedor." });
        }
    }, [campaignId, cxpId]);

    // Carga inicial desde las APIs existentes; las entrevistas siguen siendo locales hasta que exista su servicio.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);
    // Al navegar entre productores sin desmontar la ruta, se muestra el almacén del vínculo nuevo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setRecords(getCampaignInterviews(cxpId)); }, [cxpId]);

    const handleSave = ({ values, newFinca }: InterviewSubmission) => {
        if (loadState.status !== "ready") return;
        const nextRecords = saveCampaignInterview(campaignId, cxpId, loadState.fruitName, values, modal.mode === "edit" ? modal.record?.id : undefined);
        if (newFinca) addFinca(loadState.relation.proveedorId, newFinca);
        setRecords(nextRecords);
        setModal((current) => ({ ...current, open: false }));
    };

    if (loadState.status !== "ready") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
                {loadState.status === "loading" ? (
                    <><Spinner className="size-9 text-brand" /><p className="text-ink-muted">Cargando entrevistas...</p></>
                ) : (
                    <>
                        <TriangleAlert className="size-10 text-brand" aria-hidden="true" />
                        <h1 className="text-xl font-bold text-ink">Entrevistas no disponibles</h1>
                        <p role="alert" className="text-ink-muted">{loadState.message}</p>
                        <Button onClick={() => void load()}><RotateCw size={17} /> Reintentar</Button>
                    </>
                )}
            </div>
        );
    }

    const { campaign, relation, fruitName } = loadState;
    const name = providerName(relation);
    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <CampaignContextBanner campaign={campaign} />

            <PageHeader
                icon={<UserRoundCheck size={24} />}
                title={`Entrevistas de ${name}`}
                description="Registra y consulta los datos de las fincas entrevistadas en esta campaña."
                action={<Button size="xl" onClick={() => setModal({ open: true, mode: "create", record: null })}><Plus size={19} /> Registrar entrevista</Button>}
            />

            <TableCard
                icon={<LandPlot size={24} strokeWidth={2.2} />}
                title="Fincas entrevistadas"
                description="Registros ordenados por fecha y hora de incorporación."
                headerRight={<TableToolbar><TableCountPill icon={<UserRoundCheck size={16} strokeWidth={2.5} className="text-brand" />} count={records.length} label={records.length === 1 ? "entrevista" : "entrevistas"} /></TableToolbar>}
                isEmpty={records.length === 0}
                emptyIcon={<ClipboardList size={28} />}
                emptyTitle="Aún no hay entrevistas"
                emptyDescription="Registra la primera entrevista para consultar aquí sus datos agronómicos."
                emptyAction={{ label: "Registrar entrevista", icon: <Plus size={18} />, onClick: () => setModal({ open: true, mode: "create", record: null }) }}
                page={1}
                pageCount={1}
                onPageChange={() => {}}
            >
                <div className="grid gap-3 md:hidden">
                    {records.map((record) => (
                        <Card key={record.id} className="rounded-xl border border-border py-0">
                            <CardContent className="flex items-start justify-between gap-4 p-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-ink">{record.values.fincaNombre}</p>
                                    <p className="mt-1 text-xs text-ink-muted">{format(new Date(record.createdAt), "dd/MM/yyyy · HH:mm")}</p>
                                    <p className="mt-1 text-xs font-bold text-brand">{record.codigoFyv}</p>
                                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-body"><MapPin size={13} />{[record.values.distrito, record.values.provincia, record.values.departamento].filter(Boolean).join(", ")}</p>
                                    <p className="mt-1 text-xs text-ink-body">{record.values.haCultivo} ha de cultivo</p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <Button variant="ghost" size="icon" aria-label={`Ver entrevista de ${record.values.fincaNombre}`} onClick={() => setModal({ open: true, mode: "view", record })}><Eye size={17} /></Button>
                                    <Button variant="ghost" size="icon" aria-label={`Editar entrevista de ${record.values.fincaNombre}`} onClick={() => setModal({ open: true, mode: "edit", record })}><Pencil size={16} /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="hidden overflow-hidden rounded-xl border border-border md:block">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="h-14 px-6 font-semibold text-ink">Finca</TableHead>
                                <TableHead className="font-semibold text-ink">Fecha de registro</TableHead>
                                <TableHead className="font-semibold text-ink">Código FYV</TableHead>
                                <TableHead className="font-semibold text-ink">Ubicación</TableHead>
                                <TableHead className="font-semibold text-ink">Cultivo</TableHead>
                                <TableHead className="font-semibold text-ink">Datos agronómicos</TableHead>
                                <TableHead className="w-32 text-center font-semibold text-ink">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.map((record) => (
                                <TableRow key={record.id} className="border-border">
                                    <TableCell className="relative h-19 px-6"><TableRowAccent color="bg-brand" /><TableRowLead icon={<LandPlot size={18} />} title={record.values.fincaNombre} /></TableCell>
                                    <TableCell className="whitespace-nowrap text-ink-body">{format(new Date(record.createdAt), "dd/MM/yyyy · HH:mm")}</TableCell>
                                    <TableCell className="whitespace-nowrap font-semibold text-brand">{record.codigoFyv}</TableCell>
                                    <TableCell className="text-ink-body">{[record.values.distrito, record.values.provincia, record.values.departamento].filter(Boolean).join(", ")}</TableCell>
                                    <TableCell className="whitespace-nowrap font-semibold text-ink">{record.values.haCultivo} ha</TableCell>
                                    <TableCell className="text-ink-body">{record.values.densidadPlantacion} plantas/ha · {record.values.frecuenciaRiego} riegos/día</TableCell>
                                    <TableCell><div className="flex justify-center gap-1">
                                        <Button variant="ghost" size="icon" aria-label={`Ver entrevista de ${record.values.fincaNombre}`} onClick={() => setModal({ open: true, mode: "view", record })}><Eye size={18} /></Button>
                                        <Button variant="ghost" size="icon" aria-label={`Editar entrevista de ${record.values.fincaNombre}`} onClick={() => setModal({ open: true, mode: "edit", record })}><Pencil size={17} /></Button>
                                    </div></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TableCard>

            <CampaignInterviewModal
                open={modal.open}
                onOpenChange={(open) => setModal((current) => ({ ...current, open }))}
                providerName={name}
                fincas={fincas[relation.proveedorId] ?? []}
                interviewedFincaNames={records.map((record) => record.values.fincaNombre ?? "")}
                previewCode={getNextCampaignFincaCode(campaignId, fruitName)}
                initialRecord={modal.record}
                isViewOnly={modal.mode === "view"}
                onSave={handleSave}
            />
        </div>
    );
}
