import { useEffect, useRef, useState } from "react";
import { X, UserRound } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
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
    campaniaId: number | null;
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
    const [isAcopiador, setIsAcopiador] = useState(false);
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
        // Loading starts on modal open and lasts through provider refresh and any outcome reconciliation.
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

        if (hasUnresolvedOutcomeRef.current && campaniaId !== null && submissionControllerRef.current) {
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
        if (campaniaId === null || addedProviders.length === 0) {
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
            <div className="flex flex-col gap-2">
                <label htmlFor={`provider-${field}`} className="text-[13px] font-semibold text-ink">
                    {label} <span aria-hidden="true" className="text-red-600">*</span>
                </label>
                <Input
                    id={`provider-${field}`}
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
                    className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                />
                {fieldError && <p id={`provider-${field}-error`} className="text-xs text-red-600" role="alert">{fieldError}</p>}
            </div>
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

    return (
        <AppModal
            open={open}
            onOpenChange={handleOpenChange}
            title="Vincular Proveedores"
            className="sm:max-w-175"
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
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <p className="text-xs text-ink-muted"><span aria-hidden="true" className="text-red-600">*</span> Campos obligatorios según el contrato del proveedor seleccionado.</p>

                <div className="flex flex-col gap-2.5">
                    <label htmlFor="campaign-provider-select" className="text-[13px] font-semibold text-ink">Seleccionar proveedor <span aria-hidden="true" className="text-red-600">*</span></label>
                    <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value || "")}>
                        <SelectTrigger
                            id="campaign-provider-select"
                            aria-required="true"
                            aria-describedby="campaign-provider-select-status"
                            disabled={isLoadingProviders || isSaving || hasUnresolvedOutcome}
                            className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand"
                        >
                            <SelectValue placeholder="Seleccione un proveedor..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            {proveedores.map((provider) => (
                                <SelectItem key={provider.proveedorId} value={String(provider.proveedorId)} className="rounded-lg">
                                    {provider.nombres} {provider.apellido}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p id="campaign-provider-select-status" className="text-xs text-ink-muted" aria-live="polite">
                        {isLoadingProviders ? "Cargando proveedores..." : `${proveedores.length} proveedores disponibles.`}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 items-end">
                    <div className="flex flex-col gap-2">
                        <span className="text-[13px] font-semibold text-ink">Tipo de proveedor <span aria-hidden="true" className="text-red-600">*</span></span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[12px] font-bold ${!isAcopiador ? "text-ink" : "text-ink-muted"}`}>Productor</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isAcopiador}
                                aria-label="Acopiador"
                                disabled={isSaving || hasUnresolvedOutcome}
                                onClick={() => {
                                    setIsAcopiador((current) => !current);
                                    setErrors({});
                                    setError(null);
                                }}
                                className="relative w-[52px] h-8 rounded-full border-2 border-ink-muted bg-white transition-colors hover:border-ink"
                            >
                                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-brand transition-transform ${isAcopiador ? "translate-x-[21px]" : "translate-x-0.5"}`} />
                            </button>
                            <span className={`text-[12px] font-bold ${isAcopiador ? "text-ink" : "text-ink-muted"}`}>Acopiador</span>
                        </div>
                    </div>
                    {renderInput("cantidadProveedor", "Cantidad estimada", cantidad, (value) => updateGlobalField("cantidadProveedor", value), "number", "0.001")}
                </div>
                {renderInput("mtdCeratitis", "MTD de Ceratitis", mtdCeratitis, (value) => updateGlobalField("mtdCeratitis", value), "number", "0.001")}

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
                        {renderInput("haTotalFinca", "Hectáreas totales de finca", finca.haTotalFinca, (value) => updateFinca("haTotalFinca", value), "number", "1")}
                        {renderInput("haCultivo", "Hectáreas de cultivo", finca.haCultivo, (value) => updateFinca("haCultivo", value), "number", "1")}
                        {renderInput("nombreAplicacion", "Nombre de la aplicación", finca.nombreAplicacion, (value) => updateFinca("nombreAplicacion", value))}
                        {renderInput("aplicacionesAlAno", "Aplicaciones al año", finca.aplicacionesAlAno, (value) => updateFinca("aplicacionesAlAno", value), "number", "1")}
                    </fieldset>
                )}

                <div className="flex justify-center mt-2">
                    <Button
                        onClick={handleAdd}
                        disabled={!selectedProvider || isLoadingProviders || isSaving || hasUnresolvedOutcome}
                        className="h-10 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold px-8 shadow-sm disabled:opacity-50 transition-colors active:scale-95"
                    >
                        Agregar
                    </Button>
                </div>

                {error && <p className="text-[13px] text-red-600 text-center" role="alert">{error}</p>}

                <div className="flex flex-col gap-3 mt-4">
                    <h3 className="text-[13px] font-semibold text-ink">Proveedores agregados ({addedProviders.length})</h3>
                    {addedProviders.length === 0 && <p className="text-sm text-ink-muted">No hay proveedores agregados.</p>}
                    <div className="flex flex-wrap gap-3">
                        {addedProviders.map((provider) => (
                            <div key={provider.proveedorId} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white min-w-[200px]">
                                <button
                                    type="button"
                                    aria-label={`Quitar a ${provider.nombre}`}
                                    disabled={isSaving || hasUnresolvedOutcome}
                                    onClick={() => handleRemove(provider.proveedorId)}
                                    className="text-ink hover:text-destructive transition-colors"
                                >
                                    <X size={18} strokeWidth={2.5} />
                                </button>
                                <div className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center text-ink shrink-0">
                                    <UserRound size={22} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-ink leading-tight mb-0.5">{provider.nombre}</span>
                                    <span className="text-[11px] font-medium text-ink">{provider.tipoProveedor === "acopio" ? "Acopiador" : "Productor"} · Cantidad {provider.cantidadProveedor} · MTD {provider.mtdCeratitis}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppModal>
    );
}
