import { useState } from "react";
import { X, Save, Link2 } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import SegmentedControl from "@/shared/components/SegmentedControl";
import FileDropzone from "@/shared/components/FileDropzone";

interface CampaignLinkProviderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export default function CampaignLinkProviderModal({ open, onOpenChange, onSave }: CampaignLinkProviderModalProps) {
    const [providerType, setProviderType] = useState<string>("productor");
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");
    const [examenCampo, setExamenCampo] = useState<File | null>(null);

    const ALL_PROVIDERS = [
        { value: "pepe", label: "Pepe Alonso" },
        { value: "juan", label: "Juan Perez" }
    ];

    useResetOnToggle(open, () => {
        setProviderType("productor");
        setSelectedProvider("");
        setCantidad("");
        setExamenCampo(null);
    });

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Link2 size={22} strokeWidth={2} />}
            title="Vincular Proveedores"
            description="Asocia productores y acopiadores a esta campaña."
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={() => onSave ? onSave() : onOpenChange(false)} disabled={!selectedProvider}>
                        <Save size={20} strokeWidth={2.5} /> Guardar
                    </Button>
                </>
            }
        >
                <div className="flex flex-col gap-5">
                    {/* Seleccionar Proveedor */}
                    <Field>
                        <FieldLabel>Seleccionar Proveedor:</FieldLabel>
                        <Combobox
                            options={ALL_PROVIDERS}
                            value={selectedProvider}
                            onChange={setSelectedProvider}
                            placeholder="Seleccione un proveedor..."
                        />
                    </Field>

                    {/* Tipo y cantidad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <Field>
                            <FieldLabel>Tipo de Proveedor:</FieldLabel>
                            <SegmentedControl
                                options={[
                                    { label: "Productor", value: "productor" },
                                    { label: "Acopiador", value: "acopiador" }
                                ]}
                                value={providerType}
                                onChange={setProviderType}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Cantidad Estimada:</FieldLabel>
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
                            label="Examen de campo"
                            file={examenCampo}
                            onChange={setExamenCampo}
                            accept=".pdf,.jpg,.jpeg,.png"
                            hint="PDF o Imagen"
                        />
                    </div>
                </div>
        </AppModal>
    );
}
