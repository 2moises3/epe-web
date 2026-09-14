import { useState } from "react";
import { X, UserRound, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface CampaignLinkProviderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignLinkProviderModal({ open, onOpenChange, onSave }: CampaignLinkProviderModalProps) {
    const [isAcopiador, setIsAcopiador] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");

    const [addedProviders, setAddedProviders] = useState([
        { id: 1, name: "Pepe Alonso", type: "Productor" },
        { id: 2, name: "Pepe Alonso", type: "Acopiador" }
    ]);

    const handleRemove = (id: number) => {
        setAddedProviders(addedProviders.filter(p => p.id !== id));
    };

    const handleAdd = () => {
        if (!selectedProvider) return;

        const name = selectedProvider === "pepe" ? "Pepe Alonso" : "Juan Perez";
        const newProvider = {
            id: Date.now(),
            name,
            type: isAcopiador ? "Acopiador" : "Productor"
        };

        setAddedProviders([...addedProviders, newProvider]);
        setSelectedProvider("");
        setCantidad("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[700px] p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                            <Users size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-ink">
                                Vincular Proveedores
                            </DialogTitle>
                            <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                Asocia productores y acopiadores a esta campaña.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    {/* Seleccionar Proveedor */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Seleccionar Proveedor:</label>
                        <Select value={selectedProvider} onValueChange={(val) => setSelectedProvider(val || "")}>
                            <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccione un proveedor..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="pepe" className="rounded-lg">Pepe Alonso</SelectItem>
                                <SelectItem value="juan" className="rounded-lg">Juan Perez</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tipo y cantidad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Tipo de Proveedor:</label>
                            {/* Selector segmentado con el mismo lenguaje que las pestañas de la vista */}
                            <div className="inline-flex h-11 w-full p-1 bg-status-neutral-surface/60 rounded-lg items-center">
                                <button
                                    type="button"
                                    onClick={() => setIsAcopiador(false)}
                                    aria-pressed={!isAcopiador}
                                    className={`flex-1 h-full text-[13px] font-bold rounded-md transition-all ${
                                        !isAcopiador ? "bg-white text-brand shadow-sm" : "text-ink-muted hover:text-ink"
                                    }`}
                                >
                                    Productor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAcopiador(true)}
                                    aria-pressed={isAcopiador}
                                    className={`flex-1 h-full text-[13px] font-bold rounded-md transition-all ${
                                        isAcopiador ? "bg-white text-brand shadow-sm" : "text-ink-muted hover:text-ink"
                                    }`}
                                >
                                    Acopiador
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Cantidad Estimada:</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleAdd}
                            disabled={!selectedProvider}
                            className="h-11 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95 w-full sm:w-auto"
                        >
                            Agregar
                        </Button>
                    </div>

                    {/* Proveedores Agregados */}
                    <div className="flex flex-col gap-3 pt-1">
                        <label className="text-[13px] font-semibold text-ink">Proveedores Agregados:</label>
                        <div className="flex flex-wrap gap-3">
                            {addedProviders.map((provider) => (
                                <div key={provider.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white min-w-[200px]">
                                    <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                        <UserRound size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-[13px] font-bold text-ink leading-tight mb-0.5">{provider.name}</span>
                                        <span className="text-[11px] font-medium text-ink-muted">Proveedor - {provider.type}</span>
                                    </div>
                                    <Hint label="Quitar">
                                        <button
                                            onClick={() => handleRemove(provider.id)}
                                            className="text-ink-muted hover:text-destructive transition-colors shrink-0"
                                            aria-label={`Quitar ${provider.name}`}
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                    </Hint>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Botones Footer */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8 [&>button]:w-full sm:[&>button]:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg h-11 px-8 border-border text-ink-muted font-bold hover:bg-muted hover:text-ink transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => onSave ? onSave() : onOpenChange(false)}
                        className="rounded-lg h-11 px-8 bg-brand hover:bg-brand-dark text-white font-semibold gap-2 shadow-sm transition-colors active:scale-95"
                    >
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
