import { useEffect, useRef, useState } from "react";
import { X, Link2, AlertCircle, UserRound, MapPin, Sprout } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import FormSection from "@/shared/components/FormSection";
import SegmentedControl from "@/shared/components/SegmentedControl";
import { Field, FieldError, FieldLabel, FieldLegend } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import { Separator } from "@/shared/components/ui/separator";
import { Textarea } from "@/shared/components/ui/textarea";
import { getProveedores } from "@/modules/providers/api/proveedor.api";
import type { Proveedor } from "@/modules/providers/api/proveedor.mapper";
import { createCampaniaProveedor, getCampaniaProveedoresByCampania } from "@/modules/campaigns/api/campania-proveedor.api";
import type { TipoProveedorCampania } from "@/modules/campaigns/api/campania-proveedor.dto";
import {
    getCampaniaProveedorDraftErrors,
    toCreateCampaniaProveedorInput,
    type CampaniaProveedorDraft,
    type CampaniaProveedorDraftErrors,
} from "@/modules/campaigns/api/campania-proveedor-form";
import { createCampaniaProveedorSubmissionController } from "@/modules/campaigns/api/campania-proveedor-submission";
import { fetchCampaignProviderOptions } from "@/modules/campaigns/api/campaign-provider-options";

interface CampaignLinkProviderModalProps {
    open: boolean;
    campaniaId?: number | null;
    onOpenChange: (open: boolean) => void;
    /** Se llama solo cuando el backend confirmó el vínculo */
    onSave?: () => void;
    /** Se llama cuando el resultado quedó incierto y conviene recargar la lista de la página */
    onRefresh?: () => void;
}

type DraftField = Exclude<keyof CampaniaProveedorDraft, "proveedorId" | "tipoProveedor"> | "frutaConvencional" | "observacionesParticipacion";
type DraftValues = Record<Exclude<keyof CampaniaProveedorDraft, "proveedorId" | "tipoProveedor">, string> & {
    frutaConvencional: string;
    observacionesParticipacion: string;
};

const EMPTY_DRAFT: DraftValues = {
    cantidadProveedor: "",
    mtdCeratitis: "",
    departamento: "",
    provincia: "",
    distrito: "",
    latitud: "",
    longitud: "",
    densidadPlantacion: "",
    distanciamiento: "",
    frecuenciaRiego: "",
    haTotalFinca: "",
    haCultivo: "",
    nombreAplicacion: "",
    aplicacionesAlAno: "",
    frutaConvencional: "",
    observacionesParticipacion: "",
};

const PROVIDER_TYPES = [
    { label: "Productor", value: "productor" },
    { label: "Acopiador", value: "acopio" },
];

/** Campos de la finca que el backend exige solo para productores, en el orden en que se muestran */
const FINCA_LOCATION: Array<{ field: DraftField; label: string; type?: "number"; step?: string; placeholder?: string; suffix?: string }> = [
    { field: "departamento", label: "Departamento", placeholder: "Ej. Piura" },
    { field: "provincia", label: "Provincia", placeholder: "Ej. Sullana" },
    { field: "distrito", label: "Distrito", placeholder: "Ej. Tambogrande" },
    { field: "latitud", label: "Latitud", type: "number", step: "0.0000001", placeholder: "Ej. -4.8392" },
    { field: "longitud", label: "Longitud", type: "number", step: "0.0000001", placeholder: "Ej. -80.3129" },
    { field: "haTotalFinca", label: "Hectáreas totales de finca", type: "number", step: "1", placeholder: "Ej. 20", suffix: "HA" },
];

const FINCA_CROP: Array<{ field: DraftField; label: string; type?: "number"; step?: string; placeholder?: string; suffix?: string }> = [
    { field: "haCultivo", label: "Hectáreas de cultivo", type: "number", step: "1", placeholder: "Ej. 10", suffix: "HA" },
];

const AGRONOMIC_INFO: Array<{ field: DraftField; label: string; type?: "number"; step?: string; placeholder?: string }> = [
    { field: "densidadPlantacion", label: "Densidad de plantación", type: "number", step: "0.001", placeholder: "Ej. 500" },
    { field: "distanciamiento", label: "Distanciamiento", type: "number", step: "0.001", placeholder: "Ej. 8x8" },
    { field: "frecuenciaRiego", label: "Frecuencia de riego", type: "number", step: "1", placeholder: "Ej. 15 días" },
    { field: "nombreAplicacion", label: "Nombre de aplicación", placeholder: "Ej. Fertilizante NPK" },
    { field: "aplicacionesAlAno", label: "Aplicaciones al año", type: "number", step: "1", placeholder: "Ej. 3" },
];


