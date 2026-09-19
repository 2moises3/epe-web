import SuccessModal from "@/shared/components/SuccessModal";

type ClientSuccessMode = "create" | "edit" | "contract";

interface ClientSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: ClientSuccessMode;
}

const COPY: Record<ClientSuccessMode, { title: string; description: string }> = {
    create: { title: "Cliente Registrado", description: "Se podrá ver los clientes registrados en el inicio" },
    edit: { title: "Cambios Guardados", description: "Los datos del cliente se actualizaron correctamente." },
    contract: { title: "Contrato Añadido", description: "El contrato se registró correctamente para este cliente." },
};

export default function ClientSuccessModal({ open, onOpenChange, mode = "create" }: ClientSuccessModalProps) {
    const { title, description } = COPY[mode];
    return <SuccessModal open={open} onOpenChange={onOpenChange} title={title} description={description} />;
}
