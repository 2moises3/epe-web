import { Upload, X, UserPlus, Save } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import RemovableChip from "@/shared/components/RemovableChip";
import { useModalForm } from "@/shared/hooks/useModalForm";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

export interface ProviderFormValues {
    nombres: string;
    apellidos: string;
    tipoDoc: string;
    dni: string;
    zona: string;
    fechaRevision: string;
    codigo: string;
    telefono: string;
    email: string;
    frutas: string[];
}

const EMPTY_PROVIDER: ProviderFormValues = {
    nombres: "", apellidos: "", tipoDoc: "", dni: "", zona: "",
    fechaRevision: "", codigo: "", telefono: "", email: "", frutas: [],
};

const DERIVED_FRUITS = ["Mango Kent", "Mango Edward"];

interface ProviderFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<ProviderFormValues>;
}

/** Botón que ofrece adjuntar por link o por archivo. Se repite para DNI y certificado. */
function AttachMenu({ label }: { label: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button type="button" variant="outline" size="xl" className="border-dashed border-brand-border text-ink-body hover:border-brand hover:text-brand hover:bg-brand-surface flex gap-2 shadow-none w-full">
                        <Upload size={16} />
                        {label}
                    </Button>
                }
            />
            <DropdownMenuContent align="center" className="w-45 rounded-lg p-1">
                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5">
                    Link
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer text-[13.5px] font-medium justify-center py-2.5 text-ink-muted border-t border-border mt-1">
                    Archivo
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Alta y edición de un proveedor: mismos campos, solo cambian los textos y los valores iniciales. */
export default function ProviderFormModal({
    open,
    onOpenChange,
    onSuccess,
    mode = "create",
    initialValues,
}: ProviderFormModalProps) {
    const isEdit = mode === "edit";
    // Al abrir y al cerrar vuelve a los valores de origen: en alta queda vacío, en edición carga el proveedor
    const [values, , set] = useModalForm<ProviderFormValues>(open, { ...EMPTY_PROVIDER, ...initialValues });

    const addFruit = (fruit: string | null) => {
        if (!fruit || values.frutas.includes(fruit)) return;
        set("frutas")([...values.frutas, fruit]);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<UserPlus size={22} strokeWidth={2} />}
            title={isEdit ? "Editar Proveedor" : "Registrar Proveedor"}
            description={isEdit
                ? "Modifica la información del proveedor existente."
                : "Completa la información para registrar un nuevo proveedor."}
            className="sm:max-w-225"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> Guardar</>
                            : <><UserPlus size={20} strokeWidth={2.5} /> Crear Proveedor</>}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Field>
                    <FieldLabel>Nombres:</FieldLabel>
                    <Input value={values.nombres} onChange={(e) => set("nombres")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Apellidos:</FieldLabel>
                    <Input value={values.apellidos} onChange={(e) => set("apellidos")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Tipo de Documento:</FieldLabel>
                    <Select value={values.tipoDoc} onValueChange={(v) => set("tipoDoc")(v ?? "")}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dni">DNI</SelectItem>
                            <SelectItem value="ce">CE</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel>DNI:</FieldLabel>
                    <Input value={values.dni} onChange={(e) => set("dni")(e.target.value)} />
                </Field>

                <Field>
                    <FieldLabel>Zona:</FieldLabel>
                    <Input value={values.zona} onChange={(e) => set("zona")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Fecha Revision SENASA:</FieldLabel>
                    <Input type="date" value={values.fechaRevision} onChange={(e) => set("fechaRevision")(e.target.value)} />
                </Field>
                <Field className="sm:col-span-2">
                    <FieldLabel>Frutas derivadas:</FieldLabel>
                    <Select value="" onValueChange={addFruit}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar fruta derivada" />
                        </SelectTrigger>
                        <SelectContent>
                            {DERIVED_FRUITS.map((fruit) => (
                                <SelectItem key={fruit} value={fruit}>{fruit}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field>
                    <FieldLabel>Codigo Proveedor:</FieldLabel>
                    <Input value={values.codigo} onChange={(e) => set("codigo")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Teléfono:</FieldLabel>
                    <Input value={values.telefono} onChange={(e) => set("telefono")(e.target.value)} />
                </Field>
                <Field>
                    <FieldLabel>Email:</FieldLabel>
                    <Input value={values.email} onChange={(e) => set("email")(e.target.value)} />
                </Field>
                <Field className="row-span-2">
                    <FieldLabel>Frutas seleccionadas:</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        {values.frutas.map((fruit) => (
                            <RemovableChip
                                key={fruit}
                                label={fruit}
                                onRemove={() => set("frutas")(values.frutas.filter((f) => f !== fruit))}
                            />
                        ))}
                    </div>
                </Field>

                <div className="flex flex-col justify-end">
                    <AttachMenu label="Adjuntar archivo DNI" />
                </div>
                <div className="flex flex-col justify-end">
                    <AttachMenu label="Certificado Nacional" />
                </div>
            </div>
        </AppModal>
    );
}
