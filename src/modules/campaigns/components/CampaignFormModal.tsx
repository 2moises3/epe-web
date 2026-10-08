import { useEffect, useState } from "react";
import { X, AlertCircle, Save, Sprout } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import RemovableChip from "@/shared/components/RemovableChip";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { DatePicker } from "@/shared/components/ui/date-picker";
import FileDropzone from "@/shared/components/FileDropzone";
import { Button } from "@/shared/components/ui/button";
import { createCampana, getCampana, getFrutaDerivadas, getFrutas, updateCampana } from "@/modules/campaigns/api/campaign.api";
import type { CampanaEstado, FrutaDerivadaDto, FrutaDto } from "@/modules/campaigns/api/campaign.dto";
import { campaignFormSchema } from "@/modules/campaigns/api/campaign-form.schema";
import { formatFecha, parseFecha } from "@/modules/campaigns/api/fecha.util";
import { getBadRequestFieldErrors, getZodFieldErrors, type FormFieldErrors } from "@/shared/validation/api-form-errors";

interface CampaignFormValues {
    nombre: string;
    añoTemporada: string;
    frutaId: number | null;
    fechaInicio: string;
    fechaFin: string;
    requerimientoComercial: string;
    responsable: string;
    observaciones: string;
    estado: CampanaEstado;
    lineamientos: File | null;
}

const EMPTY_CAMPAIGN: CampaignFormValues = {
    nombre: "", añoTemporada: "", frutaId: null, fechaInicio: "", fechaFin: "", requerimientoComercial: "", responsable: "", observaciones: "", estado: "planificacion", lineamientos: null,
};

/** Propiedades del backend → campo del formulario, para ubicar los errores 400 debajo de cada campo */
const BACKEND_FIELDS = {
    nombre: "nombre",
    frutaId: "frutaId",
    fechaInicio: "fechaInicio",
    fechaFin: "fechaFin",
    requerimientoComercial: "requerimientoComercial",
};

interface CampaignFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** "create" arranca vacío; "edit" carga la campaña `campaniaId` desde la API y cambia los textos */
    mode?: "create" | "edit";
    campaniaId?: number | null;
}

/** Error animado bajo el campo: el contenedor queda montado para poder animar su aparición. */
function AnimatedFieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <div className="animate-in slide-in-from-top-1 fade-in duration-300">
            <FieldError className="flex items-center gap-2 text-[13px] font-medium">
                <AlertCircle size={14} className="shrink-0" /> {message}
            </FieldError>
        </div>
    );
}

