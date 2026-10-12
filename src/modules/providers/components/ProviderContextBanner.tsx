import { Fingerprint, MapPin, Sprout } from "lucide-react";
import supplierImage from "@/assets/supplier_management.webp";
import ContextBanner, { type ContextBannerStat } from "@/shared/components/ContextBanner";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";

interface ProviderContextBannerProps {
    provider: Proveedor;
    /** Qué se está gestionando, p. ej. "Fincas · cultivos y superficie" */
    caption: string;
    /** Cifras rápidas del recurso gestionado, p. ej. número de fincas y hectáreas */
    stats?: ContextBannerStat[];
}

/** Encabezado de las vistas que salen de un proveedor (fincas, certificados), sobre el banner compartido. */
export default function ProviderContextBanner({ provider, caption, stats }: ProviderContextBannerProps) {
    const fullName = `${provider.nombres} ${provider.apellido}`;

    return (
        <ContextBanner
            ariaLabel={`Proveedor ${fullName}`}
            eyebrow={{ icon: <Sprout size={15} strokeWidth={2} aria-hidden="true" />, label: "Proveedor agrícola" }}
            title={fullName}
            meta={[
                { icon: <Fingerprint size={16} />, content: `${provider.tipoDocumento} ${provider.nmrDocumento}` },
                ...(provider.zona ? [{ icon: <MapPin size={16} />, content: provider.zona }] : []),
            ]}
            caption={caption}
            stats={stats}
            image={supplierImage}
        />
    );
}
