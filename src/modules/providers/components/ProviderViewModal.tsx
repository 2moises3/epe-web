import { useEffect, useState } from "react";
import AppModal from "@/shared/components/AppModal";
import { Button } from "@/shared/components/ui/button";
import { getProveedor } from "@/modules/providers/api/proveedor.api";
import { createProviderDetailsSession } from "@/modules/providers/api/provider-lifecycle";

interface ProviderViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    providerId: number | null;
}

export default function ProviderViewModal({ open, onOpenChange, providerId }: ProviderViewModalProps) {
    const [session, setSession] = useState(createProviderDetailsSession);
    const { provider, error, loading: isLoading } = session;

    useEffect(() => {
        let active = true;
        if (!open || providerId === null) return () => { active = false; };
        getProveedor(providerId)
            .then((data) => { if (active) setSession({ provider: data, error: null, loading: false }); })
            .catch(() => { if (active) setSession({ provider: null, error: "No se pudo cargar el detalle del proveedor.", loading: false }); });

        return () => { active = false; };
    }, [open, providerId]);

    if (!open || providerId === null) return null;

    const details = provider ? [
        ["Tipo de documento", provider.tipoDocumento],
        ["Número de documento", provider.nmrDocumento],
        ["Teléfono", provider.telefono],
        ["Correo electrónico", provider.email],
        ["Zona", provider.zona],
        ["URL del documento de identidad", provider.identidadDocUrl],
        ["Código de lugar de producción", provider.codigoLugarProduccion],
    ] as const : [];

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title={provider ? `${provider.nombres} ${provider.apellido}` : "Detalle del proveedor"}
            description={provider ? "Información registrada en el sistema." : "Consulta del registro de proveedor."}
            className="sm:max-w-140"
            footer={<Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>Cerrar</Button>}
        >
            {isLoading && <p role="status" className="py-6 text-center text-ink-muted">Cargando proveedor…</p>}
            {error && <p role="alert" className="py-6 text-center text-red-600">{error}</p>}
            {provider && <dl className="flex flex-col">
                {details.map(([label, value]) => <div key={label} className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-xs font-bold uppercase tracking-wider text-ink-muted">{label}</dt>
                    <dd className="break-all text-sm font-semibold text-ink">{value || "—"}</dd>
                </div>)}
            </dl>}
        </AppModal>
    );
}
