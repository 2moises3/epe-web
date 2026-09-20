import SuccessModal from "@/shared/components/SuccessModal";

type CampaignSuccessMode =
    | "create"
    | "edit"
    | "provider"
    | "exam"
    | "interview"
    | "client"
    | "certification"
    | "payment"
    | "receipt"
    | "advance";

interface CampaignSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: CampaignSuccessMode;
    /** Solo cuando el resultado se ve en otra pantalla, ej. los clientes vinculados viven en el detalle */
    primaryAction?: { label: string; onClick: () => void };
}

/** Título y descripción por escenario: la campaña es el único flujo con tantos modos distintos de éxito */
const COPY: Record<CampaignSuccessMode, { title: string; description: string }> = {
    create: { title: "Campaña Registrada", description: "Se podra ver las campañas registradas en el inicio" },
    edit: { title: "Cambios Guardados", description: "Se actualizó correctamente" },
    provider: { title: "Proveedor Añadido a Campaña", description: "Se ha añadido el proveedor exitosamente a la campaña" },
    exam: { title: "Examen Médico Registrado", description: "Se ha registrado el examen médico del proveedor exitosamente" },
    interview: { title: "Informe Registrado", description: "Se visualizara informe" },
    client: { title: "Clientes vinculados", description: "Los clientes se vincularon correctamente y ya puedes consultarlos en el detalle de la campaña." },
    certification: { title: "Certificación Registrada", description: "Se ha registrado la certificación del proveedor exitosamente" },
    payment: { title: "Pago Registrado", description: "Se ha registrado el pago al transportista exitosamente" },
    receipt: { title: "Boleta Adjuntada", description: "Se ha adjuntado la boleta de pago exitosamente" },
    advance: { title: "Pago Completado", description: "Se ha cerrado el saldo pendiente del adelanto exitosamente" },
};

export default function CampaignSuccessModal({ open, onOpenChange, mode = "create", primaryAction }: CampaignSuccessModalProps) {
    const { title, description } = COPY[mode];
    return (
        <SuccessModal
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            primaryAction={primaryAction}
        />
    );
}
