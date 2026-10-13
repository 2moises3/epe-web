import type { ReactNode } from "react";
import { ExternalLink, Fingerprint, Mail, MapPin, Phone, Sprout, Tag } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";

interface ProviderOverviewCardProps {
    provider: Proveedor;
    /** Etiqueta sobre el nombre; por defecto "Proveedor agrícola" (en campaña: Productor o Acopiador) */
    eyebrow?: string;
}

/** Solo se enlaza a documentos http(s): cualquier otro esquema (javascript:, data:) se descarta */
function safeUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

function DetailItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand">{icon}</span>
            <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{label}</dt>
                <dd className="text-[13.5px] font-semibold text-ink break-words">{children}</dd>
            </div>
        </div>
    );
}

/** Tarjeta principal del detalle: quién es el proveedor y los datos con los que se registró. */
export default function ProviderOverviewCard({ provider, eyebrow = "Proveedor agrícola" }: ProviderOverviewCardProps) {
    const fullName = `${provider.nombres} ${provider.apellido}`;
    const initials = `${provider.nombres[0] ?? ""}${provider.apellido[0] ?? ""}`.toUpperCase();
    const documentUrl = safeUrl(provider.identidadDocUrl);

    return (
        <Card className="relative min-h-60 gap-0 border-0 bg-linear-to-br from-card from-40% to-brand-surface/50 p-0 ring-1 ring-border">
            <Sprout aria-hidden="true" strokeWidth={1} className="pointer-events-none absolute -bottom-10 -right-6 size-60 rotate-12 text-brand/10" />

            <div className="relative flex flex-col gap-6 p-6 sm:p-7">
                <div className="flex items-center gap-4">
                    <span
                        aria-hidden="true"
                        className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-[22px] font-extrabold text-white"
                        style={BRAND_ACTIVE_SURFACE}
                    >
                        {initials}
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">{eyebrow}</p>
                        <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-ink wrap-anywhere sm:text-[28px]">{fullName}</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand">
                                <Fingerprint size={12} strokeWidth={2.5} /> {provider.tipoDocumento} {provider.nmrDocumento}
                            </span>
                            {provider.zona && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand">
                                    <MapPin size={12} strokeWidth={2.5} /> {provider.zona}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2">
                    <DetailItem icon={<Phone size={16} strokeWidth={2.2} />} label="Teléfono">{provider.telefono ? String(provider.telefono) : "—"}</DetailItem>
                    <DetailItem icon={<Mail size={16} strokeWidth={2.2} />} label="Correo">{provider.email || "—"}</DetailItem>
                    <DetailItem icon={<Tag size={16} strokeWidth={2.2} />} label="Código lugar de producción">
                        {provider.codigoLugarProduccion ? String(provider.codigoLugarProduccion) : "—"}
                    </DetailItem>
                    <DetailItem icon={<Fingerprint size={16} strokeWidth={2.2} />} label="Documento de identidad">
                        {documentUrl ? (
                            <a href={documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                                Abrir documento <ExternalLink size={12} aria-hidden="true" />
                            </a>
                        ) : (
                            <span className="text-ink-muted">No disponible</span>
                        )}
                    </DetailItem>
                </dl>

            </div>
        </Card>
    );
}
