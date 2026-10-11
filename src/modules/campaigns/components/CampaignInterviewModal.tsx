import { useState } from "react";
import { MapPin, X, Save, ClipboardList } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import ModalSection from "@/shared/components/ModalSection";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import InputField from "@/shared/components/InputField";
import { Button } from "@/shared/components/ui/button";
import {
    EMPTY_INTERVIEW,
    validateInterview,
    type InterviewErrors,
    type InterviewField,
    type InterviewValues,
} from "@/modules/campaigns/campaignInterview";

interface CampaignInterviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Nombre del proveedor entrevistado, se muestra bajo el título */
    providerName?: string;
    /** Informe ya registrado: al abrirse el formulario carga estos datos para consultarlos o corregirlos */
    initialValues?: InterviewValues;
    isViewOnly?: boolean;
    onSave?: (values: InterviewValues) => void;
}

export default function CampaignInterviewModal({ open, onOpenChange, providerName, initialValues, isViewOnly, onSave }: CampaignInterviewModalProps) {
    const [values, , set] = useModalForm<InterviewValues>(open, initialValues ?? EMPTY_INTERVIEW);
    const [errors, setErrors] = useState<InterviewErrors>({});
    const isEditing = initialValues !== undefined;

    useResetOnToggle(open, () => setErrors({}));

    const bind = (field: InterviewField) => ({
        id: `interview-${field}`,
        value: values[field],
        error: errors[field],
        onChange: (next: string) => {
            set(field)(next);
            setErrors((current) => ({ ...current, [field]: undefined }));
        },
        readOnly: isViewOnly,
    });

    const handleSave = () => {
        const nextErrors = validateInterview(values);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        if (onSave) onSave(values);
        else onOpenChange(false);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<ClipboardList size={22} strokeWidth={2} />}
            title={isViewOnly ? "Detalles de la Entrevista" : isEditing ? "Editar Entrevista" : "Informe de Entrevista"}
            description={providerName ?? "Registra los datos de la finca del productor."}
            className="sm:max-w-275"
            footer={
                isViewOnly ? (
                    <Button size="xl" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                            <X size={20} strokeWidth={2.5} /> Cancelar
                        </Button>
                        <Button size="xl" onClick={handleSave}>
                            <Save size={20} strokeWidth={2.5} /> {isEditing ? "Guardar cambios" : "Guardar entrevista"}
                        </Button>
                    </>
                )
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-12">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-8 lg:border-r lg:border-border lg:pr-12">
                    <ModalSection title="Datos del cultivo">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField variant="compact" min={0} {...bind("densidadPlantacion")} label="Densidad plantación" placeholder="0.00" step="0.001" />
                            <InputField variant="compact" min={0} {...bind("distanciamiento")} label="Distanciamiento" placeholder="0.00" step="0.001" unit="m" />
                        </div>

                        <InputField variant="compact" min={0} {...bind("frecuenciaRiego")} label="Frecuencia de riego (Cantidad / día)" placeholder="40" step="1" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField variant="compact" min={0} {...bind("haTotalFinca")} label="Ha total finca" placeholder="0" step="0.01" />
                            <InputField variant="compact" min={0} {...bind("haCultivo")} label="Ha del cultivo" placeholder="0" step="0.01" unit="ha" />
                        </div>
                    </ModalSection>

                    <ModalSection title="Fertilización">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField variant="compact" {...bind("nombreAplicacion")} label="Nombre de aplicación" placeholder="Fertilizante X" />
                            <InputField variant="compact" min={0} {...bind("aplicacionesAlAno")} label="Aplicaciones al año" placeholder="3" step="1" unit="/año" />
                        </div>
                    </ModalSection>
                </div>

                {/* Columna derecha */}
                <ModalSection title="Ubicación">
                    <div className="grid grid-cols-3 gap-3">
                        <InputField variant="compact" {...bind("departamento")} label="Departamento" placeholder="Piura" />
                        <InputField variant="compact" {...bind("provincia")} label="Provincia" placeholder="Sullana" />
                        <InputField variant="compact" {...bind("distrito")} label="Distrito" placeholder="Marcavelica" />
                    </div>

                    {/* Mapa ilustrativo: el selector de ubicación real llega con el servicio de mapas */}
                    <div className="h-50 w-full rounded-2xl border-brand-surface bg-brand-surface/20 overflow-hidden relative mt-2 flex flex-col items-center justify-center gap-2">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                        <div className="relative z-10 w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center" style={{ color: "var(--brand-gradient-mid)" }}>
                            <MapPin size={24} strokeWidth={2.5} />
                        </div>
                        <span className="relative z-10 text-[13px] font-bold text-brand">Mapa de ubicación</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <InputField variant="compact" {...bind("latitud")} label="Latitud" placeholder="-5.1945" step="0.0000001" />
                        <InputField variant="compact" {...bind("longitud")} label="Longitud" placeholder="-80.6328" step="0.0000001" />
                    </div>
                </ModalSection>
            </div>
        </AppModal>
    );
}
