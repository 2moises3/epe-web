import { X, UserPlus, Save } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

export interface ClientFormValues {
    name: string;
    empresa: string;
    telefono: string;
    ruc: string;
    email: string;
    ubicacion: string;
    tipo: string;
}

const EMPTY_CLIENT: ClientFormValues = {
    name: "", empresa: "", telefono: "", ruc: "", email: "", ubicacion: "", tipo: "",
};

interface ClientFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<ClientFormValues>;
}

/** Alta y edición de un cliente: mismos campos, solo cambian los textos y los valores iniciales. */
export default function ClientFormModal({
    open,
    onOpenChange,
    onSuccess,
    mode = "create",
    initialValues,
}: ClientFormModalProps) {
    const isEdit = mode === "edit";
    // Al abrir y al cerrar vuelve a los valores de origen: en alta queda vacío, en edición carga el cliente
    const [values, , set] = useModalForm<ClientFormValues>(open, { ...EMPTY_CLIENT, ...initialValues });

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Editar Cliente" : "Registrar Cliente"}
            description={isEdit
                ? "Modifica la información del cliente existente."
                : "Completa la información para registrar un nuevo cliente."}
            className="sm:max-w-162.5"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> Guardar</>
                            : <><UserPlus size={20} strokeWidth={2.5} /> Crear Cliente</>}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Field className="sm:col-span-2">
                    <FieldLabel>Nombres Completos:</FieldLabel>
                    <Input value={values.name} onChange={(e) => set("name")(e.target.value)} />
                </Field>

                <Field>
                    <FieldLabel>Empresa:</FieldLabel>
                    <Input value={values.empresa} onChange={(e) => set("empresa")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Teléfono:</FieldLabel>
                    <Input value={values.telefono} onChange={(e) => set("telefono")(e.target.value)} />
                </Field>

                <Field>
                    <FieldLabel>RUC:</FieldLabel>
                    <Input value={values.ruc} onChange={(e) => set("ruc")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Correo Corporativo:</FieldLabel>
                    <Input value={values.email} onChange={(e) => set("email")(e.target.value)} />
                </Field>

                <Field>
                    <FieldLabel>Ubicación:</FieldLabel>
                    <Input value={values.ubicacion} onChange={(e) => set("ubicacion")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Tipo de Cliente:</FieldLabel>
                    <Select value={values.tipo} onValueChange={(v) => set("tipo")(v ?? "")}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mayorista">Mayorista</SelectItem>
                            <SelectItem value="minorista">Minorista</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
            </div>
        </AppModal>
    );
}
