import { useId, useState } from "react";
import { ChevronRight, FileText, Leaf, ShieldCheck, TreePine } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import StatusBadge from "@/shared/components/StatusBadge";
import type { CampaignCertification } from "@/modules/campaigns/campaignDetails.data";
import { getCertificationStatus } from "@/modules/campaigns/campaignDetails.utils";

const ICONS = { leaf: Leaf, file: FileText, tree: TreePine, shield: ShieldCheck };

export default function CampaignCertificationsList({ certifications }: { certifications: CampaignCertification[] }) {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const id = useId();
    const totalFiles = certifications.reduce((sum, cert) => sum + cert.files.length, 0);
    const allExpanded = certifications.length > 0 && expandedIds.length === certifications.length;

    return (
        <Card className="campaign-panel campaign-certifications">
            <div className="campaign-section-heading">
                <ShieldCheck size={25} className="campaign-section-icon" aria-hidden="true" />
                <div className="min-w-0 flex-1"><h2>Certificaciones</h2></div>
                <span className="campaign-cert-count">{certifications.length} certificaciones · {totalFiles} archivos</span>
                <Button variant="outline" size="icon-sm" className="campaign-expand-all" disabled={!certifications.length}
                    aria-label={allExpanded ? "Contraer todas las certificaciones" : "Expandir todas las certificaciones"}
                    aria-expanded={allExpanded} aria-controls={id}
                    onClick={() => setExpandedIds(allExpanded ? [] : certifications.map((cert) => cert.id))}>
                    <ChevronRight className={allExpanded ? "rotate-90" : ""} />
                </Button>
            </div>
            <div id={id} className="campaign-certification-list">
                {!certifications.length && <p className="campaign-empty">Esta campaña todavía no tiene certificaciones registradas.</p>}
                {certifications.map((cert) => {
                    const isExpanded = expandedIds.includes(cert.id);
                    const Icon = ICONS[cert.icon];
                    const panelId = `${id}-${cert.id}`;
                    return (
                        <div key={cert.id} className="campaign-certification">
                            <button type="button" className="campaign-certification-toggle"
                                onClick={() => setExpandedIds((current) => isExpanded ? current.filter((value) => value !== cert.id) : [...current, cert.id])}
                                aria-expanded={isExpanded} aria-controls={panelId}>
                                <span className="campaign-icon-circle"><Icon size={20} aria-hidden="true" /></span>
                                <span className="campaign-cert-info"><strong>{cert.name}</strong><span>{cert.files.length} archivos · vence {cert.expires}</span></span>
                                <StatusBadge status={getCertificationStatus(cert.expires)} />
                                <ChevronRight size={15} className={isExpanded ? "rotate-90" : ""} aria-hidden="true" />
                            </button>
                            <div id={panelId} className="campaign-cert-files" hidden={!isExpanded}>
                                <ul>{cert.files.map((file) => <li key={file}><FileText size={14} aria-hidden="true" /><span>{file}</span></li>)}</ul>
                                <p>Documentación de muestra</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
