import { useState } from "react";
import { Pencil, Eye, Contact, FileSignature } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import ClientEditModal from "./ClientEditModal";
import ClientViewModal from "./ClientViewModal";
import ClientAddContractModal from "./ClientAddContractModal";

const data = [
    {
        id: 1,
        empresa: "SUTRIMEX",
        representante: "Brayayin",
        numero: "987456321",
        correo: "SUTRIMEX@gmail.com",
        ruc: "209874563210"
    },
    {
        id: 2,
        empresa: "FIXGROM",
        representante: "Luchito",
        numero: "962541387",
        correo: "FIXGROM@gmail.com",
        ruc: "209874563210"
    }
];

export default function ClientsTable() {
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [viewingClientId, setViewingClientId] = useState<number | null>(null);
    const [addingContractClientId, setAddingContractClientId] = useState<number | null>(null);

    /** Editar y Ver detalles quedan siempre visibles; el resto se agrupa en el menú de "más opciones" */
    const getRowActions = (row: { id: number }) => {
        const primary: RowAction[] = [
            { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => setEditingClientId(row.id) },
            { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => setViewingClientId(row.id) },
        ];
        const secondary: RowAction[] = [
            { label: "Añadir contrato", icon: <FileSignature size={16} strokeWidth={2.5} />, onClick: () => setAddingContractClientId(row.id) },
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
                            <Contact size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[15px] sm:text-[17px] font-bold text-ink leading-tight mb-1">Clientes Generales</h2>
                            <p className="text-[12.5px] sm:text-[13px] text-ink-muted font-medium">Gestiona, consulta y da seguimiento a todos tus clientes generales.</p>
                        </div>
                    </div>
                    <div className="text-[13px] text-muted-foreground font-medium">
                        Mostrando <span className="font-bold">{data.length}</span> de <span className="font-bold">{data.length}</span> clientes
                    </div>
                </div>

                {/* Móvil: tarjeta por cliente en vez de tabla con scroll lateral */}
                <div className="flex flex-col gap-3 sm:hidden">
                    {data.map((row) => (
                        <div key={row.id} className="rounded-xl border border-border border-l-[3px] border-l-brand bg-white overflow-hidden">
                            <div className="flex items-center gap-3 p-4 pb-3">
                                <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand shrink-0 text-[13px] font-bold">
                                    {row.empresa.charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[15px] font-bold text-ink leading-tight truncate">{row.empresa}</span>
                                    <span className="text-[12.5px] text-ink-muted font-medium truncate">{row.representante}</span>
                                </div>
                            </div>

                            <div className="mx-4 flex flex-col gap-2.5 rounded-lg bg-surface-page border border-border p-3">
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">Número</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.numero}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">Correo</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.correo}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider shrink-0">RUC</span>
                                    <span className="text-[13px] font-semibold text-ink truncate">{row.ruc}</span>
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
                                <TableHead className="text-ink font-semibold h-14 px-6">Empresa</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Representante</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Número</TableHead>
                                <TableHead className="text-ink font-semibold h-14">Correo</TableHead>
                                <TableHead className="text-ink font-semibold h-14">RUC</TableHead>
                                <TableHead className="text-ink font-semibold h-14 text-right px-6 w-40">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                    <TableCell className="font-medium text-ink h-16 px-6">{row.empresa}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.representante}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.numero}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.correo}</TableCell>
                                    <TableCell className="text-ink-body font-medium">{row.ruc}</TableCell>
                                    <TableCell className="px-6">
                                        <RowActions {...getRowActions(row)} className="justify-end text-ink-muted" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                </CardContent>
            </Card>

            <ClientEditModal 
                open={editingClientId !== null}
                onOpenChange={(open) => !open && setEditingClientId(null)}
                onSuccess={() => setEditingClientId(null)}
            />

            <ClientViewModal 
                open={viewingClientId !== null}
                onOpenChange={(open) => !open && setViewingClientId(null)}
                clientId={viewingClientId}
            />

            <ClientAddContractModal
                open={addingContractClientId !== null}
                onOpenChange={(open) => !open && setAddingContractClientId(null)}
                onSuccess={() => setAddingContractClientId(null)}
            />
        </>
    );
}
