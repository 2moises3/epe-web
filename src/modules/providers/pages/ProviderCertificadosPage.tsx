import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import PageHeader from "@/shared/layout/PageHeader";
import ProviderCertificadosTable from "@/modules/providers/components/ProviderCertificadosTable";
import ProviderCertificadoModal from "@/modules/providers/components/ProviderCertificadoModal";
import ProviderCertificadoViewModal from "@/modules/providers/components/ProviderCertificadoViewModal";
import ProviderSuccessModal, { type ProviderSuccessMode } from "@/modules/providers/components/ProviderSuccessModal";
import { getProveedor } from "@/modules/providers/api/proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import { addCertificado, updateCertificado, useProviderLocalData } from "@/modules/providers/providerLocalData.store";
import type { CertificadoFormValues, CertificadoLocal } from "@/modules/providers/providerCertificado.utils";

const fullName = (provider: Proveedor) => `${provider.nombres} ${provider.apellido}`;

/**
 * Gestión de los certificados de un proveedor: su lista, el registro de nuevos y la edición de los existentes.
 * Los certificados viven en memoria (providerLocalData.store.ts) hasta que se conecte el servicio.
 */
export default function ProviderCertificadosPage() {
    const { id } = useParams<{ id: string }>();
    const providerId = Number(id);
    const [provider, setProvider] = useState<Proveedor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProvider = useCallback(async () => {
        if (!Number.isInteger(providerId) || providerId < 1) {
            setError("El proveedor no es válido.");
            setIsLoading(false);
            return;
        }
        try {
            setError(null);
            setProvider(await getProveedor(providerId));
        } catch {
            setError("No se pudo cargar el proveedor desde el backend.");
        } finally {
            setIsLoading(false);
        }
    }, [providerId]);

    // Carga inicial desde la API: el estado se actualiza al resolverse la petición.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void loadProvider(); }, [loadProvider]);

    if (isLoading) {
        return (
            <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-muted">
                <Spinner className="size-8 text-brand" />
                <p className="text-[14px] font-medium">Cargando proveedor...</p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <UserRound size={44} className="text-brand" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-ink">Proveedor no disponible</h1>
                <p role="alert" className="text-ink-muted">{error}</p>
                <Button nativeButton={false} render={<Link to="/proveedores" />}><ArrowLeft />Volver a proveedores</Button>
            </div>
        );
    }

    return <ProviderCertificadosView provider={provider} />;
}

function ProviderCertificadosView({ provider }: { provider: Proveedor }) {
    const { certificados } = useProviderLocalData();
    const providerCertificates = certificados[provider.proveedorId] ?? [];
    // Se conserva el certificado al cerrar para que el modal no se vacíe durante su animación de salida
    const [form, setForm] = useState<{ open: boolean; certificate: CertificadoLocal | null }>({ open: false, certificate: null });
    const [viewing, setViewing] = useState<{ open: boolean; certificate: CertificadoLocal | null }>({ open: false, certificate: null });
    const [success, setSuccess] = useState<{ open: boolean; mode: ProviderSuccessMode }>({ open: false, mode: "certificado" });

    const handleSave = (values: CertificadoFormValues, file: File | null) => {
        const editing = form.certificate;
        if (editing) {
            updateCertificado(provider.proveedorId, editing.certificadoId, values, file ?? undefined);
        } else if (file) {
            addCertificado(provider.proveedorId, values, file);
        }
        setForm((current) => ({ ...current, open: false }));
        setSuccess({ open: true, mode: editing ? "certificado-edit" : "certificado" });
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<ShieldCheck size={24} strokeWidth={2.5} />}
                title="Gestión de Certificados"
                description={`Certificados de ${fullName(provider)}.`}
                action={
                    <Button size="xl" onClick={() => setForm({ open: true, certificate: null })}>
                        <Plus size={20} strokeWidth={2.5} /> Registrar certificado
                    </Button>
                }
            />

            <ProviderCertificadosTable
                certificates={providerCertificates}
                onRegister={() => setForm({ open: true, certificate: null })}
                onView={(certificate) => setViewing({ open: true, certificate })}
                onEdit={(certificate) => setForm({ open: true, certificate })}
            />

            <ProviderCertificadoModal
                open={form.open}
                onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
                providerName={fullName(provider)}
                certificate={form.certificate}
                onSave={handleSave}
            />

            <ProviderCertificadoViewModal
                open={viewing.open}
                onOpenChange={(open) => setViewing((current) => ({ ...current, open }))}
                providerName={fullName(provider)}
                certificate={viewing.certificate}
            />

            <ProviderSuccessModal open={success.open} onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))} mode={success.mode} />
        </div>
    );
}
