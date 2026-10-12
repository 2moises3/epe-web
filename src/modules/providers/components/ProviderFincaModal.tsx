import { useState } from "react";
import { LandPlot, Save, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import ModalSection from "@/shared/components/ModalSection";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import InputField from "@/shared/components/InputField";
import { Button } from "@/shared/components/ui/button";
import {
    EMPTY_FINCA,
    toFinca,
    validateFinca,
    type Finca,
    type FincaErrors,
    type FincaField,
    type FincaFormValues,
} from "@/modules/providers/providerFinca.utils";

interface ProviderFincaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Nombre del proveedor dueño de la finca, se muestra bajo el título */
    providerName: string;
    /** Fincas que el proveedor ya tiene: se listan como referencia y no se permite repetir su nombre */
    registeredFincas: Finca[];
    onSave: (finca: Finca) => void;
}

/** Registro de una finca (lugar de cultivo) del proveedor: datos productivos arriba, ubicación abajo. */
export default function ProviderFincaModal({ open, onOpenChange, providerName, registeredFincas, onSave }: ProviderFincaModalProps) {
    const [values, , set] = useModalForm<FincaFormValues>(open, EMPTY_FINCA);
    const [errors, setErrors] = useState<FincaErrors>({});

    useResetOnToggle(open, () => setErrors({}));

    const bind = (field: FincaField) => ({
        id: `finca-${field}`,
        required: true,
        value: values[field],
        error: errors[field],
        onChange: (next: string) => {
            set(field)(next);
            setErrors((current) => ({ ...current, [field]: undefined }));
        },
    });

    const handleSave = () => {
        const nextErrors = validateFinca(values, registeredFincas.map((finca) => finca.nombre));
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        onSave(toFinca(values));
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<LandPlot size={22} strokeWidth={2} />}
            title="Registrar finca"
            description={providerName}
            className="sm:max-w-180"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSave}>
                        <Save size={20} strokeWidth={2.5} /> Guardar finca
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Referencia para no duplicar: el usuario ve qué fincas ya tiene el proveedor antes de escribir */}
                {registeredFincas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-3">
                        <span className="text-[12px] font-semibold text-ink-body">Fincas ya registradas:</span>
                        {registeredFincas.map((finca) => (
                            <span key={finca.nombre} className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[12px] font-semibold text-brand border border-brand-border">
                                <LandPlot size={12} strokeWidth={2.5} />
                                {finca.nombre}
                                <span className="font-medium text-ink-muted">· {finca.haTotal} ha</span>
                            </span>
                        ))}
                    </div>
                )}

                <ModalSection title="Datos de la finca">
                    <InputField {...bind("nombre")} label="Nombre de la finca" placeholder="Ej. Fundo Tambogrande" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField {...bind("haTotal")} label="Hectáreas totales" placeholder="0.00" step="0.01" unit="ha" />
                        <InputField {...bind("haCultivo")} label="Hectáreas de cultivo" placeholder="0.00" step="0.01" unit="ha" />
                    </div>
                </ModalSection>

                <ModalSection title="Ubicación">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InputField {...bind("departamento")} label="Departamento" placeholder="Ej. Piura" />
                        <InputField {...bind("provincia")} label="Provincia" placeholder="Ej. Sullana" />
                        <InputField {...bind("distrito")} label="Distrito" placeholder="Ej. Marcavelica" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField {...bind("latitud")} label="Latitud" placeholder="-5.1945" step="0.0000001" optional />
                        <InputField {...bind("longitud")} label="Longitud" placeholder="-80.6328" step="0.0000001" optional />
                    </div>
                </ModalSection>
            </div>
        </AppModal>
    );
}
