import { useState, useEffect } from "react";
import { Leaf } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

interface CampaignCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function CampaignCreateModal({ open, onOpenChange, onSuccess }: CampaignCreateModalProps) {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [fruit, setFruit] = useState<string>("");
    const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
    const [reqs, setReqs] = useState("");

    // Resetear estados cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            setName("");
            setStartDate("");
            setEndDate("");
            setFruit("");
            setSelectedFruits([]);
            setReqs("");
        }
    }, [open]);

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Nueva Campaña"
            description="Completa la información para registrar una nueva campaña."
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        <Leaf size={18} strokeWidth={2.5} />
                        Crear Campaña
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-6">
                    {/* Nombre */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Nombre de Campaña:</label>
                        <Input
                            placeholder="Ej: Campaña Mango 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Fecha Inicio:</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Fecha Fin:</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                        </div>
                    </div>

                    {/* Fruta Principal y Requerimientos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Seleccionar Fruta:</label>
                            <Select 
                                value={fruit}
                                onValueChange={(value) => {
                                    setFruit(value);
                                    if (value === "Mango") {
                                        const derivatives = ["Mango Kent", "Mango Edward", "Mango Haden"];
                                        setSelectedFruits(derivatives);
                                    } else {
                                        setSelectedFruits([]);
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full rounded-lg h-11! border-border shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <SelectValue placeholder="Seleccionar Fruta" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="Mango" className="rounded-lg">Mango</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Requerimientos Comerciales:</label>
                            <div className="relative">
                                <Input
                                    placeholder="Ej: 3000"
                                    value={reqs}
                                    onChange={(e) => setReqs(e.target.value)}
                                    className="rounded-lg h-11 border-border pr-12 shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-surface text-brand text-[11px] font-bold px-2 py-1 rounded-md">
                                    KG
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Frutas Seleccionadas (Informativo) */}
                    {selectedFruits.length > 0 && (
                        <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[13px] font-semibold text-ink">Frutas derivadas seleccionadas:</label>
                            <div className="flex flex-wrap gap-2">
                                {selectedFruits.map((fruit) => (
                                    <div
                                        key={fruit}
                                        className="bg-brand-surface/50 border border-brand/20 text-brand px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                                        {fruit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
        </AppModal>
    );
}
