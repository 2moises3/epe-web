import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FileText, Trash2, X, Save } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import FileDropzone from "@/shared/components/FileDropzone";
import { getCertificadosCampana, deleteCertificadoCampana } from "@/modules/campaigns/api/certificado-campana.api";
import type { CertificadoCampana } from "@/modules/campaigns/api/certificado-campana.mapper";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";

const CERTIFICATION_TYPES = ["Global GAP", "Fairtrade (Comercio Justo)", "Orgánica", "Rainforest Alliance"];

interface CampaignCertificationsModalProps {
    open: boolean;
    campaniaId: number | null;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function CampaignCertificationsModal({ open, campaniaId, onOpenChange, onSuccess }: CampaignCertificationsModalProps) {
    const [selectedCert, setSelectedCert] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [document, setDocument] = useState<File | null>(null);
    const [certificados, setCertificados] = useState<CertificadoCampana[]>([]);

    useEffect(() => {
        if (!open || campaniaId === null) return;
        getCertificadosCampana(campaniaId).then(setCertificados);
    }, [open, campaniaId]);

    useResetOnToggle(open, () => {
        setSelectedCert("");
        setExpiryDate("");
        setDocument(null);
    });

    const handleDeleteCertificado = (certificadoId: number) => {
        if (campaniaId === null) return;
        deleteCertificadoCampana(campaniaId, certificadoId).then(() => {
            setCertificados((prev) => prev.filter((c) => c.certificadoId !== certificadoId));
        });
    };

    const handleSave = () => {
        // En el backend no parece haber un método para crear todavía en el archivo api,
        // pero simulamos éxito como estaba en el modal original de la rama developer
        if (onSuccess) onSuccess();
        else onOpenChange(false);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<FileText size={22} strokeWidth={2} />}
            title="Registrar Certificación"
            description="Añade los documentos de certificación necesarios para esta campaña."
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSave} disabled={!selectedCert || !expiryDate || !document}>
                        <Save size={20} strokeWidth={2.5} /> Guardar
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Certificados registrados */}
                <div className="flex flex-col gap-2.5">
                    <FieldLabel>Certificados Registrados:</FieldLabel>
                    {certificados.length === 0 ? (
                        <p className="text-[13px] text-ink-muted">Esta campaña aún no tiene certificados registrados.</p>
                    ) : (
                        <ul className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                            {certificados.map((certificado) => (
                                <li
                                    key={certificado.certificadoId}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5 bg-white"
                                >
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[13.5px] font-bold text-ink truncate">{certificado.nombre}</span>
                                        <span className="text-[11.5px] text-ink-muted">
                                            Vence: {format(certificado.fechaVencimiento, "dd/MM/yyyy")} · {certificado.estado}
                                        </span>
                                        <a
                                            href={certificado.documentoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[11.5px] text-brand underline truncate hover:text-brand-dark"
                                        >
                                            Ver documento
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCertificado(certificado.certificadoId)}
                                        className="hover:bg-destructive/10 hover:text-destructive rounded-full p-1.5 transition-colors text-ink-muted shrink-0"
                                    >
                                        <Trash2 size={16} strokeWidth={2} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <Field>
                        <FieldLabel>Certificación:</FieldLabel>
                        <Select value={selectedCert} onValueChange={(value) => setSelectedCert(value ?? "")}>
                            <SelectTrigger className="w-full !h-11 rounded-lg border-border shadow-none text-ink font-medium [&>svg]:opacity-50 focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {CERTIFICATION_TYPES.map((type) => (
                                    <SelectItem key={type} value={type} className="rounded-lg">{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel>Fecha Vencimiento:</FieldLabel>
                        <Input
                            type="date"
                            value={expiryDate}
                            onChange={(event) => setExpiryDate(event.target.value)}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <FileDropzone label="Documento de certificación" hint="PDF · Máx. 10 MB" file={document} onChange={setDocument} />
                </div>
            </div>
        </AppModal>
    );
}
