import SuccessModal from "@/shared/components/SuccessModal";

export type ProviderSuccessMode = "create" | "edit" | "interview" | "finca" | "finca-edit" | "agronomico" | "agronomico-edit" | "certificado" | "certificado-edit";

interface ProviderSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: ProviderSuccessMode;
}

const COPY: Record<ProviderSuccessMode, { title: string; description: string }> = {
    create: { title: "Proveedor Registrado", description: "Se podrá ver los proveedores en la lista" },
    edit: { title: "Cambios Guardados", description: "Los datos del proveedor se actualizaron correctamente." },
    interview: { title: "Entrevista Registrada", description: "La entrevista se agregó correctamente al proveedor." },
    finca: { title: "Finca Registrada", description: "La finca se agregó correctamente al proveedor." },
    "finca-edit": { title: "Cambios Guardados", description: "Los datos de la finca se actualizaron correctamente." },
    agronomico: { title: "Datos Agronómicos Guardados", description: "Los datos agronómicos se agregaron correctamente al proveedor." },
    "agronomico-edit": { title: "Cambios Guardados", description: "Los datos agronómicos del proveedor se actualizaron correctamente." },
    certificado: { title: "Certificado Registrado", description: "El certificado se agregó correctamente al proveedor." },
    "certificado-edit": { title: "Cambios Guardados", description: "El certificado del proveedor se actualizó correctamente." },
};

export default function ProviderSuccessModal({ open, onOpenChange, mode = "create" }: ProviderSuccessModalProps) {
    const { title, description } = COPY[mode];
    return <SuccessModal open={open} onOpenChange={onOpenChange} title={title} description={description} />;
}
