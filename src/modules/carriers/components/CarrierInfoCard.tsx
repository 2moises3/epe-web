import { Building2, Phone, Mail, FileText, Truck, UserRound, IdCard, BadgeCheck, MapPin, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { CARRIER_TIPOS, carrierLocation, type CarrierProfile } from "@/modules/carriers/carrierProfile.utils";

interface CarrierInfoCardProps {
    carrier: CarrierProfile;
    vehicleCount: number;
    driverCount: number;
}

interface Detail {
    label: string;
    value: string;
    icon: LucideIcon;
    /** Ocupa el ancho completo de la grilla (correo y ubicación son largos) */
    wide?: boolean;
}

/** Los datos que se muestran dependen del tipo: el independiente tiene documento de identidad y CGN. */
function getDetails(carrier: CarrierProfile): Detail[] {
    const notRegistered = "No registrado";
    const isPrivado = carrier.tipo === "privado";
    return [
        ...(isPrivado ? [{ label: "Documento de identidad", value: carrier.documento || notRegistered, icon: IdCard }] : []),
        { label: isPrivado ? "RUC (opcional)" : "RUC", value: carrier.ruc || notRegistered, icon: FileText },
        { label: "MTC", value: carrier.mtc || notRegistered, icon: BadgeCheck },
        ...(isPrivado ? [{ label: "CGN", value: carrier.cgn || notRegistered, icon: BadgeCheck }] : []),
        { label: "Teléfono", value: carrier.numero || notRegistered, icon: Phone },
        { label: "Correo", value: carrier.correo || notRegistered, icon: Mail, wide: true },
        { label: "Ubicación", value: carrierLocation(carrier) || notRegistered, icon: MapPin, wide: true },
    ];
}

/** Resumen del transportista en el detalle: quién es, qué tipo es y todos sus datos de registro. */
export default function CarrierInfoCard({ carrier, vehicleCount, driverCount }: CarrierInfoCardProps) {
    const tipo = CARRIER_TIPOS[carrier.tipo];
    const TipoIcon = carrier.tipo === "privado" ? UserRound : Building2;

    return (
        <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] overflow-hidden">
            <CardContent className="flex flex-col gap-5 p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                        <TipoIcon size={28} strokeWidth={2} />
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">{tipo.label}</p>
                        <h2 className="truncate text-[20px] font-bold leading-tight text-ink sm:text-[22px]">{carrier.nombre}</h2>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="brand" className="h-6 gap-1.5 px-2.5 text-[12px] font-semibold">
                                <Truck /> {vehicleCount} {vehicleCount === 1 ? "vehículo" : "vehículos"}
                            </Badge>
                            <Badge variant="brand" className="h-6 gap-1.5 px-2.5 text-[12px] font-semibold">
                                <UserRound /> {driverCount} {driverCount === 1 ? "chofer" : "choferes"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <span aria-hidden className="h-px w-full bg-border" />

                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {getDetails(carrier).map(({ label, value, icon: Icon, wide }) => (
                        <div key={label} className={`flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface-page/60 p-3 ${wide ? "sm:col-span-2" : ""}`}>
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-surface text-brand">
                                <Icon size={17} strokeWidth={2.25} />
                            </span>
                            <div className="flex min-w-0 flex-col">
                                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</dt>
                                <dd className="truncate text-[14px] font-semibold text-ink">{value}</dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
}
