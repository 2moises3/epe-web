import { useState } from "react";
import { Save, Sprout, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import InputField from "@/shared/components/InputField";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Button } from "@/shared/components/ui/button";
import {
    EMPTY_DATOS_AGRONOMICOS,
    toDatosAgronomicos,
    toFormValues,
    validateDatosAgronomicos,
    type DatosAgronomicos,
    type DatosAgronomicosErrors,
    type DatosAgronomicosField,
    type DatosAgronomicosFormValues,
} from "@/modules/providers/providerAgronomico.utils";

interface ProviderAgronomicoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Nombre del proveedor dueño de los datos, se muestra bajo el título */
    providerName: string;
    /** Datos ya guardados: con ellos el modal pasa de "agregar" a "actualizar" y abre el formulario cargado */
    savedData?: DatosAgronomicos;
    onSave: (datos: DatosAgronomicos) => void;
}

/** Datos agronómicos del proveedor: se agregan tras una visita y después se pueden actualizar. */
export default function ProviderAgronomicoModal({ open, onOpenChange, providerName, savedData, onSave }: ProviderAgronomicoModalProps) {
    const isUpdate = savedData !== undefined;
    const [values, , set] = useModalForm<DatosAgronomicosFormValues>(open, savedData ? toFormValues(savedData) : EMPTY_DATOS_AGRONOMICOS);
    const [errors, setErrors] = useState<DatosAgronomicosErrors>({});

    useResetOnToggle(open, () => setErrors({}));

    const bind = (field: DatosAgronomicosField) => ({
        id: `agronomico-${field}`,
        required: true,
        required: true,
        value: values[field],
        error: errors[field],
        onChange: (next: string) => {
            set(field)(next);
            setErrors((current) => ({ ...current, [field]: undefined }));
        },
    });

    const handleSave = () => {
        const nextErrors = validateDatosAgronomicos(values);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        onSave(toDatosAgronomicos(values));
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Sprout size={22} strokeWidth={2} />}
            title={isUpdate ? "Actualizar datos agronómicos" : "Agregar datos agronómicos"}
            description={providerName}
            className="sm:max-w-180"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSave}>
                        <Save size={20} strokeWidth={2.5} /> {isUpdate ? "Guardar cambios" : "Guardar datos"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-5">
                <InputField {...bind("nombre")} label="Nombre o referencia" placeholder="Ej. Plan 2026, Lote norte" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InputField {...bind("densidadPlantacion")} label="Densidad de plantación" placeholder="0.00" step="0.001" />
                    <InputField {...bind("distanciamiento")} label="Distanciamiento" placeholder="0.00" step="0.001" unit="m" />
                    <InputField {...bind("frecuenciaRiego")} label="Frecuencia de riego" placeholder="0" step="1" unit="/día" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField {...bind("nombreAplicacion")} label="Nombre de aplicación" placeholder="Ej. Fertilizante X" />
                    <InputField {...bind("aplicacionesAlAno")} label="Aplicaciones al año" placeholder="0" step="1" unit="/año" />
                </div>
            </div>
        </AppModal>
    );
}
