import { useState } from "react";
import { Pencil, Eye, FileArchive, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import StatusBadge from "@/shared/components/StatusBadge";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ProviderInterviewModal from "./ProviderInterviewModal";
import ProviderEditModal from "./ProviderEditModal";
import ProviderViewModal from "./ProviderViewModal";

interface ProvidersTableProps {
    data: any[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export default function ProvidersTable({ data, hasActiveFilters, onClearFilters }: ProvidersTableProps) {
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [editingProviderId, setEditingProviderId] = useState<number | null>(null);
    const [viewingProviderId, setViewingProviderId] = useState<number | null>(null);

    /** Editar y Ver detalles quedan siempre visibles; el resto se agrupa en el menú de "más opciones" */
    const getRowActions = (row: { id: number }) => {
        const primary: RowAction[] = [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingProviderId(row.id) },
            { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => setViewingProviderId(row.id) },
        ];
        const secondary: RowAction[] = [
            { label: "Ver entrevista", icon: <FileArchive size={16} strokeWidth={2.5} />, onClick: () => setIsInterviewModalOpen(true) },
        ];
        return { primary, secondary };
    };

    return (
        <>
            <Card className="rounded-2xl border-border shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
                <CardContent className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                <Truck size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-[15px] sm:text-[17px] font-bold text-ink leading-tight mb-1">Proveedores Registrados</h2>
                                <p className="text-[12.5px] sm:text-[13px] text-ink-muted font-medium">Gestiona, consulta y da seguimiento a todos tus proveedores registrados.</p>
                            </div>
                        </div>
                        <div className="text-[13px] text-muted-foreground font-medium">
                            Mostrando <span className="font-bold">{data.length}</span> de <span className="font-bold">{data.length}</span> proveedores
                        </div>
                    </div>

                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-page/30 rounded-xl border border-dashed border-border/60">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-border">
                                <Truck className="text-ink-muted/50" size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[16px] font-bold text-ink mb-1">No se encontraron resultados</h3>
                            <p className="text-[13.5px] text-ink-muted mb-4 max-w-md">
                                {hasActiveFilters 
                                    ? "No hay proveedores que coincidan con los filtros aplicados. Intenta con otros criterios de búsqueda."
                                    : "Aún no hay proveedores registrados. Haz clic en 'Nuevo Proveedor' para comenzar."}
                            </p>
                            {hasActiveFilters && (
                                <Button 
                                    onClick={onClearFilters}
                                    variant="outline" 
                                    className="h-9 px-4 rounded-lg font-semibold border-border text-brand hover:text-brand-dark hover:bg-brand-surface shadow-none transition-colors"
                                >
                                    Limpiar filtros
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Móvil: tarjeta por proveedor en vez de tabla con scroll lateral */}
                            <div className="flex flex-col gap-3 sm:hidden">
                                {data.map((row) => (
                            <div
                                key={row.id}
                                className={`rounded-xl border border-border border-l-[3px] bg-white overflow-hidden ${row.estado === "Aprobado" ? "border-l-brand" : "border-l-status-highlight"}`}
                            >
                                <div className="flex items-start justify-between gap-3 p-4 pb-3">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[15px] font-bold text-ink leading-tight truncate">{row.nombre}</span>
                                        <span className="text-[12.5px] text-ink-muted font-medium">DNI {row.dni}</span>
                                    </div>
                                    <StatusBadge status={row.estado} />
                                </div>

                                <div className="mx-4 grid grid-cols-2 gap-3 rounded-lg bg-surface-page border border-border p-3">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Fruta</span>
                                        <span className="text-[13px] font-semibold text-ink">{row.fruta}</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Categoría</span>
                                        <span className="text-[13px] font-semibold text-ink truncate">{row.categoria}</span>
                                    </div>
                                </div>

                                <div className="flex items-center mt-3 px-2.5 py-1.5 border-t border-border bg-surface-page/50 text-ink-muted">
                                    <RowActions {...getRowActions(row)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                        <Table>
                            <TableHeader className="bg-surface-page">
                                <TableRow className="border-b border-border hover:bg-transparent">
                                    <TableHead className="text-ink font-semibold h-14 px-6">Nombre</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">DNI</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">Fruta</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">Categoría de Fruta</TableHead>
                                    <TableHead className="text-ink font-semibold h-14">Estado</TableHead>
                                    <TableHead className="text-ink font-semibold h-14 text-right px-6 w-40">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row) => (
                                    <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                        <TableCell className="font-medium text-ink h-16 px-6">{row.nombre}</TableCell>
                                        <TableCell className="text-ink-body font-medium">{row.dni}</TableCell>
                                        <TableCell className="text-ink-body font-medium">{row.fruta}</TableCell>
                                        <TableCell className="text-ink-body font-medium">{row.categoria}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={row.estado} />
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <RowActions {...getRowActions(row)} className="justify-end text-ink-muted" />
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
            <ProviderInterviewModal 
                open={isInterviewModalOpen} 
                onOpenChange={setIsInterviewModalOpen}
            />
            <ProviderEditModal 
                open={editingProviderId !== null}
                onOpenChange={(open) => !open && setEditingProviderId(null)}
                onSuccess={() => setEditingProviderId(null)}
            />
            <ProviderViewModal 
                open={viewingProviderId !== null}
                onOpenChange={(open) => !open && setViewingProviderId(null)}
                providerId={viewingProviderId}
            />
        </>
    );
}
