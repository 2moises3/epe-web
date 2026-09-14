import {  useNavigate } from "react-router-dom";
import {  Calendar, Tag, Sprout, TrendingUp, Users, Briefcase, ArrowLeft } from "lucide-react";
import StatusBadge from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useState } from "react";
import CampaignManagementProvidersModal from "@/modules/campaigns/components/CampaignManagementProvidersModal";
import CampaignManagementClientsModal from "@/modules/campaigns/components/CampaignManagementClientsModal";
import CampaignCertificationsList from "@/modules/campaigns/components/CampaignCertificationsList";
import PageHeader from "@/shared/layout/PageHeader";



export default function CampaignDetailsPage() {
    const navigate = useNavigate();
    const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);
    const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
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
                    <Card className="rounded-2xl border-border border-t-[5px] border-t-brand shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
                        <CardContent className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                        <div className="flex justify-between items-start mt-2">
                            <div>
                                <p className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1">Campaña Activa</p>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Mango 2026</h1>
                            </div>
                            <StatusBadge status="Planificado" />
                        </div>

                        {/* Dates Section */}
                        <div className="flex flex-wrap items-center gap-4 bg-status-neutral-surface/60 rounded-xl p-4 border border-border">
                            <div className="flex-1 min-w-[130px]">
                                <p className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1">Fecha Inicio</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-brand shrink-0" />
                                    <span className="text-[14px] sm:text-[15px] font-bold text-ink">01 / 06 / 2026</span>
                                </div>
                            </div>
                            <div className="hidden sm:flex w-8 justify-center text-status-neutral">
                                <TrendingUp size={20} strokeWidth={3} className="rotate-45" />
                            </div>
                            <div className="flex-1 min-w-[130px]">
                                <p className="text-[11px] font-bold text-ink-muted tracking-wider uppercase mb-1">Fecha Fin</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-brand shrink-0" />
                                    <span className="text-[14px] sm:text-[15px] font-bold text-ink">31 / 08 / 2026</span>
                                </div>
                            </div>
                            <div className="pl-4 sm:pl-6 border-l border-border flex flex-col items-center justify-center shrink-0">
                                <p className="text-[11px] font-bold text-brand tracking-wider uppercase mb-0.5">Días</p>
                                <span className="text-xl font-black text-brand">92</span>
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
                        </CardContent>
                    </Card>

                    {/* Avance de Cosecha Card */}
                    <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
                        <CardContent className="p-4 sm:p-6 flex flex-col gap-5">
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
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]"><CardContent className="p-5 flex flex-col gap-4 h-full">
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
                        </CardContent></Card>

                        {/* Kilos Cosechados */}
                        <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]"><CardContent className="p-5 flex flex-col gap-4 h-full">
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
                        </CardContent></Card>
                    </div>

                    <CampaignCertificationsList />
                </div>
            </div>

            <CampaignManagementProvidersModal 
                open={isProvidersModalOpen} 
                onOpenChange={setIsProvidersModalOpen} 
            />

            <CampaignManagementClientsModal
                open={isClientsModalOpen}
                onOpenChange={setIsClientsModalOpen}
            />
        </div>
    );
}
