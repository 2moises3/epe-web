import { X, Truck, Save, Building2 } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export interface CarrierFormValues {
    nombre: string;
    numero: string;
    correo: string;
    ruc: string;
}

const EMPTY_CARRIER: CarrierFormValues = {
    nombre: "", numero: "", correo: "", ruc: "",
};

interface CarrierFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (values: CarrierFormValues) => void | Promise<void>;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<CarrierFormValues>;
}

/** Alta y edición de una empresa de transporte: mismos campos, solo cambian los textos y los valores iniciales. */
export default function CarrierFormModal({
    open,
    onOpenChange,
    onSuccess,
    mode = "create",
    initialValues,
}: CarrierFormModalProps) {
    const isEdit = mode === "edit";
    // Al abrir y al cerrar vuelve a los valores de origen: en alta queda vacío, en edición carga la empresa
    const [values, , set] = useModalForm<CarrierFormValues>(open, { ...EMPTY_CARRIER, ...initialValues });

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Building2 size={22} strokeWidth={2} />}
            title={isEdit ? "Editar Empresa de Transporte" : "Agregar Empresa de Transporte"}
            description={isEdit
                ? "Modifica la información de la empresa de transporte."
                : "Completa la información para registrar una nueva empresa de transporte."}
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={() => { void (async () => { try { await onSuccess?.(values); } catch { /* Error mostrado por la página contenedora. */ } })(); }}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> Guardar</>
                            : <><Truck size={20} strokeWidth={2.5} /> Crear Empresa</>}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Field className="sm:col-span-2">
                    <FieldLabel>Nombre de la Empresa:</FieldLabel>
                    <Input value={values.nombre} onChange={(e) => set("nombre")(e.target.value)} />
                </Field>

                <Field>
                    <FieldLabel>RUC:</FieldLabel>
                    <Input value={values.ruc} onChange={(e) => set("ruc")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Número:</FieldLabel>
                    <Input value={values.numero} onChange={(e) => set("numero")(e.target.value)} />
                </Field>

                <Field className="sm:col-span-2">
                    <FieldLabel>Correo:</FieldLabel>
                    <Input type="email" value={values.correo} onChange={(e) => set("correo")(e.target.value)} />
                </Field>
            </div>
        </AppModal>
    );
}
