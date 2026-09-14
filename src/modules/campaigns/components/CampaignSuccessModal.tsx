import { Smile } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface CampaignSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "create" | "edit" | "provider" | "exam" | "interview" | "client" | "certification" | "payment" | "receipt" | "advance";
}

export default function CampaignSuccessModal({ open, onOpenChange, mode = "create" }: CampaignSuccessModalProps) {
    const getTitle = () => {
        if (mode === "edit") return "Cambios Guardados";
        if (mode === "provider") return "Proveedor Añadido a Campaña";
        if (mode === "exam") return "Examen Médico Registrado";
        if (mode === "interview") return "Informe Registrado";
        if (mode === "client") return "Clientes Registrados";
        if (mode === "certification") return "Certificación Registrada";
        if (mode === "payment") return "Pago Registrado";
        if (mode === "receipt") return "Boleta Adjuntada";
        if (mode === "advance") return "Pago Completado";
        return "Campaña Registrada";
    };

    const getDescription = () => {
        if (mode === "edit") return "Se actualizó correctamente";
        if (mode === "provider") return "Se ha añadido el proveedor exitosamente a la campaña";
        if (mode === "exam") return "Se ha registrado el examen médico del proveedor exitosamente";
        if (mode === "interview") return "Se visualizara informe";
        if (mode === "client") return "Se podra ver los clientes en visualizar";
        if (mode === "certification") return "Se ha registrado la certificación del proveedor exitosamente";
        if (mode === "payment") return "Se ha registrado el pago al transportista exitosamente";
        if (mode === "receipt") return "Se ha adjuntado la boleta de pago exitosamente";
        if (mode === "advance") return "Se ha cerrado el saldo pendiente del adelanto exitosamente";
        return "Se podra ver las campañas registradas en el inicio";
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[400px] p-5 sm:p-8 rounded-2xl bg-white border-none shadow-2xl gap-0 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
                <div className="w-24 h-24 rounded-full bg-brand-surface flex items-center justify-center text-brand mb-6 border border-brand-border">
                    <Smile size={48} strokeWidth={2} />
                </div>

                <DialogTitle className="text-[22px] font-bold text-ink mb-3">
                    {getTitle()}
                </DialogTitle>
                
                <DialogDescription className="text-[14px] text-ink-muted mb-8 font-medium">
                    {getDescription()}
                </DialogDescription>

                <Button 
                    onClick={() => onOpenChange(false)}
                    className="w-32 rounded-lg h-11 bg-brand hover:bg-brand-dark text-white font-semibold shadow-sm transition-colors active:scale-95"
                >
                    Aceptar
                </Button>

            </DialogContent>
        </Dialog>
    );
}
