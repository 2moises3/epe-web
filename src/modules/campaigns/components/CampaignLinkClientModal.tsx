import { useEffect, useState } from "react";
import { X, Save, UserSquare } from "lucide-react";
import FileDropzone from "@/shared/components/FileDropzone";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import { getClientesNegocio } from "@/modules/clients/api/cliente-negocio.api";
import { getClientesNegocioCampana, createClienteNegocioCampana, deleteClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.api";
import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";
import type { ClienteNegocioCampana } from "@/modules/campaigns/api/cliente-negocio-campana.mapper";

interface CampaignLinkClientModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignLinkClientModal({ open, campaniaId, onOpenChange, onSave }: CampaignLinkClientModalProps) {
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [availableClientes, setAvailableClientes] = useState<ClienteNegocio[]>([]);
    const [linkedClients, setLinkedClients] = useState<ClienteNegocioCampana[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            getClientesNegocio().then(setAvailableClientes);
        }
    }, [open]);

    useEffect(() => {
        if (open && campaniaId) {
            getClientesNegocioCampana(campaniaId).then(setLinkedClients);
        }
    }, [open, campaniaId]);

    useResetOnToggle(open, () => {
        setSelectedClient("");
        setCantidad("");
        setFile(null);
        setErrorMsg(null);
    });

    const handleAdd = () => {
        if (!campaniaId || !selectedClient || !cantidad) return;
        setIsSaving(true);
        setErrorMsg(null);
        
        // Simular que el archivo se sube y obtenemos una URL, ya que el backend espera un string
        const fakeUrl = file ? `https://archivos-epe.s3.amazonaws.com/temp/${file.name}` : "https://dummy.url/req.pdf";
        
        createClienteNegocioCampana(campaniaId, {
            clienteNegocioId: Number(selectedClient),
            documentoUrl: fakeUrl,
            cantidadKg: Number(cantidad)
        }).then((newClient) => {
            setLinkedClients([...linkedClients, newClient]);
            setSelectedClient("");
            setCantidad("");
            setFile(null);
        }).catch(() => {
            setErrorMsg("No se pudo agregar el cliente. Intente nuevamente.");
        }).finally(() => {
            setIsSaving(false);
        });
    };

    const handleRemove = (id: number) => {
        if (!campaniaId) return;
        deleteClienteNegocioCampana(campaniaId, id).then(() => {
            setLinkedClients(linkedClients.filter(c => c.clienteNegocioCampanaId !== id));
        });
    };

    const ALL_CLIENTS = availableClientes.map(c => ({
        value: String(c.clienteNegocioId),
        label: c.nombreEmpresa
    }));

    // Filtrar los que ya están vinculados
    const UNLINKED_CLIENTS = ALL_CLIENTS.filter(c => !linkedClients.some(lc => String(lc.clienteNegocioId) === c.value));

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Registrar Clientes"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={() => { if (onSave) onSave(); else onOpenChange(false); }} disabled={isSaving}>
                        <Save size={20} strokeWidth={2.5} /> Confirmar
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-5">
                    {/* Cliente + Cantidad */}
                    <div className="flex gap-4 items-start">
                        <Field className="flex-1">
                            <FieldLabel>Seleccionar Cliente:</FieldLabel>
                            <Combobox
                                options={UNLINKED_CLIENTS}
                                value={selectedClient}
                                onChange={setSelectedClient}
                                placeholder="Selecciona un cliente"
                                emptyMessage="No hay clientes disponibles para vincular"
                            />
                        </Field>

                        <Field className="w-[140px]">
                            <FieldLabel>Cantidad kg:</FieldLabel>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                            />
                        </Field>
                    </div>

                    {/* Adjuntar */}
                    <div className="flex flex-col gap-2.5">
                        <FileDropzone 
                            label="Requerimientos" 
                            hint="PDF, Excel · Máx. 10 MB" 
                            file={file} 
                            onChange={setFile} 
                        />
                        <div className="flex justify-end mt-1">
                            <Button
                                onClick={handleAdd}
                                disabled={!campaniaId || !selectedClient || !cantidad || isSaving}
                                className="h-10 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95"
                            >
                                Agregar a campaña
                            </Button>
                        </div>
                    </div>
                    {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

                    {/* Clientes Agregados */}
                    {linkedClients.length > 0 && (
                        <div className="flex flex-col gap-3 mt-4 border-t border-border pt-4">
                            <label className="text-[13px] font-semibold text-ink">Clientes vinculados ({linkedClients.length}):</label>
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
                        </div>
                    )}
                </div>
        </AppModal>
    );
}
