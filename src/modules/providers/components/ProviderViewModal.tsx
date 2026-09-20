import AppModal from "@/shared/components/AppModal";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ProviderViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    providerId: number | null;
}

export default function ProviderViewModal({ open, onOpenChange, providerId }: ProviderViewModalProps) {
    // Mock data based on the provided design
    const mockProvider = {
        name: "Fundo Los Olivos",
        location: "Piura",
        size: "45 ha",
        fruits: [
            { name: "Mango Kent", color: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
            { name: "Mango Tommy", color: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" }
        ],
        details: [
            { label: "CONTACTO", value: "Carlos Mendoza" },
            { label: "TELÉFONO", value: "+51 973 441 220" },
            { label: "UBICACIÓN", value: "Piura" },
            { label: "HECTÁREAS", value: "45 ha" }
        ]
    };

    if (!providerId) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title={mockProvider.name}
            description={`${mockProvider.location} · ${mockProvider.size}`}
            className="sm:max-w-112.5"
            footer={
                <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cerrar
                    </Button>
            }
        >
            {/* Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
                {mockProvider.fruits.map((fruit, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${fruit.bg} ${fruit.border} ${fruit.text} text-[12px] font-bold`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${fruit.color}`}></div>
                        {fruit.name}
                    </div>
                ))}
            </div>

            {/* Details List */}
            <div className="flex flex-col">
                {mockProvider.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider">{detail.label}</span>
                        <span className="text-[14px] font-semibold text-ink">{detail.value}</span>
                    </div>
                ))}
            </div>
        </AppModal>
    );
}
