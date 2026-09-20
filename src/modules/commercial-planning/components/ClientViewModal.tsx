import { useEffect, useState } from "react";
import AppModal from "@/shared/components/AppModal";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { InfoField } from "@/shared/components/InfoField";
import { getContratosClienteNegocio } from "@/modules/clients/api/cliente-negocio.api";
import type { ContratosClienteNegocioDto } from "@/modules/clients/api/cliente-negocio.dto";

interface ClientViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: number | null;
}

export default function ClientViewModal({ open, onOpenChange, clientId }: ClientViewModalProps) {
    const [details, setDetails] = useState<ContratosClienteNegocioDto | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!open || !clientId) return;
        void getContratosClienteNegocio(clientId)
            .then((result) => { setError(false); setDetails(result); })
            .catch(() => setError(true));
    }, [open, clientId]);

    if (!clientId) return null;
    const client = details?.clienteNegocio;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Detalles del Cliente"
            description="Datos del cliente y contratos registrados."
            className="sm:max-w-162.5"
            footer={
                <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cerrar
                    </Button>
            }
        >
            <div className="grid grid-cols-2 gap-5 sm:gap-6">
                {error ? <p role="alert" className="col-span-2 text-sm text-red-600">No se pudieron cargar los datos del cliente.</p> : !client ? <p className="col-span-2 text-sm text-ink-muted">Cargando cliente...</p> : <>
                    <InfoField label="Nombres Completos" value={client.nombreContacto} className="col-span-2" />
                    <InfoField label="Empresa" value={client.nombreEmpresa} />
                    <InfoField label="Teléfono" value={client.telefono} />
                    <InfoField label="RUC" value={client.ruc} />
                    <InfoField label="Correo Corporativo" value={client.correoCorporativo} />
                    <InfoField label="Ubicación" value={client.ubicacion} />
                    <InfoField label="Tipo de Cliente" value={client.tipoCliente === "exportador" ? "Exportador" : "Industria"} />
                </>}
            </div>
            <section className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-ink">Historial de contratos</h3>
                {details?.contratos.length === 0 && <p className="text-sm text-ink-muted">Este cliente aún no tiene contratos.</p>}
                <div className="flex flex-col gap-2">
                    {details?.contratos.map((contract) => <div key={contract.clienteNegocioCampanaId} className="rounded-lg border border-border p-3 text-sm">
                        <p className="font-semibold text-ink">{contract.nombreCampania} — {contract.kilosAcordados} kg</p>
                        <p className="text-xs text-ink-muted">Registrado: {contract.fechaRegistro.slice(0, 10)}</p>
                        <div className="mt-2 flex gap-3"><a className="text-brand underline" href={contract.documentoUrl} target="_blank" rel="noreferrer">Contrato</a><a className="text-brand underline" href={contract.fichaTecnicaUrl} target="_blank" rel="noreferrer">Ficha técnica</a></div>
                    </div>)}
                </div>
            </section>
        </AppModal>
    );
}
