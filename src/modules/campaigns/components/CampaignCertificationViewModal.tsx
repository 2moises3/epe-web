import { ShieldCheck, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import FileDropzone from "@/shared/components/FileDropzone";
import { InfoField } from "@/shared/components/InfoField";
import ModalSection from "@/shared/components/ModalSection";
import RemovableChip from "@/shared/components/RemovableChip";
import StatusBadge from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/button";
import {
    displayCertDate,
    getEstadoPago,
    getKilosAmpliados,
    getKilosTotales,
    getMonedaSymbol,
    getSaldoPendiente,
    getTotalPagado,
    getTramiteLabel,
    getVigenciaAutomatica,
    type CertificadoCampanaLocal,
} from "@/modules/campaigns/campaignCertificate.utils";

const kilos = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 3 });
const money = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface CampaignCertificationViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    certificate: CertificadoCampanaLocal | null;
}

/** Detalle de solo lectura de una certificación: todo lo que la tabla resume, más sus movimientos. */
export default function CampaignCertificationViewModal({ open, onOpenChange, certificate }: CampaignCertificationViewModalProps) {
    if (!certificate) return null;

    const symbol = getMonedaSymbol(certificate.moneda);
    const hasPeriod = certificate.validoDesde && certificate.validoHasta;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<ShieldCheck size={22} strokeWidth={2} />}
            title="Detalle de la Certificación"
            description={certificate.nombre}
            className="sm:max-w-190"
            footer={
                <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                    <X size={20} strokeWidth={2.5} /> Cerrar
                </Button>
            }
        >
            <div className="flex flex-col gap-6">
                <ModalSection title="Datos de la certificación">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InfoField label="Tipo de certificación" value={certificate.tipo} />
                        <InfoField label="Nombre del certificado" value={certificate.nombre} />
                        <InfoField label="Organismo emisor" value={certificate.organismoEmisor} />
                        <InfoField
                            label="Periodo de vigencia"
                            value={hasPeriod ? `${displayCertDate(certificate.validoDesde)} – ${displayCertDate(certificate.validoHasta)}` : "Sin periodo definido"}
                        />
                        <InfoField label="Estado de vigencia" value={<StatusBadge status={getVigenciaAutomatica(certificate.validoDesde, certificate.validoHasta)} />} />
                        <InfoField label="Estado del trámite" value={<StatusBadge status={getTramiteLabel(certificate.estadoTramite)} />} />
                    </div>
                </ModalSection>

                <ModalSection title="Costo y kilos">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InfoField label="Costo" value={`${symbol} ${money.format(certificate.costo)}`} />
                        <InfoField label="Pagado" value={`${symbol} ${money.format(getTotalPagado(certificate))}`} />
                        <InfoField label="Estado del pago" value={<StatusBadge status={getEstadoPago(certificate)} />} />
                        <InfoField label="Kilos iniciales" value={`${kilos.format(certificate.kilosIniciales)} kg`} />
                        <InfoField label="Ampliaciones" value={`${kilos.format(getKilosAmpliados(certificate))} kg`} />
                        <InfoField label="Total actual" value={`${kilos.format(getKilosTotales(certificate))} kg`} />
                    </div>

                    {(certificate.ampliaciones.length > 0 || certificate.pagos.length > 0) && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <MovementList
                                title="Historial de ampliaciones"
                                empty="Sin ampliaciones"
                                items={certificate.ampliaciones.map((item) => ({
                                    id: item.id,
                                    main: `+ ${kilos.format(item.kilos)} kg`,
                                    meta: [displayCertDate(item.fecha), item.referencia].filter(Boolean).join(" · "),
                                }))}
                            />
                            <MovementList
                                title="Historial de pagos"
                                empty={`Saldo pendiente: ${symbol} ${money.format(getSaldoPendiente(certificate))}`}
                                items={certificate.pagos.map((item) => ({
                                    id: item.id,
                                    main: `${symbol} ${money.format(item.monto)}`,
                                    meta: [displayCertDate(item.fecha), item.referencia].filter(Boolean).join(" · "),
                                }))}
                            />
                        </div>
                    )}
                </ModalSection>

                <ModalSection title="Cobertura y documentos">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Productores cubiertos</p>
                            {certificate.productores.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {certificate.productores.map((producer) => (
                                        <RemovableChip key={producer.id} dot label={producer.nombre} className="max-w-52" />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[13px] text-ink-muted">Sin productores asignados.</p>
                            )}
                        </div>

                        {certificate.observaciones && <InfoField label="Observaciones" value={certificate.observaciones} />}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FileDropzone label="Documento del certificado" hasColon={false} variant="horizontal" file={certificate.documento} readOnly onChange={() => undefined} />
                            <FileDropzone label="Documento de cotización" hasColon={false} variant="horizontal" file={certificate.cotizacion} readOnly onChange={() => undefined} />
                        </div>
                    </div>
                </ModalSection>
            </div>
        </AppModal>
    );
}

function MovementList({ title, items, empty }: { title: string; items: { id: number; main: string; meta: string }[]; empty: string }) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{title}</p>
            {items.length === 0 ? (
                <p className="text-[13px] text-ink-muted">{empty}</p>
            ) : (
                <ul className="flex max-h-32 flex-col gap-1.5 overflow-y-auto">
                    {items.map((item) => (
                        <li key={item.id} className="flex items-baseline justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2">
                            <span className="text-[13px] font-bold tabular-nums text-ink">{item.main}</span>
                            <span className="truncate text-[11.5px] text-ink-muted">{item.meta}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
