import { useEffect, useMemo, useState } from "react";
import { FileArchive, MapPin, Phone, Truck, UserRound } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import { Button } from "@/shared/components/ui/button";
import { getProveedores } from "@/modules/providers/api/proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";

const PAGE_SIZE = 8;

export default function ProvidersTable({ search = "" }: { search?: string }) {
    const [providers, setProviders] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");

    useEffect(() => {
        getProveedores()
            .then(setProviders)
            .catch(() => setError("No se pudieron cargar los proveedores."))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredProviders = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        if (!query) return providers;
        return providers.filter((provider) =>
            `${provider.nombres} ${provider.apellido} ${provider.tipoDocumento} ${provider.nmrDocumento} ${provider.email} ${provider.zona}`
                .toLocaleLowerCase()
                .includes(query),
        );
    }, [providers, search]);

    if (isLoading || error) {
        return <div className={`rounded-2xl border border-border bg-white p-6 text-center ${error ? "text-red-600" : "text-ink-muted"}`}>{error ?? "Cargando proveedores..."}</div>;
    }

    const pageCount = Math.ceil(filteredProviders.length / PAGE_SIZE);
    const currentPage = Math.min(page, Math.max(1, pageCount));
    const pageItems = filteredProviders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <TableCard
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Proveedores Registrados"
                description="Gestiona, consulta y da seguimiento a todos tus proveedores registrados."
                headerRight={<TableToolbar><TableCountPill icon={<Truck size={16} strokeWidth={2.5} className="text-brand" />} count={filteredProviders.length} label="proveedores" /><TableViewToggle value={viewMode} onChange={setViewMode} /></TableToolbar>}
                isEmpty={pageItems.length === 0}
                emptyTitle={search.trim() ? "Sin resultados" : "Aún no hay proveedores"}
                emptyDescription={search.trim() ? "No hay proveedores que coincidan con la búsqueda." : "Los proveedores registrados aparecerán acá."}
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
            >
                <div className={`flex flex-col gap-3 ${viewMode === "grid" ? "sm:grid sm:grid-cols-2 lg:grid-cols-3" : "sm:hidden"}`}>
                    {pageItems.map((row) => <TableGridCard key={row.proveedorId} icon={<UserRound size={18} strokeWidth={2} />} title={`${row.nombres} ${row.apellido}`} subtitle={`DNI ${row.nmrDocumento}`} actions={<span className="px-2 text-xs text-ink-muted">Entrevista pendiente de API</span>}>
                        <TableGridCardFields>
                            <TableGridCardField label="Zona" value={row.zona || "—"} />
                            <TableGridCardField label="Teléfono" value={row.telefono || "—"} />
                        </TableGridCardFields>
                    </TableGridCard>)}
                </div>

                {viewMode === "table" && <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}><TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="h-14 px-6 font-semibold text-ink">Proveedor</TableHead>
                            <TableHead className="h-14 font-semibold text-ink">Documento</TableHead>
                            <TableHead className="h-14 font-semibold text-ink">Zona</TableHead>
                            <TableHead className="h-14 font-semibold text-ink">Teléfono</TableHead>
                            <TableHead className="h-14 w-40 px-6 text-center font-semibold text-ink">Acciones</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>{pageItems.map((row) => <TableRow key={row.proveedorId} className="border-b border-border transition-colors hover:bg-surface-page/60">
                            <TableCell className="h-20 px-6"><TableRowLead icon={<UserRound size={20} strokeWidth={2} />} title={`${row.nombres} ${row.apellido}`} subtitle={row.email} /></TableCell>
                            <TableCell className="font-medium text-ink-body">{row.tipoDocumento} {row.nmrDocumento}</TableCell>
                            <TableCell><div className="flex items-center gap-2 text-ink-body"><MapPin size={16} className="text-ink-muted" />{row.zona || "—"}</div></TableCell>
                            <TableCell><div className="flex items-center gap-2 text-ink-body"><Phone size={16} className="text-ink-muted" />{row.telefono || "—"}</div></TableCell>
                            <TableCell className="px-6"><div className="flex justify-center"><Button variant="ghost" size="icon" aria-label="Entrevista no disponible: backend sin API" title="Entrevista no disponible: backend sin API" disabled className="h-9 w-9 rounded-lg text-ink-muted"><FileArchive size={18} strokeWidth={2.5} /></Button></div></TableCell>
                        </TableRow>)}</TableBody>
                    </Table>
                </div>}
            </TableCard>
    );
}
