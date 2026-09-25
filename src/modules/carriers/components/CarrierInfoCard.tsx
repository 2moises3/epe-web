import { Building2, Phone, Mail, FileText, Truck, UserRound } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { Carrier } from "@/modules/carriers/carriers.data";

interface CarrierInfoCardProps {
    carrier: Carrier;
    vehicleCount: number;
    driverCount: number;
}

export default function CarrierInfoCard({ carrier, vehicleCount, driverCount }: CarrierInfoCardProps) {
    const details = [
        { label: "RUC", value: carrier.ruc, icon: FileText },
        { label: "Número", value: carrier.numero, icon: Phone },
        { label: "Correo", value: carrier.correo, icon: Mail },
    ];

    return (
        <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)] overflow-hidden">
            <CardContent className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-8">
                <div className="flex min-w-0 items-center gap-4 lg:w-[30%]">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                        <Building2 size={28} strokeWidth={2} />
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Empresa de transporte</p>
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

                <span aria-hidden className="hidden h-14 w-px bg-border lg:block" />

                <dl className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.8fr)]">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface-page/60 p-3">
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
