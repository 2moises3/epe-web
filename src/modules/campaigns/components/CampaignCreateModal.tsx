import { useState } from "react";
import { Leaf, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";

interface CampaignCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function CampaignCreateModal({ open, onOpenChange, onSuccess }: CampaignCreateModalProps) {
    const [selectedFruits, setSelectedFruits] = useState<string[]>([]);



    const handleRemoveFruit = (fruit: string) => {
        setSelectedFruits(selectedFruits.filter((f) => f !== fruit));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[700px] p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <div className="flex items-start gap-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                            <Leaf size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-ink">
                                Nueva Campaña
                            </DialogTitle>
                            <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                Completa la información para registrar una nueva campaña.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    {/* Nombre */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Nombre de Campaña:</label>
                        <Input
                            placeholder="Ej: Campaña Mango 2026"
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Fecha Inicio:</label>
                            <Input
                                type="date"
                                className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Fecha Fin:</label>
                            <Input
                                type="date"
                                className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                        </div>
                    </div>

                    {/* Fruta Principal */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Seleccionar Fruta:</label>
                        <Select onValueChange={(value) => {
                            if (value === "Mango") {
                                const derivatives = ["Mango Kent", "Mango Edward", "Mango Haden"];
                                const toAdd = derivatives.filter(d => !selectedFruits.includes(d));
                                setSelectedFruits([...selectedFruits, ...toAdd]);
                            }
                        }} value="">
                            <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar Fruta" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="Mango" className="rounded-lg">Mango</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>


                    {/* Frutas Seleccionadas */}
                    <div className={`flex flex-col gap-2.5 transition-all duration-300 ${selectedFruits.length > 0 ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
                        <label className="text-[13px] font-semibold text-ink">Frutas derivadas seleccionadas:</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedFruits.map((fruit) => (
                                <div
                                    key={fruit}
                                    className="bg-brand-surface text-brand pr-3 pl-2 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-2"
                                >
                                    <Hint label="Quitar">
                                        <button
                                            onClick={() => handleRemoveFruit(fruit)}
                                            className="hover:bg-brand-border rounded-full p-0.5 transition-colors text-brand"
                                            aria-label={`Quitar ${fruit}`}
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </Hint>
                                    {fruit}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Requerimientos */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Requerimientos Comerciales:</label>
                        <div className="relative">
                            <Input
                                placeholder="Ej: 3000"
                                className="rounded-lg h-11 border-border pr-12 shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-surface text-brand text-[11px] font-bold px-2 py-1 rounded-md">
                                KG
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4 mt-8 [&>button]:w-full sm:[&>button]:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg h-11 px-8 border-border text-ink-muted font-bold hover:bg-muted hover:text-ink transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onSuccess}
                        className="rounded-lg h-11 px-6 bg-brand hover:bg-brand-dark text-white font-semibold gap-2 shadow-sm transition-colors active:scale-95"
                    >
                        <Leaf size={18} strokeWidth={2.5} />
                        Crear Campaña
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