/** Alta y edición de una campaña: mismos campos, solo cambian los textos y el origen de los valores. */
export default function CampaignFormModal({
    open,
    onOpenChange,
    onSuccess,
    mode = "create",
    campaniaId = null,
}: CampaignFormModalProps) {
    const isEdit = mode === "edit";
    const [values, setValues] = useState<CampaignFormValues>(EMPTY_CAMPAIGN);
    const [frutas, setFrutas] = useState<FrutaDto[]>([]);
    const [derivadas, setDerivadas] = useState<FrutaDerivadaDto[]>([]);
    const [derivadasLoading, setDerivadasLoading] = useState(false);
    const [errors, setErrors] = useState<FormFieldErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Cada apertura es una sesión nueva: vacía en alta, o con la campaña recién leída en edición
    useEffect(() => {
        if (!open) return;
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValues(EMPTY_CAMPAIGN);
        setErrors({});
        setIsLoading(isEdit);

        getFrutas()
            .then((items) => { if (active) setFrutas(items); })
            .catch(() => { if (active) setErrors((current) => ({ ...current, _form: "No se pudieron cargar las frutas." })); });

        if (isEdit && campaniaId !== null) {
            getCampana(campaniaId)
                .then((campana) => {
                    if (!active) return;
                    setValues({
                        nombre: campana.nombre,
                        frutaId: campana.frutaId,
                        fechaInicio: formatFecha(campana.fechaInicio),
                        fechaFin: formatFecha(campana.fechaFin),
                        requerimientoComercial: String(campana.requerimientoComercial),
                        estado: campana.estado,
                    });
                })
                .catch(() => { if (active) setErrors({ _form: "No se pudo cargar la campaña." }); })
                .finally(() => { if (active) setIsLoading(false); });
        }
        return () => { active = false; };
    }, [open, isEdit, campaniaId]);

    // Las frutas derivadas salen del catálogo de la fruta elegida; son informativas
    useEffect(() => {
        if (!open || values.frutaId === null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDerivadas([]);
            return;
        }
        let active = true;
        setDerivadasLoading(true);
        getFrutaDerivadas(values.frutaId)
            .then((items) => { if (active) setDerivadas(items); })
            .catch(() => { if (active) setDerivadas([]); })
            .finally(() => { if (active) setDerivadasLoading(false); });
        return () => { active = false; };
    }, [open, values.frutaId]);

    const set = <K extends keyof CampaignFormValues>(key: K, value: CampaignFormValues[K]) => {
        setValues((current) => ({ ...current, [key]: value }));
        setErrors((current) => ({ ...current, [key]: undefined, _form: undefined }));
    };

    const fruitName = (frutaId: number | null) => frutas.find((fruta) => fruta.frutaId === frutaId)?.name;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && saving) return;
        onOpenChange(nextOpen);
    };

    const handleSubmit = async () => {
        if (saving || isLoading) return;
        const validation = campaignFormSchema.safeParse({ ...values, frutaId: values.frutaId ?? 0 });
        if (!validation.success) {
            setErrors(getZodFieldErrors(validation.error));
            return;
        }
        setSaving(true);
        setErrors({});
        try {
            const input = {
                ...validation.data,
                fechaInicio: parseFecha(validation.data.fechaInicio),
                fechaFin: parseFecha(validation.data.fechaFin),
            };
            if (isEdit && campaniaId !== null) await updateCampana(campaniaId, input);
            else await createCampana(input);
            onSuccess?.();
        } catch (requestError) {
            const apiErrors = getBadRequestFieldErrors(requestError, BACKEND_FIELDS);
            // El backend nombra la fruta por su id ("La fruta 3 ya..."); se muestra con su nombre
            const name = fruitName(values.frutaId);
            if (apiErrors._form && values.frutaId !== null && name) {
                apiErrors._form = apiErrors._form.replace(`La fruta ${values.frutaId} ya`, `La fruta ${name} ya`);
            }
            setErrors(apiErrors);
        } finally {
            setSaving(false);
        }
    };

    const fruitItems = frutas.map((fruta) => ({ value: String(fruta.frutaId), label: fruta.name }));
    const invalid = (field: keyof CampaignFormValues) => (errors[field] ? true : undefined);

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<Sprout size={22} strokeWidth={2} />}
            title={isEdit ? "Editar Campaña" : "Nueva Campaña"}
            description={isEdit
                ? "Modifica la información de la campaña existente."
                : "Completa la información para registrar una nueva campaña."}
            className="sm:max-w-[800px]"
            ready={!isLoading && !derivadasLoading}
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => handleOpenChange(false)} disabled={saving}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSubmit} disabled={saving || isLoading} aria-busy={saving}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> {saving ? "Guardando..." : "Guardar"}</>
                            : <><Sprout size={20} strokeWidth={2.5} /> {saving ? "Creando..." : "Crear Campaña"}</>}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-5">
                {/* Fila 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field data-invalid={invalid("nombre")}>
                        <FieldLabel>Nombre de Campaña:</FieldLabel>
                        <Input
                            placeholder="Ej: Campaña Mango 2026"
                            value={values.nombre}
                            aria-invalid={invalid("nombre")}
                            onChange={(e) => set("nombre", e.target.value)}
                        />
                        <AnimatedFieldError message={errors.nombre} />
                    </Field>
                    <Field data-invalid={invalid("responsable")}>
                        <FieldLabel>Responsable:</FieldLabel>
                        <Input
                            placeholder="Nombre del administrador"
                            value={values.responsable}
                            aria-invalid={invalid("responsable")}
                            onChange={(e) => set("responsable", e.target.value)}
                        />
                        <AnimatedFieldError message={errors.responsable} />
                    </Field>
                </div>

                {/* Fila 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field className="sm:col-span-1" data-invalid={invalid("requerimientoComercial")}>
                        <FieldLabel>Requerimiento (KG):</FieldLabel>
                        <div className="relative">
                            <Input
                                placeholder="Ej: 3000"
                                inputMode="decimal"
                                value={values.requerimientoComercial}
                                aria-invalid={invalid("requerimientoComercial")}
                                onChange={(e) => set("requerimientoComercial", e.target.value)}
                                className="pr-12"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-surface text-brand text-[11px] font-bold px-2 py-1 rounded-md">
                                KG
                            </div>
                        </div>
                        <AnimatedFieldError message={errors.requerimientoComercial} />
                    </Field>
                    <Field className="sm:col-span-1" data-invalid={invalid("fechaInicio")}>
                        <FieldLabel>Fecha de inicio:</FieldLabel>
                        <DatePicker 
                            value={values.fechaInicio} 
                            onChange={(val) => set("fechaInicio", val)} 
                            aria-invalid={invalid("fechaInicio")}
                        />
                        <AnimatedFieldError message={errors.fechaInicio} />
                    </Field>
                    <Field className="sm:col-span-1" data-invalid={invalid("fechaFin")}>
                        <FieldLabel>Fecha de fin:</FieldLabel>
                        <DatePicker 
                            value={values.fechaFin} 
                            onChange={(val) => set("fechaFin", val)}
                            aria-invalid={invalid("fechaFin")}
                        />
                        <AnimatedFieldError message={errors.fechaFin} />
                    </Field>
                </div>

                {/* Fila 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field className="sm:col-span-1" data-invalid={invalid("añoTemporada")}>
                        <FieldLabel optional>Año o Temporada:</FieldLabel>
                        <Input
                            placeholder="Ej: 2025-2026"
                            value={values.añoTemporada}
                            aria-invalid={invalid("añoTemporada")}
                            onChange={(e) => set("añoTemporada", e.target.value)}
                        />
                        <AnimatedFieldError message={errors.añoTemporada} />
                    </Field>
                    <Field className="sm:col-span-2" data-invalid={invalid("frutaId")}>
                        <FieldLabel>Seleccionar Frutas:</FieldLabel>
                        <Select
                            items={fruitItems}
                            value={values.frutaId !== null ? String(values.frutaId) : null}
                            onValueChange={(val) => set("frutaId", val ? Number(val) : null)}
                        >
                            <SelectTrigger className="w-full" aria-invalid={invalid("frutaId")}>
                                <SelectValue placeholder="Agregar fruta..." />
                            </SelectTrigger>
                            <SelectContent>
                                {fruitItems.length === 0 ? (
                                    <SelectItem value="__sin-frutas__" disabled>No hay frutas registradas</SelectItem>
                                ) : (
                                    fruitItems.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <AnimatedFieldError message={errors.frutaId} />
                    </Field>
                </div>

                {/* Fila 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
                    <Field className="sm:col-span-1 h-full" data-invalid={invalid("lineamientos")}>
                        <FileDropzone 
                            label="Lineamientos" 
                            file={values.lineamientos} 
                            onChange={(file) => set("lineamientos", file)} 
                            hint="PDF o Imagen · Máx. 10 MB"
                        />
                        <AnimatedFieldError message={errors.lineamientos} />
                    </Field>
                    <Field className="sm:col-span-2 h-full flex flex-col">
                        <FieldLabel optional>Observaciones Generales:</FieldLabel>
                        <Textarea 
                            className="flex-1 w-full min-h-24 resize-none" 
                            placeholder="Escribe aquí las observaciones..."
                            value={values.observaciones}
                            onChange={(e) => set("observaciones", e.target.value)}
                        />
                    </Field>
                </div>

                {/* Frutas derivadas: solo se renderiza si hay derivadas o si seleccionó fruta, para evitar el 'h-0' gap padding de flex */}
                {(derivadas.length > 0 || (values.frutaId !== null && derivadasLoading)) && (
                    <Field>
                        <FieldLabel>Variedades Seleccionadas:</FieldLabel>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {derivadasLoading
                                ? <span className="text-[13px] text-ink-muted">Cargando variedades...</span>
                                : derivadas.map((derivada) => <RemovableChip key={derivada.frutaDerivadaId} label={derivada.name} />)}
                        </div>
                    </Field>
                )}
                {derivadas.length === 0 && values.frutaId !== null && !derivadasLoading && (
                    <Field>
                        <FieldLabel>Variedades Seleccionadas:</FieldLabel>
                        <p className="text-[13px] text-ink-muted mt-1">Ninguna aún.</p>
                    </Field>
                )}

                {/* Se evita renderizar <AnimatedFieldError /> vacío para que no afecte el gap-6 */}
                {Boolean(errors._form) && <AnimatedFieldError message={errors._form} />}
            </div>
        </AppModal>
    );
}
