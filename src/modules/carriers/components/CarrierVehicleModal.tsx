import { X, Save, Truck, Box } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import ModalSection from "@/shared/components/ModalSection";
import { useModalForm } from "@/shared/hooks/useModalForm";
import InputField from "@/shared/components/InputField";
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
    onSuccess?: (values: VehicleFormValues) => void | Promise<void>;
    carrier: Carrier | null;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<VehicleFormValues>;
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
                    <Button size="xl" disabled={!values.placa.trim()} onClick={() => (onSuccess ? void Promise.resolve(onSuccess(values)).catch(() => undefined) : onOpenChange(false))}>
                        <Save size={20} strokeWidth={2.5} /> Guardar vehículo
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <ModalSection title="Identificación">
                    <InputField
                        id="vehicle-placa"
                        label="Placa"
                        placeholder="ABC-123"
                        maxLength={8}
                        value={values.placa}
                        onChange={(value) => set("placa")(value.toUpperCase())}
                        inputClassName="uppercase"
                        className="sm:max-w-1/2"
                    />
                </ModalSection>

                <Separator />

                <ModalSection title="Dimensiones de la carga">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        <InputField id="vehicle-ancho" label="Ancho" unit="m" step="any" min={0} placeholder="0.00" value={values.ancho} onChange={set("ancho")} />
                        <InputField id="vehicle-altura" label="Altura" unit="m" step="any" min={0} placeholder="0.00" value={values.altura} onChange={set("altura")} />
                        <InputField id="vehicle-profundidad" label="Profundidad" unit="m" step="any" min={0} placeholder="0.00" value={values.profundidad} onChange={set("profundidad")} />
                    </div>
                    <InputField
                        id="vehicle-volumen"
                        label={<><Box size={14} strokeWidth={2.5} className="text-brand" /> Volumen</>}
                        unit="m³"
                        placeholder="0.00"
                        value={computeVolume(values)}
                        readOnly
                        hint="Se calcula automáticamente con las tres medidas."
                        className="sm:max-w-1/2"
                    />
                </ModalSection>

                <Separator />

                <ModalSection title="Capacidad de peso">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <InputField id="vehicle-peso-neto" label="Peso neto" unit="t" step="any" min={0} placeholder="0.00" value={values.pesoNeto} onChange={set("pesoNeto")} />
                        <InputField id="vehicle-peso-bruto" label="Peso bruto" unit="t" step="any" min={0} placeholder="0.00" value={values.pesoBruto} onChange={set("pesoBruto")} />
                    </div>
                </ModalSection>
            </div>
        </AppModal>
    );
}
