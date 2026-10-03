import { useEffect, useState } from "react";
import { X, Save, UserRound } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import SegmentedControl from "@/shared/components/SegmentedControl";
import FileDropzone from "@/shared/components/FileDropzone";
import { getProveedores } from "@/modules/providers/api/proveedor.api";
import { getCampaniaProveedoresByCampania, createCampaniaProveedor, deleteCampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import type { CampaniaProveedor } from "@/modules/campaigns/api/campania-proveedor.mapper";
import type { TipoProveedorCampania } from "@/modules/campaigns/api/campania-proveedor.dto";

interface CampaignLinkProviderModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

const TIPO_LABEL: Record<string, string> = {
    productor: "Productor",
    acopio: "Acopiador",
};

export default function CampaignLinkProviderModal({ open, campaniaId, onOpenChange, onSave }: CampaignLinkProviderModalProps) {
    const [providerType, setProviderType] = useState<string>("productor");
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");
    const [examenCampo, setExamenCampo] = useState<File | null>(null);

    const [availableProviders, setAvailableProviders] = useState<Proveedor[]>([]);
    const [linkedProviders, setLinkedProviders] = useState<CampaniaProveedor[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            getProveedores().then(setAvailableProviders);
        }
    }, [open]);

    useEffect(() => {
        if (open && campaniaId) {
            getCampaniaProveedoresByCampania(campaniaId).then(setLinkedProviders);
        }
    }, [open, campaniaId]);

    useResetOnToggle(open, () => {
        setProviderType("productor");
        setSelectedProvider("");
        setCantidad("");
        setExamenCampo(null);
        setErrorMsg(null);
    });

    const handleAdd = () => {
        if (!campaniaId || !selectedProvider || !cantidad) return;
        setIsSaving(true);
        setErrorMsg(null);
        
        createCampaniaProveedor({
            campaniaId,
            proveedorId: Number(selectedProvider),
            tipoProveedor: providerType as TipoProveedorCampania,
            cantidadProveedor: cantidad,
            mtdCeratitis: "0", // Defaulting to 0 since UI doesn't have it yet
        }).then((newProvider) => {
            setLinkedProviders([...linkedProviders, newProvider]);
            setSelectedProvider("");
            setCantidad("");
            setExamenCampo(null);
        }).catch(() => {
            setErrorMsg("No se pudo agregar el proveedor. Intente nuevamente.");
        }).finally(() => {
            setIsSaving(false);
        });
    };

    const handleRemove = (id: number) => {
        deleteCampaniaProveedor(id).then(() => {
            setLinkedProviders(linkedProviders.filter(p => p.cxpId !== id));
        });
    };

    const ALL_PROVIDERS = availableProviders.map(p => ({
        value: String(p.proveedorId),
        label: `${p.nombres} ${p.apellido}`
    }));

    const UNLINKED_PROVIDERS = ALL_PROVIDERS.filter(p => !linkedProviders.some(lp => String(lp.proveedorId) === p.value));

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Vincular Proveedores"
            description="Asocia productores y acopiadores a esta campaña."
            className="sm:max-w-175"
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
                    {/* Seleccionar Proveedor */}
                    <Field>
                        <FieldLabel>Seleccionar Proveedor:</FieldLabel>
                        <Combobox
                            options={UNLINKED_PROVIDERS}
                            value={selectedProvider}
                            onChange={setSelectedProvider}
                            placeholder="Seleccione un proveedor..."
                            emptyMessage="No hay proveedores disponibles para vincular"
                        />
                    </Field>

                    {/* Tipo y cantidad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <Field>
                            <FieldLabel>Tipo de Proveedor:</FieldLabel>
                            <SegmentedControl
                                options={[
                                    { label: "Productor", value: "productor" },
                                    { label: "Acopiador", value: "acopio" }
                                ]}
                                value={providerType}
                                onChange={setProviderType}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Cantidad Estimada (kg):</FieldLabel>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                            />
                        </Field>
                    </div>

                    {/* Examen de campo */}
                    <div className="flex flex-col gap-2.5">
                        <FileDropzone 
                            label="Examen de campo (Opcional)"
                            file={examenCampo}
                            onChange={setExamenCampo}
                            accept=".pdf,.jpg,.jpeg,.png"
                            hint="PDF o Imagen"
                        />
                        <div className="flex justify-end mt-1">
                            <Button
                                onClick={handleAdd}
                                disabled={!campaniaId || !selectedProvider || !cantidad || isSaving}
                                className="h-10 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95"
                            >
                                Agregar a campaña
                            </Button>
                        </div>
                    </div>
                    {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

                    {/* Proveedores Agregados */}
                    {linkedProviders.length > 0 && (
                        <div className="flex flex-col gap-3 mt-4 border-t border-border pt-4">
                            <label className="text-[13px] font-semibold text-ink">Proveedores vinculados ({linkedProviders.length}):</label>
                            <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto">
                                {linkedProviders.map((lp) => (
                                    <div key={lp.cxpId} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white min-w-[200px] w-full sm:w-[calc(50%-6px)]">
                                        <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                            {lp.proveedor?.nombres ? (
                                                <span className="text-[15px] font-bold text-brand">{lp.proveedor.nombres[0]}</span>
                                            ) : (
                                                <UserRound size={18} className="text-brand" />
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-[13px] font-bold text-ink leading-tight mb-0.5 truncate max-w-[150px]">
                                                {lp.proveedor ? `${lp.proveedor.nombres} ${lp.proveedor.apellido}` : "Proveedor"}
                                            </span>
                                            <span className="text-[11px] font-medium text-ink-muted">
                                                {TIPO_LABEL[lp.tipoProveedor] ?? lp.tipoProveedor} - {lp.cantidadProveedor} kg
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(lp.cxpId)}
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
