import { useState, type ReactNode } from "react";
import { MapPin, Sprout, Leaf, X, Save, ClipboardList } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
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
    onSave?: (values: InterviewValues) => void;
}

interface InputFieldProps {
    id: InterviewField;
    label: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "number";
    step?: string;
    /** Unidad que se dibuja dentro del campo, a la derecha */
    unit?: string;
    compact?: boolean;
}

function InterviewInput({ id, label, value, error, onChange, placeholder, type, step, unit, compact }: InputFieldProps) {
    const inputId = `interview-${id}`;
    const input = (
        <Input
            id={inputId}
            type={type ?? "text"}
            inputMode={type === "number" ? "decimal" : undefined}
            step={step}
            min={type === "number" && id !== "latitud" && id !== "longitud" ? 0 : undefined}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`${compact ? "text-[13px]" : ""} ${unit ? "pr-12" : ""}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
        />
    );
    return (
        <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={inputId} variant="compact" className={compact ? "text-[10px]" : undefined}>{label}</FieldLabel>
            {unit ? (
                <div className="relative">
                    {input}
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-ink">{unit}</span>
                </div>
            ) : input}
            {error && <FieldError id={`${inputId}-error`}>{error}</FieldError>}
        </Field>
    );
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-brand pb-2 border-b border-border">
            {icon}
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-brand">{children}</h3>
        </div>
    );
}

export default function CampaignInterviewModal({ open, onOpenChange, providerName, initialValues, onSave }: CampaignInterviewModalProps) {
    const [values, , set] = useModalForm<InterviewValues>(open, initialValues ?? EMPTY_INTERVIEW);
    const [errors, setErrors] = useState<InterviewErrors>({});
    const isEditing = initialValues !== undefined;

    useResetOnToggle(open, () => setErrors({}));

    const bind = (field: InterviewField) => ({
        id: field,
        value: values[field],
        error: errors[field],
        onChange: (next: string) => {
            set(field)(next);
            setErrors((current) => ({ ...current, [field]: undefined }));
        },
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
            title="Informe de Entrevista"
            description={providerName ?? "Registra los datos de la finca del productor."}
            className="sm:max-w-275"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSave}>
                        <Save size={20} strokeWidth={2.5} /> {isEditing ? "Guardar cambios" : "Guardar entrevista"}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-12">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-8 lg:border-r lg:border-border lg:pr-12">
                    <div className="flex flex-col gap-5">
                        <SectionTitle icon={<Sprout size={18} strokeWidth={2.5} />}>Datos del cultivo</SectionTitle>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InterviewInput {...bind("densidadPlantacion")} label="Densidad plantación" placeholder="0.00" type="number" step="0.001" />
                            <InterviewInput {...bind("distanciamiento")} label="Distanciamiento" placeholder="0.00" type="number" step="0.001" unit="m" />
                        </div>

                        <InterviewInput {...bind("frecuenciaRiego")} label="Frecuencia de riego (Cantidad / día)" placeholder="40" type="number" step="1" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InterviewInput {...bind("haTotalFinca")} label="Ha total finca" placeholder="0" type="number" step="0.01" />
                            <InterviewInput {...bind("haCultivo")} label="Ha del cultivo" placeholder="0" type="number" step="0.01" unit="ha" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-5">
                        <SectionTitle icon={<Leaf size={18} strokeWidth={2.5} />}>Fertilización</SectionTitle>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InterviewInput {...bind("nombreAplicacion")} label="Nombre de aplicación" placeholder="Fertilizante X" />
                            <InterviewInput {...bind("aplicacionesAlAno")} label="Aplicaciones al año" placeholder="3" type="number" step="1" unit="/año" />
                        </div>
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="flex flex-col gap-5">
                    <SectionTitle icon={<MapPin size={18} strokeWidth={2.5} />}>Ubicación</SectionTitle>

                    <div className="grid grid-cols-3 gap-3">
                        <InterviewInput {...bind("departamento")} label="Departamento" placeholder="Piura" compact />
                        <InterviewInput {...bind("provincia")} label="Provincia" placeholder="Sullana" compact />
                        <InterviewInput {...bind("distrito")} label="Distrito" placeholder="Marcavelica" compact />
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
                        <InterviewInput {...bind("latitud")} label="Latitud" placeholder="-5.1945" type="number" step="0.0000001" />
                        <InterviewInput {...bind("longitud")} label="Longitud" placeholder="-80.6328" type="number" step="0.0000001" />
                    </div>
                </div>
            </div>
        </AppModal>
    );
}
