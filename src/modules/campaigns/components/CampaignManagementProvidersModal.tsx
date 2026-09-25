import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";

interface CampaignManagementProvidersModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
}

const TIPO_LABEL: Record<string, string> = {
    productor: "Productor",
    acopio: "Acopiador",
};

export default function CampaignManagementProvidersModal({ open, campaniaId, onOpenChange }: CampaignManagementProvidersModalProps) {
    const [proveedores, setProveedores] = useState<CampaniaProveedor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !campaniaId) return;
        setIsLoading(true);
        setError(null);
        getCampaniaProveedoresByCampania(campaniaId)
            .then(setProveedores)
            .catch(() => setError("No se pudieron cargar los proveedores de la campaña."))
            .finally(() => setIsLoading(false));
    }, [open, campaniaId]);

    const productores = proveedores.filter((p) => p.tipoProveedor === "productor").length;
    const acopiadores = proveedores.filter((p) => p.tipoProveedor === "acopio").length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] md:max-w-[800px] p-8 rounded-2xl bg-white border-none shadow-2xl gap-6">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-[22px] font-bold text-ink">
                        Gestión de Proveedores
                    </DialogTitle>
                    <p className="text-[13px] font-medium text-ink-muted">{proveedores.length} proveedores vinculados</p>
                </DialogHeader>

                {/* Resumen */}
                <div className="grid grid-cols-3 border-y border-border py-4">
                    <div className="flex flex-col items-center justify-center border-r border-border">
                        <span className="text-2xl font-black text-ink">{proveedores.length}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Proveedores</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-r border-border">
                        <span className="text-2xl font-black text-ink">{productores}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Productores</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-ink">{acopiadores}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acopiadores</span>
                    </div>
                </div>

                {/* Lista de Proveedores */}
                {isLoading ? (
                    <div className="text-center text-ink-muted py-6">Cargando proveedores...</div>
                ) : error ? (
                    <div className="text-center text-red-600 py-6">{error}</div>
                ) : !campaniaId ? (
                    <div className="text-center text-ink-muted py-6">No se pudo determinar la campaña.</div>
                ) : proveedores.length === 0 ? (
                    <div className="text-center text-ink-muted py-6">Esta campaña aún no tiene proveedores vinculados.</div>
                ) : (
                    <div className="flex flex-col gap-6 mt-2 max-h-[350px] overflow-y-auto pr-2">
                        {proveedores.map((cp) => (
                            <div key={cp.cxpId} className="flex items-start gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center shrink-0">
                                    {cp.proveedor?.nombres ? (
                                        <span className="text-[15px] font-bold text-brand">{cp.proveedor.nombres[0]}</span>
                                    ) : (
                                        <UserRound size={18} className="text-brand" />
                                    )}
                                </div>

                                {/* Info Principal */}
                                <div className="flex-1 flex flex-col gap-2.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-[14px] font-bold text-ink">
                                                {cp.proveedor ? `${cp.proveedor.nombres} ${cp.proveedor.apellido}` : "Proveedor"}
                                            </h4>
                                            <p className="text-[12px] text-ink-muted font-medium">{cp.proveedor?.zona ?? "-"} · {cp.cantidadProveedor} kg est.</p>
                                        </div>
                                        <div className="text-right">
                                            <h4 className="text-[13px] font-bold text-ink">{TIPO_LABEL[cp.tipoProveedor] ?? cp.tipoProveedor}</h4>
                                            <p className="text-[12px] text-ink-muted font-medium">{cp.proveedor?.telefono ?? "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
