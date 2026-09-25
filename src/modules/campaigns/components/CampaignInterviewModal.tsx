import { MapPin, Sprout, Leaf, X, Save, ClipboardList } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Field, FieldLabel } from "@/shared/components/ui/field";
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
            icon={<ClipboardList size={22} strokeWidth={2} />}
            title="Informe de Entrevista"
            description="Fundo Los Olivos"
            className="sm:max-w-275"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={() => onSave ? onSave() : onOpenChange(false)}>
                        <Save size={20} strokeWidth={2.5} /> Guardar entrevista
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
                                <h3 className="text-[13px] font-bold uppercase tracking-wider text-brand">Datos del cultivo</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel variant="compact">Densidad plantación</FieldLabel>
                                    <Input
                                        placeholder="0.00"
                                    />
                                </Field>
                                <Field className="relative">
                                    <FieldLabel variant="compact">Distanciamiento</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            placeholder="0.00"
                                            className="pr-8"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink">m</span>
                                    </div>
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel variant="compact">Frecuencia de riego (Cantidad / día)</FieldLabel>
                                <Input
                                    placeholder="40"
                                />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel variant="compact">Ha total finca</FieldLabel>
                                    <Input
                                        placeholder="0"
                                    />
                                </Field>
                                <Field className="relative">
                                    <FieldLabel variant="compact">Ha del cultivo</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            placeholder="0"
                                            className="pr-8"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink">ha</span>
                                    </div>
                                </Field>
                            </div>
                        </div>

                        {/* Fertilización */}
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-2 text-brand pb-2 border-b border-border">
                                <Leaf size={18} strokeWidth={2.5} />
                                <h3 className="text-[13px] font-bold uppercase tracking-wider text-brand">Fertilización</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel variant="compact">Nombre de aplicación</FieldLabel>
                                    <Input
                                        placeholder="Fertilizante X"
                                    />
                                </Field>
                                <Field className="relative">
                                    <FieldLabel variant="compact">Aplicaciones al año</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            placeholder="3"
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink">/año</span>
                                    </div>
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2 text-brand pb-2 border-b border-border">
                            <MapPin size={18} strokeWidth={2.5} />
                            <h3 className="text-[13px] font-bold uppercase tracking-wider text-brand">Ubicación</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Field>
                                <FieldLabel variant="compact" className="text-[10px]">Departamento</FieldLabel>
                                <Input placeholder="Piura" className="text-[13px]" />
                            </Field>
                            <Field>
                                <FieldLabel variant="compact" className="text-[10px]">Provincia</FieldLabel>
                                <Input placeholder="Sullana" className="text-[13px]" />
                            </Field>
                            <Field>
                                <FieldLabel variant="compact" className="text-[10px]">Distrito</FieldLabel>
                                <Input placeholder="Marcavelica" className="text-[13px]" />
                            </Field>
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
                            <Field>
                                <FieldLabel variant="compact">Latitud</FieldLabel>
                                <Input placeholder="4" />
                            </Field>
                            <Field>
                                <FieldLabel variant="compact">Longitud</FieldLabel>
                                <Input placeholder="5" />
                            </Field>
                        </div>
                    </div>
                </div>
        </AppModal>
    );
}
