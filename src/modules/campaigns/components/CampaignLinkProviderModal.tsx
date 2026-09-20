import { useEffect, useState } from "react";
import { X, UserRound } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getProveedores } from "@/modules/providers/api/proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import { createCampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.api";
import type { TipoProveedorCampania } from "@/modules/campaigns/api/campania-proveedor.dto";
import { linkProviderSchema } from "@/modules/campaigns/api/campaign-form.schema";
import { getBadRequestFieldErrors, getZodFieldErrors, type FormFieldErrors } from "@/shared/validation/api-form-errors";
import FieldError from "@/shared/components/FieldError";

interface CampaignLinkProviderModalProps {
    open: boolean;
    campaniaId: number | null;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

interface PendingProvider {
    proveedorId: number;
    nombre: string;
    tipo: TipoProveedorCampania;
    cantidad: string;
}

export default function CampaignLinkProviderModal({ open, campaniaId, onOpenChange, onSave }: CampaignLinkProviderModalProps) {
    const [isAcopiador, setIsAcopiador] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [addedProviders, setAddedProviders] = useState<PendingProvider[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

    useEffect(() => {
        if (!open) return;
        getProveedores()
            .then(setProveedores)
            .catch(() => setError("No se pudieron cargar los proveedores."));
    }, [open]);

    const handleRemove = (proveedorId: number) => {
        setAddedProviders(addedProviders.filter((p) => p.proveedorId !== proveedorId));
    };

    const handleAdd = () => {
        const validation = linkProviderSchema.safeParse({ proveedorId: Number(selectedProvider), cantidad });
        if (!validation.success) { setFieldErrors(getZodFieldErrors(validation.error)); return; }
        const proveedor = proveedores.find((p) => String(p.proveedorId) === selectedProvider);
        if (!proveedor) return;

        setAddedProviders([
            ...addedProviders,
            {
                proveedorId: proveedor.proveedorId,
                nombre: `${proveedor.nombres} ${proveedor.apellido}`,
                tipo: isAcopiador ? "acopio" : "productor",
                cantidad,
            },
        ]);
        setSelectedProvider("");
        setCantidad("");
        setFieldErrors({});
    };

    const handleGuardar = async () => {
        if (campaniaId === null || addedProviders.length === 0) {
            if (onSave) onSave();
            else onOpenChange(false);
            return;
        }
        setIsSaving(true);
        setError(null);
        setFieldErrors({});
        try {
            await Promise.all(
                addedProviders.map((p) =>
                    createCampaniaProveedor({
                        campaniaId,
                        proveedorId: p.proveedorId,
                        cantidadProveedor: p.cantidad || "0",
                        // TODO: pendiente de backend/UI, el formulario aún no captura mtdCeratitis
                        mtdCeratitis: "0",
                        tipoProveedor: p.tipo,
                    })
                )
            );
            setAddedProviders([]);
            if (onSave) onSave();
            else onOpenChange(false);
        } catch (requestError) {
            const parsed = getBadRequestFieldErrors(requestError, {
                proveedorId: "proveedorId", cantidadProveedor: "cantidad", mtdCeratitis: "_form", tipoProveedor: "_form",
            });
            setFieldErrors(parsed);
            if (parsed._form) setError(parsed._form);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Vincular Proveedores"
            className="sm:max-w-175"
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
                        onClick={handleGuardar}
                        disabled={isSaving || addedProviders.length === 0}
                    >
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-6">
                    {/* Seleccionar Proveedor */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Seleccionar Proveedor:</label>
                        <Select value={selectedProvider} onValueChange={(val) => { setSelectedProvider(val || ""); setFieldErrors((p) => ({ ...p, proveedorId: undefined })); }}>
                            <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                <SelectValue placeholder="Seleccione un proveedor..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {proveedores.length === 0 ? (
                                    <SelectItem value="__no-providers__" disabled className="justify-center text-ink-muted">
                                        No hay proveedores registrados.
                                    </SelectItem>
                                ) : proveedores.map((p) => (
                                    <SelectItem key={p.proveedorId} value={String(p.proveedorId)} className="rounded-lg">
                                        {p.nombres} {p.apellido}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError message={fieldErrors.proveedorId} />
                    </div>

                    {/* Toggle and Cantidad */}
                    <div className="grid grid-cols-2 gap-6 items-end">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between w-[130px] px-1">
                                <span className={`text-[12px] font-bold ${!isAcopiador ? "text-ink" : "text-ink-muted"}`}>Productor</span>
                                <span className={`text-[12px] font-bold ${isAcopiador ? "text-ink" : "text-ink-muted"}`}>Acopiador</span>
                            </div>
                            <div
                                className="relative w-[130px] h-11 rounded-full cursor-pointer border-[2.5px] border-ink-muted bg-white transition-colors hover:border-ink"
                                onClick={() => setIsAcopiador(!isAcopiador)}
                            >
                                <div className={`absolute top-1 w-8 h-8 rounded-full bg-brand transition-transform ${isAcopiador ? 'translate-x-[88px]' : 'translate-x-1'}`} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Cantidad Estimada:</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => { setCantidad(e.target.value); setFieldErrors((p) => ({ ...p, cantidad: undefined })); }}
                                className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                            <FieldError message={fieldErrors.cantidad} />
                        </div>
                    </div>

                    {/* Boton Agregar */}
                    <div className="flex justify-center mt-2">
                        <Button
                            onClick={handleAdd}
                            disabled={!selectedProvider}
                            className="h-10 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95"
                        >
                            Agregar
                        </Button>
                    </div>

                    {error && <p className="text-[13px] text-red-600 text-center">{error}</p>}

                    {/* Proveedores Agregados */}
                    <div className="flex flex-col gap-3 mt-4">
                        <label className="text-[13px] font-semibold text-ink">Proveedores Agregados:</label>
                        <div className="flex flex-wrap gap-3">
                            {addedProviders.map((provider) => (
                                <div key={provider.proveedorId} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white min-w-[200px]">
                                    <button
                                        onClick={() => handleRemove(provider.proveedorId)}
                                        className="text-ink hover:text-destructive transition-colors"
                                    >
                                        <X size={18} strokeWidth={2.5} />
                                    </button>
                                    <div className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center text-ink shrink-0">
                                        <UserRound size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-ink leading-tight mb-0.5">{provider.nombre}</span>
                                        <span className="text-[11px] font-medium text-ink">Proveedor - {provider.tipo === "acopio" ? "Acopiador" : "Productor"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

        </AppModal>
    );
}
