import { X, Save, Truck, Ruler, Weight, Box } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import FormSection from "@/shared/components/FormSection";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel, FieldDescription } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/shared/components/ui/input-group";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import type { Carrier } from "@/modules/carriers/carriers.data";

export interface VehicleFormValues {
    placa: string;
    ancho: string;
    altura: string;
    profundidad: string;
    pesoNeto: string;
    pesoBruto: string;
}

const EMPTY_VEHICLE: VehicleFormValues = {
    placa: "", ancho: "", altura: "", profundidad: "", pesoNeto: "", pesoBruto: "",
};

interface CarrierVehicleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    carrier: Carrier | null;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<VehicleFormValues>;
}

const INPUT_GROUP_CLASS =
    "h-11 rounded-lg border-border bg-transparent shadow-none transition-colors has-[[data-slot=input-group-control]:focus-visible]:border-brand has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-brand/30";

interface UnitFieldProps {
    label: string;
    unit: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    placeholder?: string;
}

/** Campo numérico con la unidad pegada al final: la unidad va en el recuadro y no en la etiqueta */
function UnitField({ label, unit, value, onChange, readOnly, placeholder = "0.00" }: UnitFieldProps) {
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup className={INPUT_GROUP_CLASS}>
                <InputGroupInput
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder={placeholder}
                    value={value}
                    readOnly={readOnly}
                    onChange={(e) => onChange(e.target.value)}
                />
                <InputGroupAddon align="inline-end" className="pr-4">
                    <InputGroupText className="font-semibold text-ink-muted">{unit}</InputGroupText>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    );
}

/** Volumen interno = ancho × altura × profundidad; vacío mientras falte alguna medida */
function computeVolume({ ancho, altura, profundidad }: VehicleFormValues) {
    const [w, h, d] = [ancho, altura, profundidad].map(Number);
    if (!ancho || !altura || !profundidad || [w, h, d].some((n) => Number.isNaN(n))) return "";
    return (w * h * d).toFixed(2);
}

export default function CarrierVehicleModal({ open, onOpenChange, onSuccess, carrier, mode = "create", initialValues }: CarrierVehicleModalProps) {
    const isEdit = mode === "edit";
    const [values, , set] = useModalForm<VehicleFormValues>(open, { ...EMPTY_VEHICLE, ...initialValues });

    if (!carrier) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Truck size={22} strokeWidth={2} />}
            title={isEdit ? "Editar Vehículo" : "Registrar Vehículo"}
            description={`Datos técnicos del vehículo de ${carrier.nombre}.`}
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" disabled={!values.placa.trim()} onClick={() => (onSuccess ? onSuccess() : onOpenChange(false))}>
                        <Save size={20} strokeWidth={2.5} /> Guardar vehículo
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <FormSection icon={<Truck size={16} strokeWidth={2.5} />} title="Identificación">
                    <Field className="sm:max-w-1/2">
                        <FieldLabel>Placa</FieldLabel>
                        <Input
                            placeholder="ABC-123"
                            maxLength={8}
                            value={values.placa}
                            onChange={(e) => set("placa")(e.target.value.toUpperCase())}
                            className="uppercase"
                        />
                    </Field>
                </FormSection>

                <Separator />

                <FormSection icon={<Ruler size={16} strokeWidth={2.5} />} title="Dimensiones de la carga">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        <UnitField label="Ancho" unit="m" value={values.ancho} onChange={set("ancho")} />
                        <UnitField label="Altura" unit="m" value={values.altura} onChange={set("altura")} />
                        <UnitField label="Profundidad" unit="m" value={values.profundidad} onChange={set("profundidad")} />
                    </div>
                    <Field className="sm:max-w-1/2">
                        <FieldLabel className="gap-1.5"><Box size={14} strokeWidth={2.5} className="text-brand" /> Volumen</FieldLabel>
                        <InputGroup className={INPUT_GROUP_CLASS}>
                            <InputGroupInput readOnly tabIndex={-1} placeholder="0.00" value={computeVolume(values)} />
                            <InputGroupAddon align="inline-end" className="pr-4">
                                <InputGroupText className="font-semibold text-ink-muted">m³</InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription className="text-[12px]">Se calcula automáticamente con las tres medidas.</FieldDescription>
                    </Field>
                </FormSection>

                <Separator />

                <FormSection icon={<Weight size={16} strokeWidth={2.5} />} title="Capacidad de peso">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <UnitField label="Peso neto" unit="t" value={values.pesoNeto} onChange={set("pesoNeto")} />
                        <UnitField label="Peso bruto" unit="t" value={values.pesoBruto} onChange={set("pesoBruto")} />
                    </div>
                </FormSection>
            </div>
        </AppModal>
    );
}
