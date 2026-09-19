import { MapPin, Sprout, Leaf } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

interface CampaignInterviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignInterviewModal({ open, onOpenChange, onSave }: CampaignInterviewModalProps) {
    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Informe de Entrevista"
            description="Fundo Los Olivos"
            className="sm:max-w-275"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button size="xl" onClick={() => onSave ? onSave() : onOpenChange(false)}>
                        Guardar entrevista
                    </Button>
                </>
            }
        >
                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-12">
                    {/* Left Column */}
                    <div className="flex flex-col gap-8 lg:border-r lg:border-border lg:pr-12">
                        {/* Datos del cultivo */}
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-2 text-brand pb-2 border-b border-border">
                                <Sprout size={18} strokeWidth={2.5} />
                                <h3 className="text-[13px] font-bold uppercase tracking-wider">Datos del cultivo</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-muted-foreground uppercase">Densidad plantación</label>
                                    <Input
                                        placeholder="0.00"
                                        className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-[12px] font-bold text-muted-foreground uppercase">Distanciamiento</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="0.00"
                                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand pr-8"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink">m</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-muted-foreground uppercase">Frecuencia de riego (Cantidad / día)</label>
                                <Input
                                    placeholder="40"
                                    className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-muted-foreground uppercase">Ha total finca</label>
                                    <Input
                                        placeholder="0"
                                        className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-[12px] font-bold text-muted-foreground uppercase">Ha del cultivo</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="0"
                                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand pr-8"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink">ha</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fertilización */}
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-2 text-brand pb-2 border-b border-border">
                                <Leaf size={18} strokeWidth={2.5} />
                                <h3 className="text-[13px] font-bold uppercase tracking-wider">Fertilización</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-muted-foreground uppercase">Nombre de aplicación</label>
                                    <Input
                                        placeholder="Fertilizante X"
                                        className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-[12px] font-bold text-muted-foreground uppercase">Aplicaciones al año</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="3"
                                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink">/año</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2 text-brand pb-2 border-b border-border">
                            <MapPin size={18} strokeWidth={2.5} />
                            <h3 className="text-[13px] font-bold uppercase tracking-wider">Ubicación</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Departamento</label>
                                <Input placeholder="Piura" className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand text-[13px]" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Provincia</label>
                                <Input placeholder="Sullana" className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand text-[13px]" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Distrito</label>
                                <Input placeholder="Marcavelica" className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand text-[13px]" />
                            </div>
                        </div>

                        {/* Fake Map */}
                        <div className="h-50 w-full rounded-2xl border-brand-surface bg-brand-surface/20 overflow-hidden relative mt-2 flex flex-col items-center justify-center gap-2">
                            {/* Grid overlay for map look */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            <div className="relative z-10 w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center" style={{ color: "var(--brand-gradient-mid)" }}>
                                <MapPin size={24} strokeWidth={2.5} />
                            </div>
                            <span className="relative z-10 text-[13px] font-bold text-brand">Mapa de ubicación</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-muted-foreground uppercase">Latitud</label>
                                <Input placeholder="4" className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-muted-foreground uppercase">Longitud</label>
                                <Input placeholder="5" className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand" />
                            </div>
                        </div>
                    </div>
                </div>
        </AppModal>
    );
}
