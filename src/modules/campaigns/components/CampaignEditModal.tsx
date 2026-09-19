import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";

interface CampaignEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaignId?: number | null;
    onSuccess?: () => void;
}

export default function CampaignEditModal({ open, onOpenChange, onSuccess }: CampaignEditModalProps) {
    const [name, setName] = useState("Campaña Mango 2026");
    const [startDate, setStartDate] = useState("2026-01-01");
    const [endDate, setEndDate] = useState("2026-12-31");
    const [reqs, setReqs] = useState("3000");

    const [selectedFruit, setSelectedFruit] = useState<string | null>("Mango");
    const [selectedDerivedFruits, setSelectedDerivedFruits] = useState<string[]>(["Mango Kent"]);
    
    const [fruitError, setFruitError] = useState<string | null>(null);

    // Resetear estados cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            setName("Campaña Mango 2026");
            setStartDate("2026-01-01");
            setEndDate("2026-12-31");
            setReqs("3000");
            setSelectedFruit("Mango");
            setSelectedDerivedFruits(["Mango Kent"]);
            setFruitError(null);
        }
    }, [open]);

    const handleFruitChange = (value: string | null) => {
        if (value === "Mngo ") {
            setFruitError("La fruta seleccionada no es válida o está mal escrita.");
            setSelectedFruit(null);
            return;
        }
        setFruitError(null);
        setSelectedFruit(value);
        if (value === "Mango") {
            const derivatives = ["Mango Kent", "Mango Edward", "Mango Haden"];
            const toAdd = derivatives.filter(d => !selectedDerivedFruits.includes(d));
            setSelectedDerivedFruits([...selectedDerivedFruits, ...toAdd]);
        }
    };

    const handleRemoveDerivedFruit = (fruit: string) => {
        setSelectedDerivedFruits(selectedDerivedFruits.filter((f) => f !== fruit));
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Editar Campaña"
            description="Modifica la información de la campaña existente."
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        Guardar
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
                            <Select onValueChange={handleFruitChange} value={selectedFruit || ""}>
                                <SelectTrigger className={`w-full rounded-lg h-11! border-border shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand transition-colors ${fruitError ? "border-destructive focus:ring-destructive" : ""}`}>
                                    <SelectValue placeholder="Seleccionar Fruta" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="Mango" className="rounded-lg">Mango</SelectItem>
                                    <SelectItem value="Mngo " className="rounded-lg text-destructive font-medium">Mngo marron (Mal escrito)</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Validación Micro-animada */}
                            <div className={`transition-all duration-300 overflow-hidden flex items-center gap-2 text-destructive ${fruitError ? "opacity-100 max-h-10 mt-1" : "opacity-0 max-h-0 mt-0"}`}>
                                <AlertCircle size={14} />
                                <span className="text-[13px] font-medium">{fruitError}</span>
                            </div>
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
                    <div className={`flex flex-col gap-2.5 transition-all duration-300 ${selectedDerivedFruits.length > 0 ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
                        <label className="text-[13px] font-semibold text-ink">Frutas derivadas seleccionadas:</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedDerivedFruits.map((fruit) => (
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
                </div>
        </AppModal>
    );
}
