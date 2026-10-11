import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, LandPlot, Plus, UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import PageHeader from "@/shared/layout/PageHeader";
import ProviderFincasTable from "@/modules/providers/components/ProviderFincasTable";
import ProviderFincaModal from "@/modules/providers/components/ProviderFincaModal";
import ProviderSuccessModal from "@/modules/providers/components/ProviderSuccessModal";
import { getProveedor } from "@/modules/providers/api/proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import { addFinca, useProviderLocalData } from "@/modules/providers/providerLocalData.store";
import type { Finca } from "@/modules/providers/providerFinca.utils";

const fullName = (provider: Proveedor) => `${provider.nombres} ${provider.apellido}`;

/** Gestión de las fincas de un proveedor: su lista y el registro de nuevas fincas. */
export default function ProviderFincasPage() {
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

    return <ProviderFincasView provider={provider} />;
}

function ProviderFincasView({ provider }: { provider: Proveedor }) {
    const { fincas } = useProviderLocalData();
    const providerFincas = fincas[provider.proveedorId] ?? [];
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const handleSave = (finca: Finca) => {
        addFinca(provider.proveedorId, finca);
        setIsRegisterOpen(false);
        setIsSuccessOpen(true);
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<LandPlot size={24} strokeWidth={2.5} />}
                title="Gestión de Fincas"
                description={`Fincas registradas de ${fullName(provider)}.`}
                action={
                    <Button size="xl" onClick={() => setIsRegisterOpen(true)}>
                        <Plus size={20} strokeWidth={2.5} /> Registrar finca
                    </Button>
                }
            />

            <ProviderFincasTable fincas={providerFincas} onRegister={() => setIsRegisterOpen(true)} />

            <ProviderFincaModal
                open={isRegisterOpen}
                onOpenChange={setIsRegisterOpen}
                providerName={fullName(provider)}
                registeredFincas={providerFincas}
                onSave={handleSave}
            />

            <ProviderSuccessModal open={isSuccessOpen} onOpenChange={setIsSuccessOpen} mode="finca" />
        </div>
    );
}
