import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, MapPin, Pencil, Phone, Plus, Trash2, Truck, UserRound } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardFields, TableGridCardField } from "@/shared/components/TableGridCard";
import { TableToolbar, TableCountPill, TableViewToggle, type TableViewMode } from "@/shared/components/TableToolbar";
import RowActions from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import ProviderFormModal from "@/modules/providers/components/ProviderFormModal";
import ProviderViewModal from "@/modules/providers/components/ProviderViewModal";
import { createProveedor, deleteProveedor, getProveedores, updateProveedor } from "@/modules/providers/api/proveedor.api";
import type { ProveedorInput } from "@/modules/providers/api/proveedor.dto";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import { createInFlightGuard } from "@/modules/providers/api/proveedor-submission";

const PAGE_SIZE = 8;

export default function ProvidersTable({ search = "" }: { search?: string }) {
    const [providers, setProviders] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<TableViewMode>("table");
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [selectedProvider, setSelectedProvider] = useState<Proveedor | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailProviderId, setDetailProviderId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isMutationBusy, setIsMutationBusy] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [mutationGuard] = useState(createInFlightGuard);
    const loadSequence = useRef(0);

    const loadProviders = useCallback(async () => {
        const request = ++loadSequence.current;
        try {
            const data = await getProveedores();
            if (request !== loadSequence.current) return;
            setProviders(data);
            setError(null);
        } catch {
            if (request === loadSequence.current) setError("No se pudieron cargar los proveedores.");
        } finally {
            if (request === loadSequence.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        getProveedores()
            .then((data) => { if (active) { setProviders(data); setError(null); } })
            .catch(() => { if (active) setError("No se pudieron cargar los proveedores."); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; loadSequence.current += 1; };
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
    const pageCount = Math.ceil(filteredProviders.length / PAGE_SIZE);
    const currentPage = Math.min(page, Math.max(1, pageCount));
    const pageItems = filteredProviders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const openCreate = () => {
        if (mutationGuard.isInFlight) return;
        setSelectedProvider(null);
        setFormMode("create");
        setStatusMessage(null);
        setMutationError(null);
        setFormOpen(true);
    };
    const openEdit = (provider: Proveedor) => {
        if (mutationGuard.isInFlight) return;
        setSelectedProvider(provider);
        setFormMode("edit");
        setStatusMessage(null);
        setMutationError(null);
        setFormOpen(true);
    };
    const openDetails = (provider: Proveedor) => {
        setDetailProviderId(provider.proveedorId);
        setDetailOpen(true);
    };

    const saveProvider = async (providerId: number | null, input: ProveedorInput) => {
        setIsMutationBusy(true);
        try {
            const saved = providerId === null ? await createProveedor(input) : await updateProveedor(providerId, input);
            setProviders((current) => providerId === null
                ? [...current, saved].sort((left, right) => left.proveedorId - right.proveedorId)
                : current.map((provider) => provider.proveedorId === providerId ? saved : provider));
            setStatusMessage(providerId === null ? "Proveedor creado correctamente." : "Proveedor actualizado correctamente.");
            return saved;
        } finally {
            setIsMutationBusy(false);
        }
    };

    const removeProvider = async (provider: Proveedor) => {
        if (mutationGuard.isInFlight || !window.confirm(`¿Eliminar al proveedor ${provider.nombres} ${provider.apellido}?`)) return;
        if (!mutationGuard.acquire()) return;
        setIsMutationBusy(true);
        setIsDeleting(true);
        setStatusMessage(null);
        setMutationError(null);
        try {
            await deleteProveedor(provider.proveedorId);
            setProviders((current) => current.filter((item) => item.proveedorId !== provider.proveedorId));
            setStatusMessage("Proveedor eliminado correctamente.");
        } catch {
            setMutationError("No se pudo eliminar el proveedor. Puede tener registros asociados.");
        } finally {
            mutationGuard.release();
            setIsMutationBusy(false);
            setIsDeleting(false);
        }
    };

    const actionsFor = (provider: Proveedor) => ({
        primary: [
            { label: "Ver detalle", icon: <Eye size={18} />, onClick: () => openDetails(provider) },
            { label: "Editar proveedor", icon: <Pencil size={18} />, onClick: () => openEdit(provider) },
        ],
        secondary: [
            { label: "Eliminar proveedor", icon: <Trash2 size={18} />, variant: "destructive" as const, onClick: () => void removeProvider(provider) },
        ],
    });

    if (isLoading) return <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-white p-6 text-center text-ink-muted">Cargando proveedores…</div>;
    if (error) return <div className="rounded-2xl border border-border bg-white p-6 text-center">
        <p role="alert" className="mb-3 text-red-600">{error}</p>
        <Button variant="outline" onClick={() => { setIsLoading(true); setError(null); void loadProviders(); }}>Reintentar</Button>
    </div>;

    return (
        <>
            {statusMessage && <p role="status" aria-live="polite" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{statusMessage}</p>}
            {mutationError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{mutationError}</p>}
            {isDeleting && <p role="status" aria-live="polite" className="sr-only">Eliminando proveedor…</p>}
            <TableCard
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Proveedores registrados"
                description="Gestiona, consulta y da seguimiento a los proveedores registrados."
                headerRight={<div className="flex flex-wrap items-center justify-end gap-3"><TableToolbar><TableCountPill icon={<Truck size={16} strokeWidth={2.5} className="text-brand" />} count={filteredProviders.length} label="proveedores" /><TableViewToggle value={viewMode} onChange={setViewMode} /></TableToolbar><Button onClick={openCreate} disabled={isMutationBusy} aria-busy={isMutationBusy}><Plus size={17} /> Agregar proveedor</Button></div>}
                isEmpty={pageItems.length === 0}
                emptyTitle={search.trim() ? "Sin resultados" : "Aún no hay proveedores"}
                emptyDescription={search.trim() ? "No hay proveedores que coincidan con la búsqueda." : "Los proveedores registrados aparecerán aquí."}
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
            >
                <div className={`flex flex-col gap-3 ${viewMode === "grid" ? "sm:grid sm:grid-cols-2 lg:grid-cols-3" : "sm:hidden"}`}>
                    {pageItems.map((row) => <TableGridCard key={row.proveedorId} icon={<UserRound size={18} strokeWidth={2} />} title={`${row.nombres} ${row.apellido}`} subtitle={`${row.tipoDocumento} ${row.nmrDocumento}`} actions={<RowActions {...actionsFor(row)} />}>
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
                            <TableCell className="px-6"><RowActions {...actionsFor(row)} /></TableCell>
                        </TableRow>)}</TableBody>
                    </Table>
                </div>}
            </TableCard>
            {formOpen && <ProviderFormModal open={formOpen} onOpenChange={setFormOpen} mode={formMode} provider={selectedProvider} mutationGuard={mutationGuard} onSave={saveProvider} />}
            {detailOpen && <ProviderViewModal open={detailOpen} onOpenChange={setDetailOpen} providerId={detailProviderId} />}
        </>
    );
}
