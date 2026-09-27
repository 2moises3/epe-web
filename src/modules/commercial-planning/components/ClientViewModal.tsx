import { useEffect, useState } from "react";
import { format } from "date-fns";
import { X, Contact, ExternalLink } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Button } from "@/shared/components/ui/button";
import { InfoField } from "@/shared/components/InfoField";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { getClienteNegocioContratos } from "@/modules/clients/api/cliente-negocio-contratos.api";
import type { ContratoClienteNegocioDto } from "@/modules/clients/api/cliente-negocio-contratos.dto";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";

interface ClientViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: ClienteNegocio | null;
}

function safeExternalUrl(value: string): string | null {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

function formatRegistrationDate(value: string): string {
    try {
        const date = parseFecha(value);
        return Number.isNaN(date.getTime()) ? "No disponible" : format(date, "dd/MM/yyyy");
    } catch {
        return "No disponible";
    }
}

function ContractDocument({ label, value }: { label: string; value: string }) {
    const safeUrl = safeExternalUrl(value);
    if (!value.trim()) return <span className="text-ink-muted">{label}: No disponible</span>;
    if (!safeUrl) return <span className="break-all text-ink-muted">{label}: {value}</span>;
    return (
        <a href={safeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand underline">
            {label}<ExternalLink size={12} aria-hidden="true" />
        </a>
    );
}

function ClientViewModalContent({ open, onOpenChange, client }: ClientViewModalProps) {
    const clientId = client?.clienteNegocioId;
    const [loadState, setLoadState] = useState<
        | { status: "idle" | "loading" }
        | { status: "error"; message: string }
        | { status: "success"; contracts: ContratoClienteNegocioDto[] }
    >({ status: open && clientId !== undefined ? "loading" : "idle" });
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let active = true;
        if (!open || clientId === undefined) {
            return () => { active = false; };
        }

        getClienteNegocioContratos(clientId)
            .then((result) => { if (active) setLoadState({ status: "success", contracts: result.contratos }); })
            .catch(() => { if (active) setLoadState({ status: "error", message: "No se pudieron cargar los contratos de este cliente." }); });

        return () => { active = false; };
    }, [open, clientId, retryKey]);

    if (!client) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Contact size={22} strokeWidth={2} />}
            title="Detalles del cliente"
            description="Información registrada y contratos vinculados a campañas."
            className="sm:max-w-4xl"
            footer={<Button variant="outline" size="xl" onClick={() => onOpenChange(false)}><X size={20} strokeWidth={2.5} /> Cerrar</Button>}
        >
            <div className="grid grid-cols-2 gap-5 sm:gap-6">
                <InfoField label="Empresa" value={client.nombreEmpresa} className="col-span-2" />
                <InfoField label="Nombre de contacto" value={client.nombreContacto} />
                <InfoField label="Teléfono" value={client.telefono} />
                <InfoField label="RUC" value={client.ruc} />
                <InfoField label="Correo corporativo" value={client.correoCorporativo} />
                <InfoField label="Ubicación" value={client.ubicacion} />
                <InfoField label="Tipo de cliente" value={client.tipoCliente === "exportador" ? "Exportador" : "Industria"} />
            </div>

            <section aria-labelledby="client-contracts-heading" className="mt-7">
                <h3 id="client-contracts-heading" className="mb-3 text-sm font-bold text-ink">Contratos por campaña</h3>
                {loadState.status === "loading" && <p role="status" aria-live="polite" className="rounded-lg bg-surface-page p-4 text-sm text-ink-muted">Cargando contratos...</p>}
                {loadState.status === "error" && (
                    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
                        <span>{loadState.message}</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setLoadState({ status: "loading" }); setRetryKey((key) => key + 1); }}>Reintentar</Button>
                    </div>
                )}
                {loadState.status === "success" && loadState.contracts.length === 0 && (
                    <p className="rounded-lg bg-surface-page p-4 text-sm text-ink-muted">Este cliente no tiene contratos vinculados a campañas.</p>
                )}
                {loadState.status === "success" && loadState.contracts.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <Table aria-label="Contratos vinculados a campañas">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaña</TableHead>
                                    <TableHead>Fecha de registro</TableHead>
                                    <TableHead className="text-right">Kilos acordados</TableHead>
                                    <TableHead>Documentos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadState.contracts.map((contract) => (
                                    <TableRow key={contract.clienteNegocioCampanaId}>
                                        <TableCell className="font-medium text-ink">{contract.nombreCampania}</TableCell>
                                        <TableCell>{formatRegistrationDate(contract.fechaRegistro)}</TableCell>
                                        <TableCell className="text-right">{contract.kilosAcordados.toLocaleString("es-PE", { maximumFractionDigits: 3 })} kg</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-start gap-1 text-xs">
                                                <ContractDocument label="Contrato" value={contract.documentoUrl} />
                                                <ContractDocument label="Ficha técnica" value={contract.fichaTecnicaUrl} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>
        </AppModal>
    );
}

export default function ClientViewModal(props: ClientViewModalProps) {
    const key = `${props.client?.clienteNegocioId ?? "no-client"}-${props.open ? "open" : "closed"}`;
    return <ClientViewModalContent key={key} {...props} />;
}
