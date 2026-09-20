import { useState } from "react";
import { X, AlertCircle, Save, Sprout } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import RemovableChip from "@/shared/components/RemovableChip";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

export interface CampaignFormValues {
    nombre: string;
    inicio: string;
    fin: string;
    kilos: string;
    fruta: string;
    variedades: string[];
}

const EMPTY_CAMPAIGN: CampaignFormValues = {
    nombre: "", inicio: "", fin: "", kilos: "", fruta: "", variedades: [],
};

/** Variedades que se sugieren solas al elegir la fruta principal. */
const DERIVED_BY_FRUIT: Record<string, string[]> = {
    Mango: ["Mango Kent", "Mango Edward", "Mango Haden"],
};

/** Opción deliberadamente mal escrita: sirve para mostrar la validación del campo. */
const MALFORMED_FRUIT = "Mngo ";

interface CampaignFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** "create" arranca vacío; "edit" arranca con `initialValues` y cambia los textos */
    mode?: "create" | "edit";
    initialValues?: Partial<CampaignFormValues>;
}

/** Alta y edición de una campaña: mismos campos, solo cambian los textos y los valores iniciales. */
export default function CampaignFormModal({
    open,
    onOpenChange,
    onSuccess,
    mode = "create",
    initialValues,
}: CampaignFormModalProps) {
    const isEdit = mode === "edit";
    // Al abrir y al cerrar vuelve a los valores de origen: en alta queda vacío, en edición carga la campaña
    const [values, setValues, set] = useModalForm<CampaignFormValues>(open, { ...EMPTY_CAMPAIGN, ...initialValues });
    const [fruitError, setFruitError] = useState<string | null>(null);
    useResetOnToggle(open, () => setFruitError(null));

    /** Al elegir fruta se suman sus variedades conocidas, sin repetir las que ya estaban. */
    const handleFruitChange = (fruit: string | null) => {
        if (fruit === MALFORMED_FRUIT) {
            setFruitError("La fruta seleccionada no es válida o está mal escrita.");
            setValues((current) => ({ ...current, fruta: "" }));
            return;
        }
        setFruitError(null);
        setValues((current) => {
            const derived = DERIVED_BY_FRUIT[fruit ?? ""] ?? [];
            return {
                ...current,
                fruta: fruit ?? "",
                variedades: [...current.variedades, ...derived.filter((d) => !current.variedades.includes(d))],
            };
        });
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Editar Campaña" : "Nueva Campaña"}
            description={isEdit
                ? "Modifica la información de la campaña existente."
                : "Completa la información para registrar una nueva campaña."}
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={onSuccess}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> Guardar</>
                            : <><Sprout size={20} strokeWidth={2.5} /> Crear Campaña</>}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <Field>
                    <FieldLabel>Nombre de Campaña:</FieldLabel>
                    <Input
                        placeholder="Ej: Campaña Mango 2026"
                        value={values.nombre}
                        onChange={(e) => set("nombre")(e.target.value)}
                    />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>Fecha Inicio:</FieldLabel>
                        <Input type="date" value={values.inicio} onChange={(e) => set("inicio")(e.target.value)} />
                    </Field>
                    <Field>
                        <FieldLabel>Fecha Fin:</FieldLabel>
                        <Input type="date" value={values.fin} onChange={(e) => set("fin")(e.target.value)} />
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field data-invalid={fruitError ? true : undefined}>
                        <FieldLabel>Seleccionar Fruta:</FieldLabel>
                        <Select value={values.fruta} onValueChange={handleFruitChange}>
                            <SelectTrigger
                                className={`w-full ${fruitError ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : ""}`}
                            >
                                <SelectValue placeholder="Seleccionar Fruta" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Mango">Mango</SelectItem>
                                {/* Solo en edición, que es donde se demuestra la validación del catálogo */}
                                {isEdit && (
                                    <SelectItem value={MALFORMED_FRUIT} className="text-destructive font-medium">
                                        Mngo marron (Mal escrito)
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>

                        {/* El contenedor queda montado siempre para poder animar la aparición del error */}
                        <div className={`transition-all duration-300 overflow-hidden ${fruitError ? "opacity-100 max-h-10" : "opacity-0 max-h-0"}`}>
                            <FieldError className="flex items-center gap-2 text-[13px] font-medium">
                                <AlertCircle size={14} /> {fruitError}
                            </FieldError>
                        </div>
                    </Field>

                    <Field>
                        <FieldLabel>Requerimientos Comerciales:</FieldLabel>
                        <div className="relative">
                            <Input
                                placeholder="Ej: 3000"
                                value={values.kilos}
                                onChange={(e) => set("kilos")(e.target.value)}
                                className="pr-12"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-surface text-brand text-[11px] font-bold px-2 py-1 rounded-md">
                                KG
                            </div>
                        </div>
                    </Field>
                </div>

                {/* Variedades derivadas: informativo, se puede quitar cualquiera */}
                <div className={`transition-all duration-300 ${values.variedades.length > 0 ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
                    <Field>
                        <FieldLabel>Frutas derivadas seleccionadas:</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                            {values.variedades.map((fruit) => (
                                <RemovableChip
                                    key={fruit}
                                    label={fruit}
                                    onRemove={() => set("variedades")(values.variedades.filter((f) => f !== fruit))}
                                />
                            ))}
                        </div>
                    </Field>
                </div>
            </div>
        </AppModal>
    );
}
