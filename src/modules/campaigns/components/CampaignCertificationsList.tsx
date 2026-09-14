import { useState } from "react";
import { ChevronDown, Download, FileText, Shield } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import StatusBadge from "@/shared/components/StatusBadge";
import Hint from "@/shared/components/Hint";
import { cn } from "@/lib/utils";

interface CertificationEntry {
    id: number;
    name: string;
    files: string[];
    vence: string;
    estado: "Vigente" | "Por Vencer" | "Vencida";
}

/** Datos de muestra mientras el módulo no consume el backend. */
const CERTIFICATIONS: CertificationEntry[] = [
    { id: 1, name: "GlobalG.A.P.", files: ["certificado_globalgap.pdf", "informe_auditoria.pdf", "anexo_tecnico.pdf"], vence: "31/12/2026", estado: "Vigente" },
    { id: 2, name: "SENASA Export", files: ["certificado_senasa.pdf", "registro_exportador.pdf"], vence: "15/06/2026", estado: "Vigente" },
    { id: 3, name: "Rainforest Alliance", files: ["certificado_ra.pdf", "informe_social.pdf", "informe_ambiental.pdf", "plan_mejora.pdf"], vence: "20/09/2025", estado: "Por Vencer" },
    { id: 4, name: "BRC Food Safety", files: ["certificado_brc.pdf", "auditoria_brc.pdf", "plan_haccp.pdf"], vence: "01/03/2025", estado: "Vencida" },
];

/** Listado de certificaciones de la campaña; cada fila se despliega para ver sus archivos. */
export default function CampaignCertificationsList() {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const totalFiles = CERTIFICATIONS.reduce((sum, cert) => sum + cert.files.length, 0);

    return (
        <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
            <CardContent className="p-4 sm:p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3 pb-3">
                    <div>
                        <h3 className="text-[17px] font-bold text-ink">Certificaciones</h3>
                        <p className="text-[13px] text-ink-muted font-medium mt-0.5">
                            {CERTIFICATIONS.length} certificaciones · {totalFiles} archivos
                        </p>
                    </div>
                    <Hint label="Descargar todo">
                        <button
                            type="button"
                            aria-label="Descargar todo"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand-surface hover:text-brand active:scale-95"
                        >
                            <Download size={18} strokeWidth={2.5} />
                        </button>
                    </Hint>
                </div>

                <div className="flex flex-col divide-y divide-border -mx-4 sm:-mx-6">
                    {CERTIFICATIONS.map((cert) => {
                        const isExpanded = expandedId === cert.id;
                        return (
                            <div key={cert.id} className="px-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : cert.id)}
                                    aria-expanded={isExpanded}
                                    className="flex w-full items-center gap-3 py-3.5 text-left"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand">
                                        <Shield size={18} strokeWidth={2} />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-bold text-ink truncate">{cert.name}</p>
                                        <p className="text-[12px] text-ink-muted font-medium truncate">{cert.files.length} archivos · vence {cert.vence}</p>
                                    </div>
                                    <StatusBadge status={cert.estado} />
                                    <ChevronDown
                                        size={16}
                                        strokeWidth={2.5}
                                        className={cn("shrink-0 text-ink-muted transition-transform duration-200", isExpanded && "rotate-180")}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="flex flex-col gap-2 pb-4 pl-[52px] animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                        {cert.files.map((file) => (
                                            <div key={file} className="flex items-center gap-2 text-[12.5px] font-medium text-ink-body">
                                                <FileText size={14} strokeWidth={2} className="shrink-0 text-ink-muted" />
                                                <span className="truncate">{file}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
