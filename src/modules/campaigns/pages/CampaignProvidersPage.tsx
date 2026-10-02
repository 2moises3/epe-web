import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, CalendarDays, Settings2, UserPlus, Eye, Users, FilePlus } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import StatusBadge from "@/shared/components/StatusBadge";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignLinkProviderModal from "@/modules/campaigns/components/CampaignLinkProviderModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignExamModal from "@/modules/campaigns/components/CampaignExamModal";
import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";

const TAB_TO_TIPO = {
    Productor: "productor",
    Acopiador: "acopio",
} as const;

export default function CampaignProvidersPage() {
    const { id } = useParams<{ id: string }>();
    const campaniaId = id ? Number(id) : NaN;

    const [activeTab, setActiveTab] = useState<"Productor" | "Acopiador">("Productor");
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMode, setSuccessMode] = useState<"provider" | "exam">("provider");

    const [campaniaProveedores, setCampaniaProveedores] = useState<CampaniaProveedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCampaniaProveedores = () => {
        if (Number.isNaN(campaniaId)) {
            setIsLoading(false);
            setError("Campaña inválida.");
            return;
        }
        setIsLoading(true);
        getCampaniaProveedoresByCampania(campaniaId)
            .then(setCampaniaProveedores)
            .catch(() => setError("No se pudieron cargar los proveedores de la campaña."))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadCampaniaProveedores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaniaId]);

    const filteredProveedores = campaniaProveedores.filter(
        (cp) => cp.tipoProveedor === TAB_TO_TIPO[activeTab]
    );

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Users size={24} strokeWidth={2.5} />}
                title="Proveedores de la Campaña"
                description="Gestiona los productores y acopiadores vinculados a esta campaña."
                action={
                    <Button
                        onClick={() => setIsLinkModalOpen(true)}
                        className="h-11 rounded-lg px-6 font-semibold text-white bg-brand hover:bg-brand-dark shadow-sm"
                    >
                        + Vincular proveedor
                    </Button>
                }
            />

            {/* Tabs & Subtitle */}
            <div className="mb-8 flex flex-col gap-6">
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "Productor" | "Acopiador")} className="w-fit">
                    <TabsList className="inline-flex h-[52px] p-1.5 bg-status-neutral-surface/60 rounded-full items-center">
                        <TabsTrigger
                            value="Productor"
                            className="px-8 h-full text-[14.5px] font-bold rounded-full text-ink-muted data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-sm transition-all"
                        >
                            Productor
                        </TabsTrigger>
                        <TabsTrigger
                            value="Acopiador"
                            className="px-8 h-full text-[14.5px] font-bold rounded-full text-ink-muted data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-sm transition-all"
                        >
                            Acopiador
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <h2 className="text-[18px] font-bold text-ink">
                    {activeTab === "Productor" ? "Productores de la Campaña" : "Acopiadores de la Campaña"}
                </h2>
            </div>

            {/* Filtros */}
            <Card className="mb-8 border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] rounded-2xl">
                <CardContent className="p-6 flex flex-col gap-6">
                    <div className="flex gap-5 items-end">
                        <div className="flex-1 flex flex-col gap-2.5">
                            <label className="text-[13px] font-bold text-ink">Buscador</label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} strokeWidth={2} />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    className="pl-10 rounded-sm h-11 border-border bg-white shadow-none text-[14px] focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-ink">Fecha Inicio</label>
                            <Select>
                                <SelectTrigger className="w-full rounded-sm !h-11 border-border shadow-none text-ink-muted font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={16} className="opacity-70" />
                                        <SelectValue placeholder="--/--/----" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-sm">
                                    <SelectItem value="today" className="rounded-sm">Hoy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-ink">Fecha Fin</label>
                            <Select>
                                <SelectTrigger className="w-full rounded-sm !h-11 border-border shadow-none text-ink-muted font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={16} className="opacity-70" />
                                        <SelectValue placeholder="--/--/----" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-sm">
                                    <SelectItem value="today" className="rounded-sm">Hoy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="outline" className="h-11 rounded-sm px-6 border-border text-ink-muted gap-2 hover:bg-muted hover:text-ink shadow-none font-semibold transition-colors">
                            <Settings2 size={16} strokeWidth={2.5} />
                            Limpiar Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla */}
            <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
                <CardContent className="p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                <Users size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-[17px] font-bold text-ink leading-tight mb-1">
                                    {activeTab === "Productor" ? "Productores Vinculados" : "Acopiadores Vinculados"}
                                </h2>
                                <p className="text-[13px] text-ink-muted font-medium">Gestiona, consulta y da seguimiento a los proveedores de esta campaña.</p>
                            </div>
                        </div>
                        <div className="text-[13px] text-muted-foreground font-medium">
                            Mostrando <span className="font-bold">{filteredProveedores.length}</span> de <span className="font-bold">{filteredProveedores.length}</span> proveedores
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center text-ink-muted py-8">Cargando proveedores...</div>
                    ) : error ? (
                        <div className="text-center text-red-600 py-8">{error}</div>
                    ) : (
                        <div className="rounded-xl overflow-hidden border border-border">
                            <Table>
                                <TableHeader className="bg-surface-page">
                                    <TableRow className="border-b border-border hover:bg-transparent">
                                        <TableHead className="text-ink font-semibold h-14 px-6">Nombres</TableHead>
                                        <TableHead className="text-ink font-semibold h-14">DNI</TableHead>
                                        <TableHead className="text-ink font-semibold h-14">Zona</TableHead>
                                        <TableHead className="text-ink font-semibold h-14">Tipo de Proveedor</TableHead>
                                        <TableHead className="text-ink font-semibold h-14">Estado</TableHead>
                                        <TableHead className="text-ink font-semibold h-14 text-center px-6 w-44">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProveedores.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-ink-muted py-8">
                                                No hay {activeTab === "Productor" ? "productores" : "acopiadores"} vinculados a esta campaña.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProveedores.map((cp) => (
                                            <TableRow key={cp.cxpId} className="border-b border-border hover:bg-surface-page/60">
                                                <TableCell className="font-medium text-ink h-16 px-6">
                                                    {cp.proveedor ? `${cp.proveedor.nombres} ${cp.proveedor.apellido}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-ink-body font-medium">{cp.proveedor?.nmrDocumento ?? "-"}</TableCell>
                                                <TableCell className="text-ink-body font-medium">{cp.proveedor?.zona ?? "-"}</TableCell>
                                                <TableCell className="text-ink-body font-medium">{activeTab}</TableCell>
                                                <TableCell>
                                                    {/* TODO: pendiente de backend, no existe campo de estado de proveedor */}
                                                    <StatusBadge status="Sin definir" />
                                                </TableCell>
                                                <TableCell className="px-6">
                                                    <div className="flex items-center justify-center gap-1.5 text-ink-muted">
                                                        {activeTab === "Productor" && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    disabled
                                                                    title="Entrevistas: API no disponible"
                                                                    aria-label="Entrevistas no disponibles: API no disponible"
                                                                    className="h-9 w-9 hover:text-brand hover:bg-brand-surface rounded-lg transition-colors active:scale-95"
                                                                >
                                                                    <UserPlus size={18} strokeWidth={2.5} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setIsExamModalOpen(true)}
                                                                    className="h-9 w-9 hover:text-brand hover:bg-brand-surface rounded-lg transition-colors active:scale-95"
                                                                >
                                                                    <FilePlus size={18} strokeWidth={2.5} />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-brand hover:bg-brand-surface rounded-lg transition-colors active:scale-95">
                                                            <Eye size={18} strokeWidth={2.5} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CampaignLinkProviderModal
                open={isLinkModalOpen}
                campaniaId={Number.isNaN(campaniaId) ? null : campaniaId}
                onOpenChange={setIsLinkModalOpen}
                onSave={() => {
                    setIsLinkModalOpen(false);
                    setSuccessMode("provider");
                    setIsSuccessModalOpen(true);
                    loadCampaniaProveedores();
                }}
            />

            <CampaignExamModal
                open={isExamModalOpen}
                onOpenChange={setIsExamModalOpen}
                onSave={() => {
                    setIsExamModalOpen(false);
                    setSuccessMode("exam");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successMode}
            />
        </div>
    );
}
