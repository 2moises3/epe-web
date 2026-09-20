import SuccessModal from "@/shared/components/SuccessModal";

type ProviderSuccessMode = "create" | "edit" | "interview";

interface ProviderSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: ProviderSuccessMode;
}

const COPY: Record<ProviderSuccessMode, { title: string; description: string }> = {
    create: { title: "Proveedor Registrado", description: "Se podrá ver los proveedores en la lista" },
    edit: { title: "Cambios Guardados", description: "Los datos del proveedor se actualizaron correctamente." },
    interview: { title: "Entrevista Registrada", description: "La entrevista se agregó correctamente al proveedor." },
};

export default function ProviderSuccessModal({ open, onOpenChange, mode = "create" }: ProviderSuccessModalProps) {
    const { title, description } = COPY[mode];
    return <SuccessModal open={open} onOpenChange={onOpenChange} title={title} description={description} />;
}