/** Vincula un proveedor por vez: se valida, se guarda y el backend confirma antes de mostrar éxito. */
export default function CampaignLinkProviderModal({ open, campaniaId, onOpenChange, onSave, onRefresh }: CampaignLinkProviderModalProps) {
    const [providerType, setProviderType] = useState<TipoProveedorCampania>("productor");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [draft, setDraft] = useState<DraftValues>(EMPTY_DRAFT);
    const [errors, setErrors] = useState<CampaniaProveedorDraftErrors & { proveedorId?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [linkedIds, setLinkedIds] = useState<Set<number>>(new Set());
    const [isLoadingProviders, setIsLoadingProviders] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    // Proveedor cuyo guardado no se pudo confirmar: el formulario queda bloqueado hasta reconciliar con el backend
    const [unresolvedProviderId, setUnresolvedProviderId] = useState<number | null>(null);
    const unresolvedRef = useRef<number | null>(null);
    const onSaveRef = useRef(onSave);
    const onRefreshRef = useRef(onRefresh);

    useEffect(() => {
        onSaveRef.current = onSave;
        onRefreshRef.current = onRefresh;
    }, [onSave, onRefresh]);

    const [controller] = useState(() => createCampaniaProveedorSubmissionController<CampaniaProveedorDraft>({
        create: (campaignId, provider) => createCampaniaProveedor(toCreateCampaniaProveedorInput(campaignId, provider)),
        list: getCampaniaProveedoresByCampania,
    }));

    const markUnresolved = (providerId: number | null) => {
        unresolvedRef.current = providerId;
        setUnresolvedProviderId(providerId);
    };

    // Cada apertura es una sesión nueva; si quedó un guardado sin confirmar, primero se consulta al backend
    useEffect(() => {
        if (!open) return;
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProviderType("productor");
        setSelectedProvider("");
        setDraft(EMPTY_DRAFT);
        setErrors({});
        setFormError(null);
        setIsLoadingProviders(true);

        const requests: Promise<unknown>[] = [
            fetchCampaignProviderOptions(getProveedores).then(({ providers, failed }) => {
                if (!active) return;
                setProveedores(providers);
                if (failed) setFormError("No se pudieron cargar los proveedores. Cierra y vuelve a abrir el formulario.");
            }),
        ];

        if (campaniaId) {
            requests.push(
                getCampaniaProveedoresByCampania(campaniaId)
                    .then((relations) => { if (active) setLinkedIds(new Set(relations.map((relation) => relation.proveedorId))); })
                    .catch(() => { if (active) setLinkedIds(new Set()); }),
            );
        }

        const pendingId = unresolvedRef.current;
        if (campaniaId && pendingId !== null) {
            requests.push(
                controller.reconcile(campaniaId, [pendingId]).then((result) => {
                    if (!active) return;
                    if (result.status === "unresolved") {
                        setFormError("Aún no se puede confirmar el vínculo anterior. Para evitar duplicados, vuelve a abrir el formulario más tarde.");
                        return;
                    }
                    markUnresolved(null);
                    if (result.status === "complete") {
                        // El vínculo anterior sí se guardó: se informa como éxito sin volver a enviarlo
                        onSaveRef.current?.();
                    } else {
                        onRefreshRef.current?.();
                    }
                }),
            );
        }

        void Promise.all(requests).finally(() => { if (active) setIsLoadingProviders(false); });
        return () => { active = false; };
    }, [open, campaniaId, controller]);

    const isLocked = isSaving || unresolvedProviderId !== null;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSaving) return;
        onOpenChange(nextOpen);
    };

    const updateDraft = (field: DraftField, value: string) => {
        setDraft((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setFormError(null);
    };

    const handleSubmit = async () => {
        if (isLocked || !campaniaId) return;
        const proveedor = proveedores.find((provider) => String(provider.proveedorId) === selectedProvider);
        const candidate: CampaniaProveedorDraft = { proveedorId: proveedor?.proveedorId ?? 0, tipoProveedor: providerType, ...draft };
        const draftErrors: typeof errors = getCampaniaProveedorDraftErrors(candidate);
        if (!proveedor) draftErrors.proveedorId = "Selecciona un proveedor.";
        if (Object.keys(draftErrors).length > 0 || !proveedor) {
            setErrors(draftErrors);
            setFormError("Revisa los campos marcados antes de vincular.");
            return;
        }

        setIsSaving(true);
        setErrors({});
        setFormError(null);
        try {
            const result = await controller.submit(campaniaId, [candidate]);
            if (result.status === "complete") {
                onSave?.();
                return;
            }
            if (result.status === "unresolved") {
                markUnresolved(candidate.proveedorId);
                setFormError("No se pudo confirmar si el vínculo se guardó. Para evitar duplicados, cierra y vuelve a abrir el formulario para verificarlo.");
                return;
            }
            onRefresh?.();
            setFormError("No se pudo vincular el proveedor. Revisa los datos e inténtalo nuevamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const providerOptions = proveedores
        .filter((provider) => !linkedIds.has(provider.proveedorId))
        .map((provider) => ({ value: String(provider.proveedorId), label: `${provider.nombres} ${provider.apellido}` }));

    const renderField = ({ field, label, type, step, placeholder, suffix }: { field: DraftField; label: string; type?: "number"; step?: string; placeholder?: string; suffix?: string }) => {
        const message = errors[field];
        const isCoordinate = field === "latitud" || field === "longitud";
        return (
            <Field key={field} data-invalid={message ? true : undefined}>
                <FieldLabel htmlFor={`link-provider-${field}`}>
                    {label} {field !== "frutaConvencional" && field !== "observacionesParticipacion" && <span aria-hidden="true" className="text-destructive">*</span>}
                </FieldLabel>
                <div className="relative">
                    <Input
                        id={`link-provider-${field}`}
                        type={type ?? "text"}
                        inputMode={type === "number" ? "decimal" : undefined}
                        step={step}
                        min={type === "number" && !isCoordinate ? 0 : undefined}
                        placeholder={placeholder}
                        value={draft[field]}
                        onChange={(event) => updateDraft(field, event.target.value)}
                        disabled={isLocked}
                        className={suffix ? "pr-12" : undefined}
                        aria-required={field !== "frutaConvencional" && field !== "observacionesParticipacion" ? "true" : undefined}
                        aria-invalid={message ? true : undefined}
                        aria-describedby={message ? `link-provider-${field}-error` : undefined}
                    />
                    {suffix && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-surface text-brand text-[11px] font-bold px-2 py-1 rounded-md">
                            {suffix}
                        </div>
                    )}
                </div>
                {message && <FieldError id={`link-provider-${field}-error`}>{message}</FieldError>}
            </Field>
        );
    };

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            icon={<Link2 size={22} strokeWidth={2} />}
            title="Vincular Proveedor"
            description="Asocia un productor o acopiador a esta campaña. Los campos con * son obligatorios."
            className="sm:max-w-[800px]"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSubmit} disabled={isLocked || isLoadingProviders || !campaniaId} aria-busy={isSaving}>
                        <Link2 size={20} strokeWidth={2.5} /> {isSaving ? "Vinculando..." : "Vincular proveedor"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                
                <FormSection icon={<UserRound size={16} strokeWidth={2.5} />} title="Proveedor y Participación">
                    <Field data-invalid={errors.proveedorId ? true : undefined}>
                        <FieldLabel>Seleccionar Proveedor: <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                        <Combobox
                            options={providerOptions}
                            value={selectedProvider}
                            onChange={(value) => { setSelectedProvider(value); setErrors((current) => ({ ...current, proveedorId: undefined })); }}
                            placeholder={isLoadingProviders ? "Cargando proveedores..." : "Buscar proveedor, fruta o variedad..."}
                            emptyMessage="No hay proveedores disponibles para vincular"
                            disabled={isLoadingProviders || isLocked}
                        />
                        {errors.proveedorId && <FieldError>{errors.proveedorId}</FieldError>}
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <Field>
                            <FieldLabel>Tipo de Proveedor:</FieldLabel>
                            <SegmentedControl
                                options={PROVIDER_TYPES}
                                value={providerType}
                                onChange={(value) => {
                                    setProviderType(value as TipoProveedorCampania);
                                    setErrors({});
                                    setFormError(null);
                                }}
                            />
                        </Field>
                        {renderField({ field: "cantidadProveedor", label: "Cantidad Estimada (kg)", type: "number", step: "0.001", placeholder: "Ej. 2500", suffix: "KG" })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {renderField({ field: "frutaConvencional", label: "Fruta Convencional Estimada", placeholder: "Ej. 1000", suffix: "KG" })}
                        {renderField({ field: "mtdCeratitis", label: "MTD Ceratitis", type: "number", step: "0.001", placeholder: "Ej. 0.05" })}
                    </div>

                    <Field>
                        <FieldLabel>Observaciones de Participación</FieldLabel>
                        <Textarea 
                            className="min-h-24 resize-none" 
                            placeholder="Escribe aquí las observaciones..."
                            value={draft.observacionesParticipacion}
                            onChange={(e) => updateDraft("observacionesParticipacion", e.target.value)}
                            disabled={isLocked}
                        />
                    </Field>
                </FormSection>

                <Separator className="-mx-5 sm:-mx-6 w-auto" />
                
                <FormSection icon={<MapPin size={16} strokeWidth={2.5} />} title="Ubicación y datos de finca">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        {FINCA_LOCATION.slice(0, 3).map(renderField)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        {FINCA_LOCATION.slice(3, 5).map(renderField)}
                        {FINCA_LOCATION.slice(5).map(renderField)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        {FINCA_CROP.map(renderField)}
                    </div>
                </FormSection>

                <Separator className="-mx-5 sm:-mx-6 w-auto" />
                
                <FormSection icon={<Sprout size={16} strokeWidth={2.5} />} title="Información agronómica">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        {AGRONOMIC_INFO.slice(0, 3).map(renderField)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {AGRONOMIC_INFO.slice(3).map(renderField)}
                    </div>
                </FormSection>

                <div className={`transition-all duration-300 overflow-hidden ${formError ? "opacity-100 max-h-20" : "opacity-0 max-h-0"}`}>
                    <FieldError className="flex items-center gap-2 text-[13px] font-medium">
                        <AlertCircle size={14} className="shrink-0" /> {formError}
                    </FieldError>
                </div>
            </div>
        </AppModal>
    );
}
