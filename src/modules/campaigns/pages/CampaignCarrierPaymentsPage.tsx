import { CircleAlert, Wallet } from "lucide-react";
import PageHeader from "@/shared/layout/PageHeader";

/** Disabled until the backend exposes a carrier-payment API. Keep fixture files for reference only. */
export default function CampaignCarrierPaymentsPage() {
    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Wallet size={24} strokeWidth={2.5} />}
                title="Registro de pago al transportista"
                description="Esta vista se habilitará cuando exista una API de pagos en el backend."
            />
            <div role="status" className="mt-6 flex items-start gap-3 rounded-xl border border-status-warning/30 bg-status-warning/10 p-5 text-ink-body">
                <CircleAlert className="mt-0.5 shrink-0 text-status-warning" size={20} />
                <div>
                    <p className="font-semibold">Vista deshabilitada: no hay una API disponible.</p>
                    <p className="mt-1 text-sm text-ink-muted">No se muestran datos de prueba ni se permiten operaciones simuladas. Los pagos a transportistas están registrados como pendientes en el reporte de integración.</p>
                </div>
            </div>
        </div>
    );
}
