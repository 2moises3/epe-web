import { useState } from "react";
import { Search, CalendarDays, Settings2, UserPlus, UserCheck, Eye, Users, FilePlus } from "lucide-react";
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
import RowActions from "@/shared/components/RowActions";
import PageHeader from "@/shared/layout/PageHeader";
import CampaignLinkProviderModal from "@/modules/campaigns/components/CampaignLinkProviderModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignExamModal from "@/modules/campaigns/components/CampaignExamModal";
import CampaignInterviewModal from "@/modules/campaigns/components/CampaignInterviewModal";
import CampaignProviderDetailsModal from "@/modules/campaigns/components/CampaignProviderDetailsModal";

export default function CampaignProvidersPage() {
    const [activeTab, setActiveTab] = useState<"Productor" | "Acopiador">("Productor");
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMode, setSuccessMode] = useState<"provider" | "exam" | "interview">("provider");
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProviderName, setSelectedProviderName] = useState<string>("");

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
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "Productor" | "Acopiador")} className="w-full sm:w-fit">
                    <TabsList className="inline-flex w-full sm:w-auto h-[46px] sm:h-[52px] p-1.5 bg-status-neutral-surface/60 rounded-full items-center">
                        <TabsTrigger 
                            value="Productor" 
                            className="flex-1 sm:flex-none px-5 sm:px-8 h-full text-[13.5px] sm:text-[14.5px] font-bold rounded-full text-ink-muted data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-sm transition-all"
                        >
                            Productor
                        </TabsTrigger>
                        <TabsTrigger 
                            value="Acopiador" 
                            className="flex-1 sm:flex-none px-5 sm:px-8 h-full text-[13.5px] sm:text-[14.5px] font-bold rounded-full text-ink-muted data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-sm transition-all"
                        >
                            Acopiador
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <h2 className="text-[16px] sm:text-[18px] font-bold text-ink">
                    {activeTab === "Productor" ? "Productores de la Campaña" : "Acopiadores de la Campaña"}
                </h2>
            </div>

            {/* Filtros */}
            <Card className="mb-8 border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] rounded-2xl">
                <CardContent className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 sm:items-end">
                        <div className="w-full sm:flex-1 flex flex-col gap-2.5">
                            <label className="text-[13px] font-bold text-ink">Buscador</label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} strokeWidth={2} />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    className="pl-10 rounded-lg h-11 border-border bg-white shadow-none text-[14px] focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-ink">Fecha Inicio</label>
                            <Select>
                                <SelectTrigger className="w-full rounded-lg !h-11 border-border shadow-none text-ink-muted font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={16} className="opacity-70" />
                                        <SelectValue placeholder="--/--/----" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="today" className="rounded-lg">Hoy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-ink">Fecha Fin</label>
                            <Select>
                                <SelectTrigger className="w-full rounded-lg !h-11 border-border shadow-none text-ink-muted font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={16} className="opacity-70" />
                                        <SelectValue placeholder="--/--/----" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="today" className="rounded-lg">Hoy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="outline" className="h-11 rounded-lg px-6 border-border text-ink-muted gap-2 hover:bg-muted hover:text-ink shadow-none font-semibold transition-colors">
                            <Settings2 size={16} strokeWidth={2.5} />
                            Limpiar Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla */}
            <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
                <CardContent className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                <Users size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-[15px] sm:text-[17px] font-bold text-ink leading-tight mb-1">
                                    {activeTab === "Productor" ? "Productores Vinculados" : "Acopiadores Vinculados"}
                                </h2>
                                <p className="text-[12.5px] sm:text-[13px] text-ink-muted font-medium">Gestiona, consulta y da seguimiento a los proveedores de esta campaña.</p>
                            </div>
                        </div>
                        <div className="text-[13px] text-muted-foreground font-medium">
                            Mostrando <span className="font-bold">2</span> de <span className="font-bold">2</span> proveedores
                        </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-border">
                        <Table>
                            <TableHeader className="bg-surface-page">
                                <TableRow className="border-b border-border hover:bg-transparent">
                                    <TableHead className="text-ink font-semibold h-14 px-6">Nombres</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">DNI</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">Zona</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">Tipo de Proveedor</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">Estado</TableHead>
                                    <TableHead className="text-ink font-semibold h-14 text-center px-6 w-36">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-b border-border hover:bg-surface-page/60">
                                    <TableCell className="font-medium text-ink h-16 px-6">Robertp</TableCell>
                                    <TableCell className="text-ink-body font-medium">75369841</TableCell>
                                    <TableCell className="text-ink-body font-medium">Lima</TableCell>
                                    <TableCell className="text-ink-body font-medium">{activeTab}</TableCell>
                                    <TableCell>
                                        <StatusBadge status="Desconocido" />
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <RowActions
                                            className="justify-center text-ink-muted"
                                            primary={[
                                                { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => { setSelectedProviderName("Juan Pérez"); setIsDetailsModalOpen(true); } },
                                            ]}
                                            secondary={activeTab === "Productor" ? [
                                                { label: "Registrar entrevista", icon: <UserPlus size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) },
                                                { label: "Registrar examen", icon: <FilePlus size={16} strokeWidth={2.5} />, onClick: () => setIsExamModalOpen(true) },
                                            ] : []}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-b border-border hover:bg-surface-page/60">
                                    <TableCell className="font-medium text-ink h-16 px-6">Felipe</TableCell>
                                    <TableCell className="text-ink-body font-medium">74125896</TableCell>
                                    <TableCell className="text-ink-body font-medium">Piura</TableCell>
                                    <TableCell className="text-ink-body font-medium">{activeTab}</TableCell>
                                    <TableCell>
                                        <StatusBadge status="Desconocido" />
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <RowActions
                                            className="justify-center text-ink-muted"
                                            primary={[
                                                { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => { setSelectedProviderName("Carlos Mendoza"); setIsDetailsModalOpen(true); } },
                                            ]}
                                            secondary={activeTab === "Productor" ? [
                                                { label: "Ver entrevista", icon: <UserCheck size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) },
                                                { label: "Registrar examen", icon: <FilePlus size={16} strokeWidth={2.5} />, onClick: () => setIsExamModalOpen(true) },
                                            ] : []}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <CampaignLinkProviderModal
                open={isLinkModalOpen}
                onOpenChange={setIsLinkModalOpen}
                onSave={() => {
                    setIsLinkModalOpen(false);
                    setSuccessMode("provider");
                    setIsSuccessModalOpen(true);
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

            <CampaignInterviewModal
                open={isInterviewModalOpen}
                onOpenChange={setIsInterviewModalOpen}
                onSave={() => {
                    setIsInterviewModalOpen(false);
                    setSuccessMode("interview");
                    setIsSuccessModalOpen(true);
                }}
            />

            <CampaignSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                mode={successMode}
            />

            <CampaignProviderDetailsModal
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                providerName={selectedProviderName}
                providerType={activeTab}
            />
        </div>
    );
}
