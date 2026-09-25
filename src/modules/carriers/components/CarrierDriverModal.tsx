import type { ComponentType } from "react";
import { X, Save, UserRound, Phone, Mail } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import type { Carrier } from "@/modules/carriers/carriers.data";

export interface DriverFormValues {
    nombre: string;
    telefono: string;
    correo: string;
}

const EMPTY_DRIVER: DriverFormValues = { nombre: "", telefono: "", correo: "" };

interface CarrierDriverModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (values: DriverFormValues) => void | Promise<void>;
    carrier: Carrier | null;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<DriverFormValues>;
}

interface IconFieldProps {
    label: string;
    icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    className?: string;
}

/** Campo con un ícono al inicio del recuadro; se pinta de verde cuando tiene valor */
function IconField({ label, icon: Icon, value, onChange, type, placeholder, className }: IconFieldProps) {
    return (
        <Field className={className}>
            <FieldLabel>{label}</FieldLabel>
            <div className="relative">
                <Icon
                    size={18}
                    strokeWidth={2}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${value ? "text-brand" : "text-ink-muted"}`}
                />
                <Input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
            </div>
        </Field>
    );
}

export default function CarrierDriverModal({ open, onOpenChange, onSuccess, carrier, mode = "create", initialValues }: CarrierDriverModalProps) {
    const isEdit = mode === "edit";
    const [values, , set] = useModalForm<DriverFormValues>(open, { ...EMPTY_DRIVER, ...initialValues });

    if (!carrier) return null;

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<UserRound size={22} strokeWidth={2} />}
            title={isEdit ? "Editar Chofer" : "Registrar Chofer"}
            description={`Chofer de ${carrier.nombre}. Se vincula directamente a un vehículo.`}
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" disabled={!values.nombre.trim()} onClick={() => (onSuccess ? void Promise.resolve(onSuccess(values)).catch(() => undefined) : onOpenChange(false))}>
                        <Save size={20} strokeWidth={2.5} /> Guardar chofer
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <IconField
                    className="sm:col-span-2"
                    label="Nombre completo"
                    icon={UserRound}
                    placeholder="Nombres y apellidos"
                    value={values.nombre}
                    onChange={set("nombre")}
                />
                <IconField
                    label="Teléfono"
                    icon={Phone}
                    type="tel"
                    placeholder="987 654 321"
                    value={values.telefono}
                    onChange={set("telefono")}
                />
                <IconField
                    label="Correo"
                    icon={Mail}
                    type="email"
                    placeholder="chofer@correo.com"
                    value={values.correo}
                    onChange={set("correo")}
                />
            </div>
        </AppModal>
    );
}
