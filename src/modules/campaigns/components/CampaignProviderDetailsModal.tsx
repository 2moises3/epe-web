import { useState } from "react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { InfoField, InfoSection, StatTile, LocationTrail } from "@/shared/components/InfoField";
import { MapPin, Sprout, Leaf, FlaskConical, UserCheck, Ruler, Droplets, LandPlot, Tractor } from "lucide-react";
import SegmentedTabs, { type SegmentedTabItem } from "@/shared/components/SegmentedTabs";
import { TABLE_HEAD_BG } from "@/shared/components/DataTableRow";

interface CampaignProviderDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    providerName?: string;
    providerType?: string;
}

const TABS: SegmentedTabItem[] = [
    { id: "examen", label: "Examen", icon: FlaskConical },
    { id: "entrevista", label: "Entrevista", icon: UserCheck },
];

export default function CampaignProviderDetailsModal({
    open,
    onOpenChange,
    providerName = "Juan Pérez",
    providerType = "Productor"
}: CampaignProviderDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<"examen" | "entrevista">("examen");

    useResetOnToggle(open, () => {
        setActiveTab("examen");
    });

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Tractor size={22} strokeWidth={2} />}
            title={`${providerType} - ${providerName}`}
            description="Cantidad: 1000 t"
            className="sm:max-w-225"
        >
            <SegmentedTabs
                tabs={TABS}
                value={activeTab}
                onChange={(val) => setActiveTab(val as "examen" | "entrevista")}
                className="mb-5"
            />

            {activeTab === "examen" ? (
                <div className="rounded-xl border border-border overflow-hidden overflow-x-auto min-h-100 bg-white">
                    <Table className="min-w-150">
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="text-ink font-semibold h-14 px-6">Nombre Análisis</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Resultado</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Fecha</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Origen</TableHead>
                                <TableHead className="text-ink font-semibold h-14 pr-6">Detalles</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="border-b border-border hover:bg-surface-page/60">
                                    <TableCell className="text-ink-body font-medium h-16 px-6">CADMIO</TableCell>
                                    <TableCell className="text-ink-body font-medium">Negativo</TableCell>
                                    <TableCell className="text-ink-body font-medium">28/05/20</TableCell>
                                    <TableCell className="text-ink-body font-medium">Trujillo</TableCell>
                                    <TableCell className="text-ink-muted font-medium text-xs pr-6">ACETAMIPRID 0.15 mg/kg, TRAZAS: CLORFENAPIR</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="bg-surface-page/40 rounded-xl p-4 sm:p-6 min-h-100 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        {/* Columna Izquierda */}
                        <div className="flex flex-col gap-6">
                            <InfoSection icon={Sprout} title="Cultivo">
                                <div className="grid grid-cols-2 gap-3">
                                    <StatTile icon={Ruler} label="Densidad Plantación" value="0.00" />
                                    <StatTile icon={Ruler} label="Distanciamiento" value="0.00" hint="m entre plantas" />
                                    <StatTile icon={Droplets} label="Frecuencia de Riego" value="40" hint="veces por día" />
                                    <StatTile icon={LandPlot} label="HA del Cultivo" value="0 ha" />
                                </div>
                                <StatTile icon={LandPlot} label="HA Total Finca" value="0 ha" />
                            </InfoSection>

                            <InfoSection icon={Leaf} title="Fertilización">
                                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-white px-4 py-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface" style={{ color: "var(--brand-gradient-mid)" }}>
                                        <Leaf size={18} strokeWidth={2.5} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-[13.5px] font-bold text-ink">Fertilizante X</p>
                                        <p className="text-[12px] text-ink-muted">3 aplicaciones al año</p>
                                    </div>
                                </div>
                            </InfoSection>
                        </div>

                        {/* Columna Derecha */}
                        <InfoSection icon={MapPin} title="Ubicación">
                            <LocationTrail parts={["Piura", "Sullana", "Marcavelica"]} />

                            <div className="w-full h-40 sm:h-48 bg-brand/5 border border-brand/20 rounded-xl flex flex-col items-center justify-center text-brand relative overflow-hidden" style={{
                                backgroundImage: 'linear-gradient(to right, rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 197, 94, 0.1) 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}>
                                <MapPin size={28} strokeWidth={2.5} className="mb-2" />
                                <span className="text-xs font-bold">Mapa de ubicación</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <InfoField label="Latitud" value="4" />
                                <InfoField label="Longitud" value="5" />
                            </div>
                        </InfoSection>
                    </div>
                </div>
            )}
        </AppModal>
    );
}
