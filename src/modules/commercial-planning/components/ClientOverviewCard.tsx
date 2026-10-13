import type { ReactNode } from "react";
import { Building2, Fingerprint, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

const CLIENT_TYPE_LABEL: Record<string, string> = { exportador: "Exportador", industria: "Industria" };

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

/** Tarjeta principal del detalle: quién es el cliente y cómo contactarlo. */
export default function ClientOverviewCard({ client }: { client: ClienteNegocio }) {
    const initial = client.nombreEmpresa.trim().charAt(0).toUpperCase() || "C";

    return (
        <Card className="relative min-h-60 gap-0 border-0 bg-linear-to-br from-card from-40% to-brand-surface/50 p-0 ring-1 ring-border">
            <Building2 aria-hidden="true" strokeWidth={1} className="pointer-events-none absolute -bottom-10 -right-6 size-60 rotate-12 text-brand/10" />

            <div className="relative flex flex-col gap-6 p-6 sm:p-7">
                <div className="flex items-center gap-4">
                    <span
                        aria-hidden="true"
                        className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-[26px] font-extrabold text-white"
                        style={BRAND_ACTIVE_SURFACE}
                    >
                        {initial}
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Cliente · {CLIENT_TYPE_LABEL[client.tipoCliente] ?? client.tipoCliente}</p>
                        <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-ink wrap-anywhere sm:text-[28px]">{client.nombreEmpresa}</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand">
                                <Fingerprint size={12} strokeWidth={2.5} /> RUC {client.ruc}
                            </span>
                            {client.ubicacion && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand">
                                    <MapPin size={12} strokeWidth={2.5} /> {client.ubicacion}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2">
                    <DetailItem icon={<UserRound size={16} strokeWidth={2.2} />} label="Nombre de contacto">{client.nombreContacto || "—"}</DetailItem>
                    <DetailItem icon={<Phone size={16} strokeWidth={2.2} />} label="Teléfono">{client.telefono || "—"}</DetailItem>
                    <DetailItem icon={<Mail size={16} strokeWidth={2.2} />} label="Correo corporativo">
                        {client.correoCorporativo ? (
                            <a href={`mailto:${client.correoCorporativo}`} className="text-brand hover:underline">{client.correoCorporativo}</a>
                        ) : "—"}
                    </DetailItem>
                    <DetailItem icon={<MapPin size={16} strokeWidth={2.2} />} label="Ubicación">{client.ubicacion || "—"}</DetailItem>
                </dl>
            </div>
        </Card>
    );
}
