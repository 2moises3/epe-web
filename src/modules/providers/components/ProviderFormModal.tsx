import { useState } from "react";
import { Save, UserPlus, X, AlertCircle, Trash2, Check } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import FormField from "@/shared/components/FormField";
import InputField from "@/shared/components/InputField";
import ModalSection from "@/shared/components/ModalSection";
import { useModalForm, useResetOnToggle } from "@/shared/hooks/useModalForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import type { ProveedorInput } from "@/modules/providers/api/proveedor.dto";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import type { ProveedorField, ProveedorFieldErrors } from "@/modules/providers/api/proveedor.validation";
import { validateProveedorInput } from "@/modules/providers/api/proveedor.validation";
import { createProviderFormSession } from "@/modules/providers/api/provider-lifecycle";
import { createInFlightGuard, submitValidatedProveedor } from "@/modules/providers/api/proveedor-submission";
import FileDropzone from "@/shared/components/FileDropzone";
import { Combobox } from "@/shared/components/ui/combobox";
import { Badge } from "@/shared/components/ui/badge";
import { Toggle } from "@/shared/components/ui/toggle";
import { Empty, EmptyDescription, EmptyContent } from "@/shared/components/ui/empty";
import { uploadDocument } from "@/shared/api/uploadDocument";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES = [
    { value: "DNI", label: "DNI" },
    { value: "Pasaporte", label: "Pasaporte" },
    { value: "Carnet de extranjeria", label: "Carnet de extranjería" },
];

const SANIDAD_TYPES = [
    { value: "Sin registrar", label: "Sin registrar" },
    { value: "Registrado", label: "Registrado" },
    { value: "En proceso", label: "En proceso" },
];

const CATALOGO_FRUTAS = [
    { id: "mango", nombre: "Mango", variedades: ["Kent", "Edward", "Haden", "Tommy Atkins"] },
    { id: "uva", nombre: "Uva", variedades: ["Red Globe", "Crimson", "Autumn Royal", "Sweet Celebration"] },
    { id: "arandano", nombre: "Arándano", variedades: ["Biloxi", "Ventura", "Emerald", "Rocio"] },
    { id: "palta", nombre: "Palta", variedades: ["Hass", "Fuerte", "Zutano", "Ettinger"] },
];

interface ProviderFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "create" | "edit";
    provider?: Proveedor | null;
    mutationGuard: ReturnType<typeof createInFlightGuard>;
    onSave: (providerId: number | null, input: ProveedorInput) => Promise<Proveedor>;
}

