import { useEffect, useState } from "react";
import { X, UserSquare } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getClientesNegocio } from "@/modules/clients/api/cliente-negocio.api";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import {
    createClienteNegocioCampana,
    deleteClienteNegocioCampana,
    getClientesNegocioCampana,
} from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";
import { linkClientSchema } from "@/modules/campaigns/api/campaign-form.schema";
import { getBadRequestFieldErrors, getZodFieldErrors, type FormFieldErrors } from "@/shared/validation/api-form-errors";
import FieldError from "@/shared/components/FieldError";

interface CampaignLinkClientModalProps {
    open: boolean;
    // ponytail: opcional porque CampaignTable aún no pasa el campaniaId de la fila (lo maneja otro agente en paralelo).
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignLinkClientModal({ open, campaniaId, onOpenChange, onSave }: CampaignLinkClientModalProps) {
    const [clientes, setClientes] = useState<ClienteNegocio[]>([]);
    const [linkedClients, setLinkedClients] = useState<ClienteNegocioCampana[]>([]);
    const [selectedClienteId, setSelectedClienteId] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");
    const [documentoUrl, setDocumentoUrl] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<FormFieldErrors>({});

    useEffect(() => {
        if (!open) return;
        getClientesNegocio().then(setClientes);
    }, [open]);

    useEffect(() => {
        if (!open || !campaniaId) return;
        getClientesNegocioCampana(campaniaId).then(setLinkedClients);
    }, [open, campaniaId]);

    const linkedClienteIds = new Set(linkedClients.map((l) => l.clienteNegocioId));
    const availableClientes = clientes.filter((c) => !linkedClienteIds.has(c.clienteNegocioId));

    const handleRemove = (clienteNegocioCampanaId: number) => {
        if (!campaniaId) return;
        deleteClienteNegocioCampana(campaniaId, clienteNegocioCampanaId).then(() => {
            setLinkedClients((prev) => prev.filter((l) => l.clienteNegocioCampanaId !== clienteNegocioCampanaId));
        });
    };

    const handleAdd = () => {
        if (!campaniaId) return;
        const validation = linkClientSchema.safeParse({ clienteNegocioId: Number(selectedClienteId), cantidadKg: Number(cantidad), documentoUrl: documentoUrl.trim() });
        if (!validation.success) { setErrors(getZodFieldErrors(validation.error)); return; }

        setIsSaving(true);
        setErrors({});
        createClienteNegocioCampana(campaniaId, {
            ...validation.data,
        })
            .then((created) => {
                setLinkedClients((prev) => [...prev, created]);
                setSelectedClienteId("");
                setCantidad("");
                setDocumentoUrl("");
            })
            .catch((requestError: unknown) => setErrors(getBadRequestFieldErrors(requestError, {
                clienteNegocioId: "clienteNegocioId", documentoUrl: "documentoUrl", cantidadKg: "cantidadKg",
            })))
            .finally(() => setIsSaving(false));
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Registrar Clientes"
            className="sm:max-w-xl"
            footer={
                <>
                    <Button
                        variant="outline"
                        size="xl"
                        onClick={() => onOpenChange(false)}
                    >
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button
                        size="xl"
                        onClick={() => onSave ? onSave() : onOpenChange(false)}
                    >
                        Guardar
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-5">
                    {/* Cliente + Cantidad */}
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Seleccionar Cliente:</label>
                            <Select value={selectedClienteId} onValueChange={(val) => { setSelectedClienteId(val || ""); setErrors((p) => ({ ...p, clienteNegocioId: undefined })); }}>
                                <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    {availableClientes.length === 0 ? (
                                        <SelectItem value="__no-clients__" disabled className="justify-center text-ink-muted">
                                            No hay clientes disponibles para esta campaña.
                                        </SelectItem>
                                    ) : availableClientes.map((cliente) => (
                                        <SelectItem key={cliente.clienteNegocioId} value={String(cliente.clienteNegocioId)} className="rounded-lg">
                                            {cliente.nombreEmpresa}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.clienteNegocioId} />
                        </div>

                        <div className="w-[140px] flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Cantidad kg:</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => { setCantidad(e.target.value); setErrors((p) => ({ ...p, cantidadKg: undefined })); }}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                            <FieldError message={errors.cantidadKg} />
                        </div>
                    </div>

                    {/* Documento (URL) + Agregar */}
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex-1 flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">URL de requerimientos:</label>
                            <Input
                                type="url"
                                placeholder="https://..."
                                value={documentoUrl}
                                onChange={(e) => { setDocumentoUrl(e.target.value); setErrors((p) => ({ ...p, documentoUrl: undefined })); }}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                            <FieldError message={errors.documentoUrl} />
                        </div>

                        <Button
                            onClick={handleAdd}
                            disabled={!campaniaId || !selectedClienteId || !cantidad || !documentoUrl || isSaving}
                            className="h-11 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95 shrink-0"
                        >
                            Agregar
                        </Button>
                    </div>
                    {!campaniaId && (
                        <p className="text-[12px] text-destructive font-medium -mt-2">
                            No se pudo determinar la campaña para vincular clientes.
                        </p>
                    )}
                    {errors._form && <p role="alert" className="text-xs text-destructive">{errors._form}</p>}

                    {/* Clientes Agregados */}
                    <div className="flex flex-col gap-3 mt-2">
                        <label className="text-[13px] font-semibold text-ink">Clientes agregados:</label>
                        {linkedClients.length === 0 ? (
                            <p className="text-[13px] text-ink-muted">Aún no hay clientes vinculados a esta campaña.</p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {linkedClients.map((client) => (
                                    <div key={client.clienteNegocioCampanaId} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white min-w-[200px]">
                                        <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                            <UserSquare size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-[13px] font-bold text-ink leading-tight mb-0.5">
                                                {client.clienteNegocio?.nombreContacto ?? "-"}
                                            </span>
                                            <span className="text-[11px] font-medium text-ink-muted">
                                                Cliente - {client.clienteNegocio?.nombreEmpresa ?? "-"}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(client.clienteNegocioCampanaId)}
                                            className="text-ink-muted hover:text-destructive transition-colors shrink-0"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

        </AppModal>
    );
}
