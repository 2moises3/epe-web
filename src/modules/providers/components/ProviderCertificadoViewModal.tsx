import { ShieldCheck, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import FileDropzone from "@/shared/components/FileDropzone";
import { InfoField } from "@/shared/components/InfoField";
import { Button } from "@/shared/components/ui/button";
import { displayCertificadoDate, type CertificadoLocal } from "@/modules/providers/providerCertificado.utils";

interface ProviderCertificadoViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Nombre del proveedor dueño del certificado, se muestra bajo el título */
    providerName: string;
    certificate: CertificadoLocal | null;
}

/** Detalle de solo lectura de un certificado; el documento se revisa con la vista previa del propio campo de archivo. */
export default function ProviderCertificadoViewModal({ open, onOpenChange, providerName, certificate }: ProviderCertificadoViewModalProps) {
    if (!certificate) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<ShieldCheck size={22} strokeWidth={2} />}
            title="Detalle del certificado"
            description={providerName}
            className="sm:max-w-160"
            footer={
                <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                    <X size={20} strokeWidth={2.5} /> Cerrar
                </Button>
            }
        >
            <div className="flex flex-col gap-6">
                <InfoField label="Nombre del certificado" value={certificate.nombre} />
                <InfoField label="Fecha de revisión SENASA" value={displayCertificadoDate(certificate.fechaRevisionSenasa)} />
                <FileDropzone label="Documento del certificado" hasColon={false} file={certificate.documento} readOnly onChange={() => undefined} />
            </div>
        </AppModal>
    );
}
