import { useState } from "react";
import { CalendarCheck, Eye, FileText, Pencil, Plus, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import TableCard from "@/shared/components/TableCard";
import RowActions, { type RowAction } from "@/shared/components/RowActions";
import { TABLE_HEAD_BG, TableRowAccent, TableRowLead } from "@/shared/components/DataTableRow";
import TableGridCard, { TableGridCardField, TableGridCardFields } from "@/shared/components/TableGridCard";
import { TableCountPill, TableToolbar } from "@/shared/components/TableToolbar";
import { displayCertificadoDate, type CertificadoLocal } from "@/modules/providers/providerCertificado.utils";

const PAGE_SIZE = 8;

interface ProviderCertificadosTableProps {
    certificates: CertificadoLocal[];
    /** Acción del estado vacío: abre el registro del primer certificado */
    onRegister: () => void;
    onView: (certificate: CertificadoLocal) => void;
    onEdit: (certificate: CertificadoLocal) => void;
}

/** Lista de certificados de un proveedor, con el mismo marco, filas y tarjetas móviles que las demás tablas. */
export default function ProviderCertificadosTable({ certificates, onRegister, onView, onEdit }: ProviderCertificadosTableProps) {
    const [page, setPage] = useState(1);

    const pageCount = Math.max(1, Math.ceil(certificates.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleData = certificates.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getRowActions = (certificate: CertificadoLocal): RowAction[] => [
        { label: "Ver detalles", icon: <Eye size={18} strokeWidth={2.5} />, onClick: () => onView(certificate) },
        { label: "Editar", icon: <Pencil size={18} strokeWidth={2.5} />, onClick: () => onEdit(certificate) },
    ];

    return (
        <TableCard
            icon={<ShieldCheck size={24} strokeWidth={2.5} />}
            title="Certificados Registrados"
            description="Documentos propios del proveedor, separados de las certificaciones de campaña."
            headerRight={
                <TableToolbar>
                    <TableCountPill icon={<ShieldCheck size={16} strokeWidth={2.5} className="text-brand" />} count={certificates.length} label={certificates.length === 1 ? "certificado" : "certificados"} />
                </TableToolbar>
            }
            isEmpty={certificates.length === 0}
            emptyIcon={<ShieldCheck size={28} strokeWidth={2} />}
            emptyTitle="Aún no hay certificados"
            emptyDescription="Este proveedor todavía no tiene certificados registrados. Haz clic en 'Registrar certificado' para comenzar."
            emptyAction={<Button onClick={onRegister}><Plus size={18} strokeWidth={2.5} /> Registrar certificado</Button>}
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
        >
            {/* Móvil en tarjetas; desde sm, tabla */}
            <div className="flex flex-col gap-3 sm:hidden">
                {visibleData.map((certificate) => (
                    <TableGridCard
                        key={certificate.certificadoId}
                        accentColor="border-l-brand"
                        icon={<ShieldCheck size={18} strokeWidth={2} />}
                        title={certificate.nombre}
                        subtitle={`Revisión SENASA · ${displayCertificadoDate(certificate.fechaRevisionSenasa)}`}
                        actions={<RowActions primary={getRowActions(certificate)} />}
                    >
                        <TableGridCardFields>
                            <TableGridCardField label="Documento" value={certificate.documento.name} />
                        </TableGridCardFields>
                    </TableGridCard>
                ))}
            </div>

            <div className="hidden sm:block rounded-xl overflow-hidden border border-border">
                <Table>
                    <TableHeader className={TABLE_HEAD_BG}>
                        <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="text-ink font-semibold h-14 px-6">Certificado</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Fecha de revisión SENASA</TableHead>
                            <TableHead className="text-ink font-semibold h-14">Documento</TableHead>
                            <TableHead className="text-ink font-semibold h-14 text-right px-6 w-40">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleData.map((certificate) => (
                            <TableRow key={certificate.certificadoId} className="border-b border-border hover:bg-surface-page/60 transition-colors">
                                <TableCell className="h-20 px-6 relative">
                                    <TableRowAccent color="bg-brand" />
                                    <TableRowLead icon={<ShieldCheck size={20} strokeWidth={2} />} title={certificate.nombre} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-ink-body font-medium">
                                        <CalendarCheck size={16} className="shrink-0 text-ink-muted" />
                                        {displayCertificadoDate(certificate.fechaRevisionSenasa)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-ink-body font-medium">
                                        <FileText size={16} className="shrink-0 text-ink-muted" />
                                        <span className="truncate">{certificate.documento.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6">
                                    <RowActions primary={getRowActions(certificate)} className="justify-end" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TableCard>
    );
}
