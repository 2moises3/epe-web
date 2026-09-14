import { useState } from "react";
import { X, UserSquare, Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import Hint from "@/shared/components/Hint";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface CampaignLinkClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignLinkClientModal({ open, onOpenChange, onSave }: CampaignLinkClientModalProps) {
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");

    const [addedClients, setAddedClients] = useState([
        { id: 1, contact: "Pepe Alonso", company: "Sutrimex" },
        { id: 2, contact: "Pepe Alonso", company: "Fixgrom" }
    ]);

    const handleRemove = (id: number) => {
        setAddedClients(addedClients.filter(c => c.id !== id));
    };

    const handleAdd = () => {
        if (!selectedClient) return;

        const company = selectedClient === "sutrimex" ? "Sutrimex" : "Fixgrom";
        const newClient = {
            id: Date.now(),
            contact: "Pepe Alonso",
            company
        };

        setAddedClients([...addedClients, newClient]);
        setSelectedClient("");
        setCantidad("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[550px] md:max-w-xl p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-xl font-bold text-ink">
                        Registrar Clientes
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    {/* Cliente + Cantidad */}
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Seleccionar Cliente:</label>
                            <Select value={selectedClient} onValueChange={(val) => setSelectedClient(val || "")}>
                                <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="sutrimex" className="rounded-lg">Sutrimex</SelectItem>
                                    <SelectItem value="fixgrom" className="rounded-lg">Fixgrom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[140px] flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Cantidad kg:</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                        </div>
                    </div>

                    {/* Adjuntar + Agregar */}
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-lg h-11 border-dashed border-brand-border text-ink-body hover:border-brand hover:text-brand hover:bg-brand-surface font-semibold px-5 flex gap-2 transition-colors active:scale-95"
                        >
                            <Upload size={18} />
                            Adjuntar requerimientos
                        </Button>

                        <Button
                            onClick={handleAdd}
                            disabled={!selectedClient}
                            className="h-11 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95 shrink-0"
                        >
                            Agregar
                        </Button>
                    </div>

                    {/* Clientes Agregados */}
                    <div className="flex flex-col gap-3 mt-2">
                        <label className="text-[13px] font-semibold text-ink">Clientes agregados:</label>
                        <div className="flex flex-wrap gap-3">
                            {addedClients.map((client) => (
                                <div key={client.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white min-w-[200px]">
                                    <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                        <UserSquare size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-[13px] font-bold text-ink leading-tight mb-0.5">{client.contact}</span>
                                        <span className="text-[11px] font-medium text-ink-muted">Cliente - {client.company}</span>
                                    </div>
                                    <Hint label="Quitar">
                                        <button
                                            onClick={() => handleRemove(client.id)}
                                            className="text-ink-muted hover:text-destructive transition-colors shrink-0"
                                            aria-label={`Quitar ${client.contact}`}
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
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 [&>button]:w-full sm:[&>button]:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg h-11 px-6 border-border text-ink-body font-bold hover:bg-muted transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => onSave ? onSave() : onOpenChange(false)}
                        className="rounded-lg h-11 px-8 bg-brand hover:bg-brand-dark text-white font-bold shadow-sm transition-colors active:scale-95"
                    >
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
