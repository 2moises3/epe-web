import AppModal from "@/shared/components/AppModal";
import { X, Contact } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { InfoField } from "@/shared/components/InfoField";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

interface ClientViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: ClienteNegocio | null;
}

export default function ClientViewModal({ open, onOpenChange, client }: ClientViewModalProps) {
    if (!client) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Contact size={22} strokeWidth={2} />}
            title="Detalles del cliente"
            description="Información registrada en el sistema."
            className="sm:max-w-162.5"
            footer={<Button variant="outline" size="xl" onClick={() => onOpenChange(false)}><X size={20} strokeWidth={2.5} /> Cerrar</Button>}
        >
            <div className="grid grid-cols-2 gap-5 sm:gap-6">
                <InfoField label="Empresa" value={client.nombreEmpresa} className="col-span-2" />
                <InfoField label="Nombre de contacto" value={client.nombreContacto} />
                <InfoField label="Teléfono" value={client.telefono} />
                <InfoField label="RUC" value={client.ruc} />
                <InfoField label="Correo corporativo" value={client.correoCorporativo} />
                <InfoField label="Ubicación" value={client.ubicacion} />
                <InfoField label="Tipo de cliente" value={client.tipoCliente === "exportador" ? "Exportador" : "Industria"} />
            </div>
        </AppModal>
    );
}
