import { useState } from "react";
import { LandPlot, MapPin, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardField, TableGridCardFields } from "@/shared/components/TableGridCard";
import { TableCountPill, TableToolbar } from "@/shared/components/TableToolbar";
import type { Finca } from "@/modules/providers/providerFinca.utils";

const PAGE_SIZE = 8;

const hectares = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 });
const location = (finca: Finca) => `${finca.departamento} · ${finca.provincia} · ${finca.distrito}`;
const coordinates = (finca: Finca) =>
    finca.latitud !== null && finca.longitud !== null ? `${finca.latitud}, ${finca.longitud}` : "—";

interface ProviderFincasTableProps {
    fincas: Finca[];
    /** Acción del estado vacío: abre el registro de la primera finca */
    onRegister: () => void;
}

/** Lista de fincas de un proveedor, con el mismo marco, filas y tarjetas móviles que las demás tablas. */
export default function ProviderFincasTable({ fincas, onRegister }: ProviderFincasTableProps) {
    const [page, setPage] = useState(1);

    const pageCount = Math.max(1, Math.ceil(fincas.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = fincas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <TableCard
            icon={<LandPlot size={24} strokeWidth={2.5} />}
            title="Fincas Registradas"
            description="Fincas de cultivo registradas para este proveedor."
            headerRight={
                <TableToolbar>
                    <TableCountPill icon={<LandPlot size={16} strokeWidth={2.5} className="text-brand" />} count={fincas.length} label={fincas.length === 1 ? "finca" : "fincas"} />
                </TableToolbar>
            }
            isEmpty={fincas.length === 0}
            emptyIcon={<LandPlot size={28} strokeWidth={2} />}
            emptyTitle="Aún no hay fincas"
            emptyDescription="Este proveedor todavía no tiene fincas registradas. Haz clic en 'Registrar finca' para comenzar."
            emptyAction={<Button onClick={onRegister}><Plus size={18} strokeWidth={2.5} /> Registrar finca</Button>}
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
        >
            {/* Móvil en tarjetas; desde sm, tabla */}
            <div className="flex flex-col gap-3 sm:hidden">
                {visibleData.map((finca) => (
                    <TableGridCard
                        key={finca.nombre}
                        accentColor="border-l-brand"
                        icon={<LandPlot size={18} strokeWidth={2} />}
                        title={finca.nombre}
                        subtitle={location(finca)}
                    >
                        <TableGridCardFields>
                            <TableGridCardField label="Ha totales" value={`${hectares.format(finca.haTotal)} ha`} />
                            <TableGridCardField label="Ha de cultivo" value={`${hectares.format(finca.haCultivo)} ha`} />
                            <TableGridCardField label="Coordenadas" value={coordinates(finca)} />
                        </TableGridCardFields>
                    </TableGridCard>
                ))}
            </div>

            <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                <Table>
                    <TableHeader className={TABLE_HEAD_BG}>
                        <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="text-ink font-semibold h-14 px-6">Finca</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Ubicación</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Hectáreas</TableHead>
                            <TableHead className="text-ink font-semibold h-14 px-6">Coordenadas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleData.map((finca) => (
                            <TableRow key={finca.nombre} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                <TableCell className="h-20 px-6 relative">
                                    <TableRowAccent color="bg-brand" />
                                    <TableRowLead icon={<LandPlot size={20} strokeWidth={2} />} title={finca.nombre} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-ink-body font-medium">
                                        <MapPin size={16} className="shrink-0 text-ink-muted" />
                                        {location(finca)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[13.5px] text-ink-body leading-tight">{hectares.format(finca.haTotal)} ha totales</span>
                                        <span className="text-[12.5px] font-medium mt-1">{hectares.format(finca.haCultivo)} ha de cultivo</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 text-ink-body font-medium">{coordinates(finca)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TableCard>
    );
}