export default function ProviderFormModal({ open, onOpenChange, mode = "create", provider, mutationGuard, onSave }: ProviderFormModalProps) {
    const isEdit = mode === "edit";
    const [values, , set] = useModalForm(open, createProviderFormSession(provider).values);
    const [errors, setErrors] = useState<ProveedorFieldErrors>({});
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fruta activa seleccionada en la columna izquierda
    const [selectedFruitDetail, setSelectedFruitDetail] = useState<string>("mango");

    useResetOnToggle(open, () => {
        setErrors({});
        setSaveError(null);
    });

    const updateField = (field: ProveedorField, value: any) => {
        set(field)(value as never);
        setErrors((current) => ({ ...current, [field]: undefined }));
        setSaveError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && mutationGuard.isInFlight) return;
        onOpenChange(nextOpen);
    };

    const handleSubmit = async () => {
        try {
            const result = await submitValidatedProveedor(
                values, 
                validateProveedorInput, 
                mutationGuard, 
                async (input) => {
                    let urlToSave = input.identidadDocUrl;
                    if (values.identidadDocArchivo) {
                        urlToSave = await uploadDocument(values.identidadDocArchivo);
                    }
                    return onSave(provider?.proveedorId ?? null, { ...input, identidadDocUrl: urlToSave });
                }, 
                () => {
                    setIsSaving(true);
                    setErrors({});
                    setSaveError(null);
                }
            );
            if (result.status === "invalid") setErrors(result.errors);
            if (result.status === "saved") onOpenChange(false);
        } catch {
            setSaveError("No se pudieron guardar los cambios. Revisa la información e intenta nuevamente.");
        } finally {
            setIsSaving(false);
        }
    };

    /** Props comunes de un campo de texto del formulario: id, valor, error y cambio enlazados al estado */
    const bind = (field: ProveedorField) => ({
        id: `provider-${field}`,
        required: true,
        value: (values[field] as string) ?? "",
        error: errors[field],
        disabled: isSaving,
        onChange: (next: string) => updateField(field, next),
    });

    // Gestión de frutas y variedades en 2 columnas
    const toggleVariety = (frutaId: string, variedad: string) => {
        const current = values.frutas || [];
        const target = current.find(f => f.frutaId === frutaId);
        if (!target) return;
        const exists = target.variedades.includes(variedad);
        const updated = current.map(f => {
            if (f.frutaId !== frutaId) return f;
            return {
                ...f,
                variedades: exists 
                    ? f.variedades.filter(v => v !== variedad)
                    : [...f.variedades, variedad]
            };
        });
        updateField("frutas", updated);
    };

    const selectAllVarieties = (frutaId: string) => {
        const cat = CATALOGO_FRUTAS.find(c => c.id === frutaId);
        if (!cat) return;
        const current = values.frutas || [];
        const updated = current.map(f => {
            if (f.frutaId !== frutaId) return f;
            return { ...f, variedades: [...cat.variedades] };
        });
        updateField("frutas", updated);
    };

    const clearVarieties = (frutaId: string) => {
        const current = values.frutas || [];
        const updated = current.map(f => {
            if (f.frutaId !== frutaId) return f;
            return { ...f, variedades: [] };
        });
        updateField("frutas", updated);
    };

    const removeFruit = (frutaId: string) => {
        const next = (values.frutas || []).filter(f => f.frutaId !== frutaId);
        updateField("frutas", next);
        if (selectedFruitDetail === frutaId && next.length > 0) {
            setSelectedFruitDetail(next[0].frutaId);
        }
    };

    const addFruit = (frutaId: string) => {
        if (!frutaId) return;
        const current = values.frutas || [];
        if (current.some(f => f.frutaId === frutaId)) return;
        const cat = CATALOGO_FRUTAS.find(c => c.id === frutaId);
        const defaultVars = cat ? [cat.variedades[0], cat.variedades[1]].filter(Boolean) : [];
        updateField("frutas", [...current, { frutaId, variedades: defaultVars }]);
        setSelectedFruitDetail(frutaId);
    };

    const availableFruitOptions = CATALOGO_FRUTAS
        .filter(c => !values.frutas?.some(f => f.frutaId === c.id))
        .map(c => ({ value: c.id, label: c.nombre }));

    const hasFruits = values.frutas && values.frutas.length > 0;
    const effectiveDetailId = values.frutas?.some(f => f.frutaId === selectedFruitDetail)
        ? selectedFruitDetail
        : values.frutas?.[0]?.frutaId ?? "";
    const activeDetailCat = CATALOGO_FRUTAS.find(c => c.id === effectiveDetailId);

    const emptyFruitState = (
        <Empty className="py-7 bg-surface-page/30 border border-dashed border-border rounded-lg">
            <EmptyContent>
                <EmptyDescription>Aún no se han asociado frutas a este proveedor.</EmptyDescription>
                <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
                    <span className="text-xs text-ink-muted">Añadir sugeridas:</span>
                    {CATALOGO_FRUTAS.map(c => (
                        <Button
                            key={c.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addFruit(c.id)}
                            className="h-7 text-xs font-semibold text-brand hover:text-brand hover:bg-brand-surface border-brand/30 hover:border-brand"
                        >
                            + {c.nombre}
                        </Button>
                    ))}
                </div>
            </EmptyContent>
        </Empty>
    );

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={isEdit ? undefined : <UserPlus size={22} strokeWidth={2.5} />}
            title={isEdit ? "Editar proveedor" : "Registrar proveedor"}
            description={isEdit ? "Modifica los datos del proveedor." : "Completa la información para registrar un nuevo proveedor."}
            className="sm:max-w-[850px]"
            footer={
                <>
                    <Button variant="outline" size="xl" disabled={isSaving} onClick={() => handleOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" disabled={isSaving} onClick={handleSubmit} aria-busy={isSaving}>
                        {isEdit
                            ? <><Save size={20} strokeWidth={2.5} /> {isSaving ? "Guardando..." : "Guardar cambios"}</>
                            : <><UserPlus size={20} strokeWidth={2.5} /> {isSaving ? "Creando..." : "Crear proveedor"}</>}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6 pt-1 pb-3">
                {saveError && (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                )}

                <ModalSection title="Datos personales">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InputField {...bind("nombres")} label="Nombres" maxLength={150} placeholder="Ej. Juan" />
                        <InputField {...bind("apellido")} label="Apellidos" maxLength={150} placeholder="Ej. Pérez García" />
                        <InputField {...bind("telefono")} label="Teléfono" type="tel" inputMode="numeric" placeholder="Ej. 987654321" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField {...bind("email")} label="Correo electrónico" type="email" maxLength={320} placeholder="correo@ejemplo.com" />
                        <InputField {...bind("zona")} label="Zona / Región" placeholder="Ej. Piura, Valle de los Incas" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <FormField id="provider-tipoDocumento" label="Tipo de documento" required className="sm:col-span-3" error={errors.tipoDocumento}>
                            <Select items={DOCUMENT_TYPES} value={(values.tipoDocumento as string) || null} onValueChange={(value) => updateField("tipoDocumento", value ?? "")} disabled={isSaving}>
                                <SelectTrigger
                                    id="provider-tipoDocumento"
                                    className="w-full"
                                    aria-invalid={errors.tipoDocumento ? true : undefined}
                                    aria-describedby={errors.tipoDocumento ? "provider-tipoDocumento-error" : undefined}
                                >
                                    <SelectValue placeholder="Selecciona..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <InputField {...bind("nmrDocumento")} label="Número de documento" className="sm:col-span-3" step="1" min={1} inputMode="numeric" placeholder="12345678" />
                        <FormField className="sm:col-span-6" error={errors.identidadDocArchivo}>
                            <FileDropzone
                                variant="horizontal"
                                label="Adjunto de identidad"
                                hint="PDF o Imagen · Máx. 10 MB"
                                file={values.identidadDocArchivo ?? null}
                                onChange={(file) => updateField("identidadDocArchivo", file)}
                                disabled={isSaving}
                            />
                        </FormField>
                    </div>
                </ModalSection>

                <ModalSection title="Información productiva">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField {...bind("codigoLugarProduccion")} label="Código de lugar de producción" step="1" min={1} inputMode="numeric" placeholder="Ej. 10452" />
                        <FormField id="provider-estadoSanidad" label="Estado de sanidad agraria" required error={errors.estadoSanidadAgraria}>
                            <Select items={SANIDAD_TYPES} value={(values.estadoSanidadAgraria as string) || null} onValueChange={(value) => updateField("estadoSanidadAgraria", value ?? "")} disabled={isSaving}>
                                <SelectTrigger
                                    id="provider-estadoSanidad"
                                    className="w-full"
                                    aria-invalid={errors.estadoSanidadAgraria ? true : undefined}
                                >
                                    <SelectValue placeholder="Seleccionar estado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SANIDAD_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-[13px] font-semibold text-ink">Catálogo de frutas y variedades</p>
                                <p className="text-[12px] text-ink-muted">Selecciona una fruta a la izquierda para gestionar sus variedades a la derecha.</p>
                            </div>
                            <div className="w-full sm:w-[260px]">
                                <Combobox
                                    options={availableFruitOptions}
                                    value=""
                                    onChange={(val) => { if (val) addFruit(val); }}
                                    placeholder={availableFruitOptions.length > 0 ? "+ Agregar fruta..." : "Todas agregadas"}
                                    emptyMessage="No hay más frutas en el catálogo"
                                    disabled={availableFruitOptions.length === 0 || isSaving}
                                />
                            </div>
                        </div>

                        {hasFruits ? (
                            <div className="grid grid-cols-1 sm:grid-cols-12 rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs min-h-[190px]">
                                {/* Columna Izquierda: Lista de frutas agregadas */}
                                <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-border/70 p-2.5 flex flex-col gap-1.5 bg-surface-page/30">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted px-2 py-1">
                                        Frutas del proveedor
                                    </span>
                                    {values.frutas.map(f => {
                                        const cat = CATALOGO_FRUTAS.find(c => c.id === f.frutaId);
                                        if (!cat) return null;
                                        const isSelected = effectiveDetailId === f.frutaId;
                                        return (
                                            <div
                                                key={f.frutaId}
                                                onClick={() => setSelectedFruitDetail(f.frutaId)}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all border text-left",
                                                    isSelected
                                                        ? "bg-card border-brand/50 text-ink shadow-xs"
                                                        : "border-transparent text-ink-body hover:bg-card/70 hover:border-border/60"
                                                )}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={cn("text-[13px]", isSelected ? "font-bold text-brand-solid" : "font-medium text-ink")}>
                                                        {cat.nombre}
                                                    </span>
                                                    <div>
                                                        <Badge variant={isSelected ? "brand" : "secondary"} className="h-4.5 text-[10.5px] px-1.5 font-semibold">
                                                            {f.variedades.length} de {cat.variedades.length} vars
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFruit(f.frutaId);
                                                    }}
                                                    className="text-ink-muted hover:text-destructive hover:bg-destructive/10"
                                                    title={`Quitar ${cat.nombre}`}
                                                >
                                                    <Trash2 size={13} strokeWidth={2.5} />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Columna Derecha: Variedades de la fruta activa */}
                                <div className="sm:col-span-7 p-4 flex flex-col justify-between">
                                    {activeDetailCat ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                                <div>
                                                    <h5 className="text-[13.5px] font-bold text-ink">Variedades de {activeDetailCat.nombre}</h5>
                                                    <p className="text-[11.5px] text-ink-muted">Marca las variedades que produce el proveedor</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => {
                                                        const activeFruta = values.frutas.find(f => f.frutaId === activeDetailCat.id);
                                                        if (!activeFruta) return;
                                                        const all = activeFruta.variedades.length === activeDetailCat.variedades.length;
                                                        if (all) clearVarieties(activeDetailCat.id);
                                                        else selectAllVarieties(activeDetailCat.id);
                                                    }}
                                                    className="h-auto p-0 text-[11.5px] text-brand hover:underline font-semibold"
                                                >
                                                    Alternar todas
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {activeDetailCat.variedades.map(v => {
                                                    const activeFruta = values.frutas.find(f => f.frutaId === activeDetailCat.id);
                                                    const isChecked = activeFruta?.variedades.includes(v) ?? false;
                                                    return (
                                                        <Toggle
                                                            key={v}
                                                            pressed={isChecked}
                                                            onPressedChange={() => toggleVariety(activeDetailCat.id, v)}
                                                            variant="outline"
                                                            size="sm"
                                                            className={cn(
                                                                "gap-1.5 rounded-lg text-[12.5px] font-medium transition-all h-8 px-2.5",
                                                                isChecked && "bg-brand/10 border-brand/40 text-brand-solid font-semibold"
                                                            )}
                                                        >
                                                            {isChecked && <Check size={13} strokeWidth={3} className="text-brand-solid" />}
                                                            {v}
                                                        </Toggle>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-ink-muted text-xs italic">
                                            Selecciona una fruta de la lista izquierda
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : emptyFruitState}
                    </div>
                </ModalSection>

            </div>
        </AppModal>
    );
}
