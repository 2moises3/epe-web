import { useRef, useState } from "react";
import { Eye, Pencil, Trash2, Contact, ListFilter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import TableCard from "@/shared/components/TableCard";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import ClientFormModal from "./ClientFormModal";
import ClientViewModal from "./ClientViewModal";
import ClientSuccessModal from "./ClientSuccessModal";
import { deleteClienteNegocio } from "@/modules/clients/api/cliente-negocio.api";
import { createInFlightGuard } from "@/modules/clients/api/in-flight-guard";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

const PAGE_SIZE = 8;

interface ClientsTableProps {
    data: ClienteNegocio[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onChanged: () => void;
}

export default function ClientsTable({ data, hasActiveFilters, onClearFilters, onChanged }: ClientsTableProps) {
    const [editingClient, setEditingClient] = useState<ClienteNegocio | null>(null);
    const [viewingClient, setViewingClient] = useState<ClienteNegocio | null>(null);
    const [page, setPage] = useState(1);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteGuard = useRef(createInFlightGuard());

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleDelete = async (client: ClienteNegocio) => {
        if (deleteGuard.current.isInFlight) return;
        if (!window.confirm(`¿Confirmas que quieres eliminar a ${client.nombreEmpresa}?`)) return;
        if (!deleteGuard.current.acquire()) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteClienteNegocio(client.clienteNegocioId);
            onChanged();
        } catch {
            setDeleteError("No se pudo eliminar el cliente. Puede tener información relacionada o haber ocurrido un error de conexión.");
        } finally {
            deleteGuard.current.release();
            setIsDeleting(false);
        }
    };

    return (
        <>
            {deleteError && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-white p-3 text-sm text-destructive">{deleteError}</p>}
            <TableCard
                icon={<Contact size={24} strokeWidth={2.5} />}
                title="Clientes"
                description="Consulta y administra los clientes registrados."
                isEmpty={visibleData.length === 0}
                emptyTitle={hasActiveFilters ? "Sin resultados" : "Aún no hay clientes"}
                emptyDescription={hasActiveFilters ? "Ningún cliente coincide con los filtros aplicados." : "Cuando registres tu primer cliente aparecerá aquí."}
                emptyAction={hasActiveFilters ? <Button onClick={onClearFilters} variant="outline"><ListFilter size={18} /> Limpiar filtros</Button> : undefined}
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
            >
                <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                        <TableHeader className={TABLE_HEAD_BG}>
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="h-14 px-6 font-semibold text-ink">Empresa</TableHead>
                                <TableHead className="h-14 font-semibold text-ink">Contacto</TableHead>
                                <TableHead className="h-14 font-semibold text-ink">Teléfono</TableHead>
                                <TableHead className="h-14 font-semibold text-ink">Correo</TableHead>
                                <TableHead className="h-14 font-semibold text-ink">RUC</TableHead>
                                <TableHead className="h-14 px-6 text-right font-semibold text-ink">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleData.map((client) => (
                                <TableRow key={client.clienteNegocioId} className="border-b border-border hover:bg-surface-page/60">
                                    <TableCell className="relative h-20 px-6">
                                        <TableRowAccent color="bg-brand" />
                                        <TableRowLead icon={client.nombreEmpresa.charAt(0)} title={client.nombreEmpresa} subtitle={client.tipoCliente === "exportador" ? "Exportador" : "Industria"} />
                                    </TableCell>
                                    <TableCell className="font-medium text-ink-body">{client.nombreContacto}</TableCell>
                                    <TableCell className="font-medium text-ink-body">{client.telefono}</TableCell>
                                    <TableCell className="font-medium text-ink-body">{client.correoCorporativo}</TableCell>
                                    <TableCell className="font-medium text-ink-body">{client.ruc}</TableCell>
                                    <TableCell className="px-6">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" aria-label={`Ver ${client.nombreEmpresa}`} onClick={() => setViewingClient(client)}><Eye size={18} /></Button>
                                            <Button variant="ghost" size="icon" aria-label={`Editar ${client.nombreEmpresa}`} onClick={() => setEditingClient(client)}><Pencil size={18} /></Button>
                                            <Button variant="ghost" size="icon" aria-label={`Eliminar ${client.nombreEmpresa}`} disabled={isDeleting} onClick={() => handleDelete(client)}><Trash2 size={18} /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </TableCard>

            <ClientFormModal
                open={editingClient !== null}
                onOpenChange={(open) => !open && setEditingClient(null)}
                mode="edit"
                clientId={editingClient?.clienteNegocioId}
                initialValues={editingClient ?? undefined}
                onSuccess={() => {
                    setEditingClient(null);
                    setIsSuccessModalOpen(true);
                    onChanged();
                }}
            />
            <ClientViewModal open={viewingClient !== null} onOpenChange={(open) => !open && setViewingClient(null)} client={viewingClient} />
            <ClientSuccessModal open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen} mode="edit" />
        </>
    );
}
