import AppModal from "@/shared/components/AppModal";
import { X, Contact } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { InfoField } from "@/shared/components/InfoField";

interface ClientViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: number | null;
}

export default function ClientViewModal({ open, onOpenChange, clientId }: ClientViewModalProps) {
    if (!clientId) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Contact size={22} strokeWidth={2} />}
            title="Detalles del Cliente"
            description="Visualizando la información registrada del cliente."
            className="sm:max-w-162.5"
            footer={
                <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cerrar
                    </Button>
            }
        >
            <div className="grid grid-cols-2 gap-5 sm:gap-6">
                <InfoField label="Nombres Completos" value="Nombre de Ejemplo" className="col-span-2" />
                <InfoField label="Empresa" value="Empresa Ejemplo S.A.C" />
                <InfoField label="Teléfono" value="+51 987 654 321" />
                <InfoField label="RUC" value="20123456789" />
                <InfoField label="Correo Corporativo" value="contacto@empresa.com" />
                <InfoField label="Ubicación" value="Lima, Perú" />
                <InfoField label="Tipo de Cliente" value="Mayorista" />
            </div>
        </AppModal>
    );
}
