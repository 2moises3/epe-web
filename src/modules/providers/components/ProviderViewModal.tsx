import { useEffect, useState } from "react";
import { X, UserRound, ExternalLink, AlertCircle } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { getProveedor } from "@/modules/providers/api/proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import ProviderSubresources from "@/modules/providers/components/ProviderSubresources";

interface ProviderViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    providerId: number | null;
}

type LoadState = { status: "loading" } | { status: "error" } | { status: "success"; provider: Proveedor };

function safeUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

/** Ficha del proveedor: datos del registro y sus frutas, exámenes y certificados. */
export default function ProviderViewModal({ open, onOpenChange, providerId }: ProviderViewModalProps) {
    const [state, setState] = useState<LoadState>({ status: "loading" });
    const [isSubresourceMutating, setIsSubresourceMutating] = useState(false);

    // Cada apertura vuelve a leer el proveedor; las respuestas tardías de una apertura anterior se descartan
    useEffect(() => {
        if (!open || providerId === null) return;
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ status: "loading" });
        getProveedor(providerId)
            .then((provider) => { if (active) setState({ status: "success", provider }); })
            .catch(() => { if (active) setState({ status: "error" }); });
        return () => { active = false; };
    }, [open, providerId]);

    // Mientras se guarda un examen o certificado no se puede cerrar, para no perder la confirmación
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSubresourceMutating) return;
        onOpenChange(nextOpen);
    };

    const provider = state.status === "success" ? state.provider : null;
    const documentUrl = provider ? safeUrl(provider.identidadDocUrl) : null;

    const details = provider ? [
        { label: "DOCUMENTO", value: `${provider.tipoDocumento} ${provider.nmrDocumento}` },
        { label: "TELÉFONO", value: provider.telefono ? String(provider.telefono) : "—" },
        { label: "CORREO", value: provider.email || "—" },
        { label: "ZONA", value: provider.zona || "—" },
        { label: "CÓDIGO LUGAR DE PRODUCCIÓN", value: provider.codigoLugarProduccion ? String(provider.codigoLugarProduccion) : "—" },
    ] : [];

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<UserRound size={22} strokeWidth={2} />}
            title={provider ? `${provider.nombres} ${provider.apellido}` : "Detalle del proveedor"}
            description={provider ? `${provider.zona || "Sin zona"} · ${provider.tipoDocumento} ${provider.nmrDocumento}` : "Consultando el registro del proveedor."}
            className="sm:max-w-200"
            footer={
                <Button variant="outline" size="xl" disabled={isSubresourceMutating} onClick={() => handleOpenChange(false)}>
                    <X size={20} strokeWidth={2.5} /> Cerrar
                </Button>
            }
        >
            {state.status === "loading" && (
                <div role="status" className="flex flex-col items-center gap-3 py-10 text-ink-muted">
                    <Spinner className="size-7 text-brand" />
                    <p className="text-[13px] font-medium">Cargando proveedor…</p>
                </div>
            )}
            {state.status === "error" && (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>No se pudo cargar el detalle del proveedor. Cierra y vuelve a abrirlo para intentarlo nuevamente.</AlertDescription>
                </Alert>
            )}
            {provider && (
                <>
                    <dl className="flex flex-col">
                        {details.map((detail) => (
                            <div key={detail.label} className="flex flex-col gap-1 border-b border-border/50 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{detail.label}</dt>
                                <dd className="break-all text-[14px] font-semibold text-ink">{detail.value}</dd>
                            </div>
                        ))}
                        <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">DOCUMENTO DE IDENTIDAD</dt>
                            <dd className="text-[14px] font-semibold">
                                {documentUrl ? (
                                    <a href={documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                                        Abrir documento <ExternalLink size={13} aria-hidden="true" />
                                    </a>
                                ) : (
                                    <span className="text-ink-muted">No disponible</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                    <ProviderSubresources key={provider.proveedorId} providerId={provider.proveedorId} onMutatingChange={setIsSubresourceMutating} />
                </>
            )}
        </AppModal>
    );
}
