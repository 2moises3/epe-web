import AppModal from "@/shared/components/AppModal";
import { X, CalendarPlus, ClipboardList } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";

interface ProviderInterviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ProviderInterviewModal({ open, onOpenChange, onSuccess }: ProviderInterviewModalProps) {
    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<ClipboardList size={22} strokeWidth={2} />}
            title="Fundo Los Olivos"
            description="Piura · 45 ha"
            className="sm:max-w-95"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cerrar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        <CalendarPlus size={20} strokeWidth={2.5} /> Agregar entrevista
                    </Button>
                </>
            }
        >
            {/* Tags */}
            <div className="flex gap-2.5 mb-5">
                <span className="bg-brand-surface border border-brand-border text-brand text-[11.5px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    Mango Kent
                </span>
                <span className="bg-brand-surface border border-brand-border text-brand text-[11.5px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    Mango Tommy
                </span>
            </div>

            <Separator className="my-5" />

            {/* Details */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-[11.5px] font-bold text-ink-muted">CONTACTO</span>
                    <span className="text-[13.5px] font-semibold text-ink">Carlos Mendoza</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11.5px] font-bold text-ink-muted">TELÉFONO</span>
                    <span className="text-[13.5px] font-semibold text-ink">+51 973 441 220</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11.5px] font-bold text-ink-muted">UBICACIÓN</span>
                    <span className="text-[13.5px] font-semibold text-ink">Piura</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11.5px] font-bold text-ink-muted">HECTÁREAS</span>
                    <span className="text-[13.5px] font-semibold text-ink">45 ha</span>
                </div>
            </div>
        </AppModal>
    );
}
