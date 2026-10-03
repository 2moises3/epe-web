/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { X, Save, UserRound } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import SegmentedControl from "@/shared/components/SegmentedControl";
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
    onSave?: () => void;
    onRefresh?: () => void;
}

interface PendingProvider extends CampaniaProveedorDraft {
    nombre: string;
}

type FincaDraft = Omit<CampaniaProveedorDraft, "proveedorId" | "tipoProveedor" | "cantidadProveedor" | "mtdCeratitis">;

const emptyFincaDraft: FincaDraft = {
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
};

export default function CampaignLinkProviderModal({ open, campaniaId, onOpenChange, onSave, onRefresh }: CampaignLinkProviderModalProps) {
    const [providerType, setProviderType] = useState<string>("productor");
    const isAcopiador = providerType === "acopio";
    
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [cantidad, setCantidad] = useState<string>("");
    const [mtdCeratitis, setMtdCeratitis] = useState<string>("");
    const [finca, setFinca] = useState<FincaDraft>(emptyFincaDraft);

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [addedProviders, setAddedProviders] = useState<PendingProvider[]>([]);
    const [isLoadingProviders, setIsLoadingProviders] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const isSavingRef = useRef(false);
    const [hasUnresolvedOutcome, setHasUnresolvedOutcome] = useState(false);
    const [errors, setErrors] = useState<CampaniaProveedorDraftErrors>({});
    const [error, setError] = useState<string | null>(null);
    const pendingProvidersRef = useRef<PendingProvider[]>([]);
    const hasUnresolvedOutcomeRef = useRef(false);
    const onOpenChangeRef = useRef(onOpenChange);
    const onSaveRef = useRef(onSave);
    const onRefreshRef = useRef(onRefresh);
    const submissionControllerRef = useRef<ReturnType<typeof createCampaniaProveedorSubmissionController<PendingProvider>> | null>(null);
    
    useEffect(() => {
        onOpenChangeRef.current = onOpenChange;
        onSaveRef.current = onSave;
        onRefreshRef.current = onRefresh;
    }, [onOpenChange, onSave, onRefresh]);
    
    if (submissionControllerRef.current === null) {
        submissionControllerRef.current = createCampaniaProveedorSubmissionController<PendingProvider>({
            create: (campaignId, provider) => createCampaniaProveedor(toCreateCampaniaProveedorInput(campaignId, provider)),
            list: getCampaniaProveedoresByCampania,
        });
    }

    const updatePendingProviders = (providers: PendingProvider[]) => {
        pendingProvidersRef.current = providers;
        setAddedProviders(providers);
    };

    const updateUnresolvedOutcome = (unresolved: boolean) => {
        hasUnresolvedOutcomeRef.current = unresolved;
        setHasUnresolvedOutcome(unresolved);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && (isSavingRef.current || (hasUnresolvedOutcomeRef.current && isLoadingProviders))) return;
        onOpenChange(nextOpen);
    };

    useEffect(() => {
        if (!open) return;
        let isCurrent = true;
        setIsLoadingProviders(true);
        setProveedores([]);
        setError(null);
        setErrors({});
        const requests = [
            fetchCampaignProviderOptions(getProveedores).then(({ providers, failed }) => {
                if (!isCurrent) return;
                setProveedores(providers);
                if (failed) setError("No se pudieron cargar los proveedores. Vuelva a abrir el formulario para intentarlo nuevamente.");
            }),
        ];

        if (hasUnresolvedOutcomeRef.current && campaniaId !== null && campaniaId !== undefined && submissionControllerRef.current) {
            requests.push(
                submissionControllerRef.current.reconcile(
                    campaniaId,
                    pendingProvidersRef.current.map((provider) => provider.proveedorId),
                ).then((result) => {
                    if (!isCurrent) return;
                    if (result.status === "unresolved") {
                        setError("No se pudo confirmar el resultado anterior. El formulario permanece bloqueado para evitar duplicados; vuelva a abrirlo para actualizar el estado.");
                        return;
                    }
                    const persisted = new Set(result.persistedProviderIds);
                    updatePendingProviders(pendingProvidersRef.current.filter((provider) => !persisted.has(provider.proveedorId)));
                    updateUnresolvedOutcome(false);
                    if (result.status === "complete") {
                        setError(null);
                        if (onSaveRef.current) onSaveRef.current();
                        else onOpenChangeRef.current(false);
                    } else {
                        setError("Se consultó el estado de los vínculos anteriores. La lista pendiente se actualizó; revise los elementos restantes antes de volver a guardar.");
                        onRefreshRef.current?.();
                    }
                }),
            );
        }

        void Promise.all(requests).finally(() => {
            if (isCurrent) setIsLoadingProviders(false);
        });
        return () => { isCurrent = false; };
    }, [open, campaniaId]);

    const handleRemove = (proveedorId: number) => {
        updatePendingProviders(pendingProvidersRef.current.filter((provider) => provider.proveedorId !== proveedorId));
    };

    const makeCurrentDraft = (proveedorId: number, tipoProveedor: TipoProveedorCampania): CampaniaProveedorDraft => ({
        proveedorId,
        tipoProveedor,
        cantidadProveedor: cantidad,
        mtdCeratitis,
        ...finca,
    });

    const handleAdd = () => {
        if (!selectedProvider) return;
        const proveedor = proveedores.find((provider) => String(provider.proveedorId) === selectedProvider);
        if (!proveedor) return;
        if (pendingProvidersRef.current.some((provider) => provider.proveedorId === proveedor.proveedorId)) {
            setError("Este proveedor ya está en la lista.");
            return;
        }

        const draft = makeCurrentDraft(proveedor.proveedorId, isAcopiador ? "acopio" : "productor");
        const draftErrors = getCampaniaProveedorDraftErrors(draft);
        if (Object.keys(draftErrors).length > 0) {
            setErrors(draftErrors);
            setError("Revise los campos obligatorios y corrija los valores indicados.");
            return;
        }

        setErrors({});
        setError(null);
        updatePendingProviders([
            ...pendingProvidersRef.current,
            { ...draft, nombre: `${proveedor.nombres} ${proveedor.apellido}` },
        ]);
        setSelectedProvider("");
        setCantidad("");
        setMtdCeratitis("");
        setFinca(emptyFincaDraft);
    };

    const handleGuardar = async () => {
        if (isSavingRef.current || hasUnresolvedOutcomeRef.current) return;
        if (campaniaId === null || campaniaId === undefined || addedProviders.length === 0) {
            setError("Seleccione una campaña y agregue al menos un proveedor antes de guardar.");
            return;
        }

        setIsSaving(true);
        isSavingRef.current = true;
        setError(null);
        try {
            const result = await submissionControllerRef.current!.submit(campaniaId, pendingProvidersRef.current);
            const persisted = new Set(result.persistedProviderIds);
            updatePendingProviders(pendingProvidersRef.current.filter((provider) => !persisted.has(provider.proveedorId)));
            if (result.status === "complete") {
                updateUnresolvedOutcome(false);
                if (onSave) onSave();
                else onOpenChange(false);
                return;
            }

            if (result.status === "partial") {
                onRefresh?.();
                setError("No se confirmaron todos los vínculos. Los guardados confirmados se actualizaron; solo quedan en la lista los pendientes verificados por la consulta.");
            } else if (result.status === "unresolved") {
                updateUnresolvedOutcome(true);
                setError("No se pudo confirmar el resultado del guardado. Para evitar duplicados, no vuelva a enviarlo; cierre y vuelva a abrir el formulario para reconciliar el estado.");
            } else {
                setError("La lista contiene proveedores duplicados. Quite los duplicados antes de guardar.");
            }
        } finally {
            isSavingRef.current = false;
            setIsSaving(false);
        }
    };

    const renderInput = (
        field: keyof FincaDraft | "cantidadProveedor" | "mtdCeratitis",
        label: string,
        value: string,
        onChange: (value: string) => void,
        type: "text" | "number" = "text",
        step?: string,
    ) => {
        const fieldError = errors[field as keyof CampaniaProveedorDraft];
        const min = field === "latitud" ? "-90" : field === "longitud" ? "-180" : type === "number" ? "0" : undefined;
        const max = field === "latitud" ? "90" : field === "longitud" ? "180" : undefined;
        return (
            <Field>
                <FieldLabel>{label} <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                <Input
                    type={type}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? `provider-${field}-error` : undefined}
                    disabled={isSaving || hasUnresolvedOutcome}
                />
                {fieldError && <p id={`provider-${field}-error`} className="text-xs text-destructive" role="alert">{fieldError}</p>}
            </Field>
        );
    };

    const updateFinca = (field: keyof FincaDraft, value: string) => {
        setFinca((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const updateGlobalField = (field: "cantidadProveedor" | "mtdCeratitis", value: string) => {
        if (field === "cantidadProveedor") setCantidad(value);
        else setMtdCeratitis(value);
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const ALL_PROVIDERS = proveedores.map(p => ({
        value: String(p.proveedorId),
        label: `${p.nombres} ${p.apellido}`
    }));

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            title="Vincular Proveedores"
            description="Asocia productores y acopiadores a esta campaña. Campos marcados con * son obligatorios."
            className="sm:max-w-[700px]"
            footer={
                <>
                    <Button
                        variant="outline"
                        size="xl"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSaving || (hasUnresolvedOutcome && isLoadingProviders)}
                    >
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button
                        size="xl"
                        onClick={handleGuardar}
                        disabled={isSaving || hasUnresolvedOutcome || addedProviders.length === 0}
                    >
                        <Save size={20} strokeWidth={2.5} /> {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-5">
                <Field>
                    <FieldLabel>Seleccionar Proveedor: <span className="text-destructive">*</span></FieldLabel>
                    <Combobox
                        options={ALL_PROVIDERS}
                        value={selectedProvider}
                        onChange={setSelectedProvider}
                        placeholder={isLoadingProviders ? "Cargando proveedores..." : "Seleccione un proveedor..."}
                        emptyMessage="No hay proveedores disponibles"
                        disabled={isLoadingProviders || isSaving || hasUnresolvedOutcome}
                    />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <Field>
                        <FieldLabel>Tipo de Proveedor:</FieldLabel>
                        <SegmentedControl
                            options={[
                                { label: "Productor", value: "productor" },
                                { label: "Acopiador", value: "acopio" }
                            ]}
                            value={providerType}
                            onChange={(val) => {
                                setProviderType(val);
                                setErrors({});
                                setError(null);
                            }}
                        />
                    </Field>
                    {renderInput("cantidadProveedor", "Cantidad estimada", cantidad, (value) => updateGlobalField("cantidadProveedor", value), "number", "0.001")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {renderInput("mtdCeratitis", "MTD de Ceratitis", mtdCeratitis, (value) => updateGlobalField("mtdCeratitis", value), "number", "0.001")}
                </div>

                {!isAcopiador && (
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-5">
                        <legend className="mb-3 text-sm font-bold text-ink">Datos de la finca del productor</legend>
                        {renderInput("departamento", "Departamento", finca.departamento, (value) => updateFinca("departamento", value))}
                        {renderInput("provincia", "Provincia", finca.provincia, (value) => updateFinca("provincia", value))}
                        {renderInput("distrito", "Distrito", finca.distrito, (value) => updateFinca("distrito", value))}
                        {renderInput("latitud", "Latitud", finca.latitud, (value) => updateFinca("latitud", value), "number", "0.0000001")}
                        {renderInput("longitud", "Longitud", finca.longitud, (value) => updateFinca("longitud", value), "number", "0.0000001")}
                        {renderInput("densidadPlantacion", "Densidad de plantación", finca.densidadPlantacion, (value) => updateFinca("densidadPlantacion", value), "number", "0.001")}
                        {renderInput("distanciamiento", "Distanciamiento", finca.distanciamiento, (value) => updateFinca("distanciamiento", value), "number", "0.001")}
                        {renderInput("frecuenciaRiego", "Frecuencia de riego", finca.frecuenciaRiego, (value) => updateFinca("frecuenciaRiego", value), "number", "1")}
                        {renderInput("haTotalFinca", "Hectáreas totales", finca.haTotalFinca, (value) => updateFinca("haTotalFinca", value), "number", "1")}
                        {renderInput("haCultivo", "Hectáreas de cultivo", finca.haCultivo, (value) => updateFinca("haCultivo", value), "number", "1")}
                        {renderInput("nombreAplicacion", "Nombre de aplicación", finca.nombreAplicacion, (value) => updateFinca("nombreAplicacion", value))}
                        {renderInput("aplicacionesAlAno", "Aplicaciones/año", finca.aplicacionesAlAno, (value) => updateFinca("aplicacionesAlAno", value), "number", "1")}
                    </fieldset>
                )}

                <div className="flex justify-end mt-2">
                    <Button
                        onClick={handleAdd}
                        disabled={!selectedProvider || isLoadingProviders || isSaving || hasUnresolvedOutcome}
                        className="h-10 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95"
                    >
                        Agregar a lista
                    </Button>
                </div>
                
                {error && <p className="text-xs text-destructive">{error}</p>}

                {addedProviders.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4 border-t border-border pt-4">
                        <label className="text-[13px] font-semibold text-ink">Proveedores pendientes ({addedProviders.length}):</label>
                        <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto">
                            {addedProviders.map((provider) => (
                                <div key={provider.proveedorId} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white min-w-[200px] w-full sm:w-[calc(50%-6px)]">
                                    <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                                        <UserRound size={18} className="text-brand" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-[13px] font-bold text-ink leading-tight mb-0.5 truncate max-w-[150px]">
                                            {provider.nombre}
                                        </span>
                                        <span className="text-[11px] font-medium text-ink-muted">
                                            {provider.tipoProveedor === "acopio" ? "Acopiador" : "Productor"} · {provider.cantidadProveedor} kg
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(provider.proveedorId)}
                                        disabled={isSaving || hasUnresolvedOutcome}
                                        className="text-ink-muted hover:text-destructive transition-colors shrink-0 disabled:opacity-50"
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppModal>
    );
}
