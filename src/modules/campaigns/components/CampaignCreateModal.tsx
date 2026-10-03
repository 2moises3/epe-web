/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Sprout, X } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import RemovableChip from "@/shared/components/RemovableChip";
import FieldError from "@/shared/components/FieldError";
import { getFrutas, getFrutaDerivadas, createCampana } from "@/modules/campaigns/api/campaign.api";
import type { FrutaDto, FrutaDerivadaDto } from "@/modules/campaigns/api/campaign.dto";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";
import { campaignFormSchema } from "@/modules/campaigns/api/campaign-form.schema";
import { getBadRequestFieldErrors, getZodFieldErrors, type FormFieldErrors } from "@/shared/validation/api-form-errors";

interface CampaignCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function CampaignCreateModal({ open, onOpenChange, onSuccess }: CampaignCreateModalProps) {
    const [frutas, setFrutas] = useState<FrutaDto[]>([]);
    const [nombre, setNombre] = useState("");
    const [frutaId, setFrutaId] = useState<number | null>(null);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [requerimientoComercial, setRequerimientoComercial] = useState("");
    const [derivadas, setDerivadas] = useState<FrutaDerivadaDto[]>([]);
    const [derivadasLoading, setDerivadasLoading] = useState(false);
    const [errors, setErrors] = useState<FormFieldErrors>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setNombre("");
        setFrutaId(null);
        setFechaInicio("");
        setFechaFin("");
        setRequerimientoComercial("");
        setDerivadas([]);
        setErrors({});
        getFrutas()
            .then(setFrutas)
            .catch(() => setFrutas([]));
    }, [open]);

    useEffect(() => {
        if (!open || frutaId === null) {
            setDerivadas([]);
            return;
        }
        setDerivadasLoading(true);
        getFrutaDerivadas(frutaId)
            .then(setDerivadas)
            .catch(() => setDerivadas([]))
            .finally(() => setDerivadasLoading(false));
    }, [open, frutaId]);

    const handleSubmit = async () => {
        const validation = campaignFormSchema.safeParse({ nombre, frutaId, fechaInicio, fechaFin, estado: "planificacion", requerimientoComercial });
        if (!validation.success) { setErrors(getZodFieldErrors(validation.error)); return; }
        setSaving(true);
        setErrors({});
        try {
            await createCampana({
                ...validation.data,
                fechaInicio: parseFecha(validation.data.fechaInicio),
                fechaFin: parseFecha(validation.data.fechaFin),
            });
            onSuccess?.();
        } catch (requestError) {
            setErrors(getBadRequestFieldErrors(requestError, { nombre: "nombre", frutaId: "frutaId", fechaInicio: "fechaInicio", fechaFin: "fechaFin", requerimientoComercial: "requerimientoComercial" }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<Sprout size={22} strokeWidth={2} />}
            title="Nueva Campaña"
            description="Completa la información para registrar una nueva campaña."
            className="sm:max-w-175"
            footer={
                <>
                    <Button variant="outline" size="xl" onClick={() => onOpenChange(false)}>
                        <X size={20} strokeWidth={2.5} /> Cancelar
                    </Button>
                    <Button size="xl" onClick={handleSubmit} disabled={saving}>
                        <Sprout size={20} strokeWidth={2.5} /> Crear Campaña
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <Field data-invalid={errors.nombre ? true : undefined}>
                    <FieldLabel>Nombre de Campaña:</FieldLabel>
                    <Input
                        placeholder="Ej: Campaña Mango 2026"
                        value={nombre}
                        onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: undefined })); }}
                    />
                    <FieldError message={errors.nombre} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field data-invalid={errors.fechaInicio ? true : undefined}>
                        <FieldLabel>Fecha Inicio:</FieldLabel>
                        <Input type="date" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setErrors((p) => ({ ...p, fechaInicio: undefined })); }} />
                        <FieldError message={errors.fechaInicio} />
                    </Field>
                    <Field data-invalid={errors.fechaFin ? true : undefined}>
                        <FieldLabel>Fecha Fin:</FieldLabel>
                        <Input type="date" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setErrors((p) => ({ ...p, fechaFin: undefined })); }} />
                        <FieldError message={errors.fechaFin} />
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field data-invalid={errors.frutaId ? true : undefined}>
                        <FieldLabel>Seleccionar Fruta:</FieldLabel>
                        <Select
                            value={frutaId !== null ? String(frutaId) : ""}
                            onValueChange={(val) => { setFrutaId(val ? Number(val) : null); setErrors((p) => ({ ...p, frutaId: undefined })); }}
                        >
                            <SelectTrigger className={errors.frutaId ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : ""}>
                                <SelectValue placeholder="Seleccionar Fruta" />
                            </SelectTrigger>
                            <SelectContent>
                                {frutas.length === 0 ? (
                                    <SelectItem value="__no-fruits__" disabled>No hay frutas registradas</SelectItem>
                                ) : (
                                    frutas.map((fruta) => (
                                        <SelectItem key={fruta.frutaId} value={String(fruta.frutaId)}>
                                            {fruta.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <FieldError message={errors.frutaId} />
                    </Field>

                    <Field data-invalid={errors.requerimientoComercial ? true : undefined}>
                        <FieldLabel>Requerimientos Comerciales:</FieldLabel>
                        <div className="relative">
                            <Input
                                placeholder="Ej: 3000"
                                value={requerimientoComercial}
                                onChange={(e) => { setRequerimientoComercial(e.target.value); setErrors((p) => ({ ...p, requerimientoComercial: undefined })); }}
                                className="pr-12"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-surface text-brand text-[11px] font-bold px-2 py-1 rounded-md">
                                KG
                            </div>
                        </div>
                        <FieldError message={errors.requerimientoComercial} />
                    </Field>
                </div>

                {/* Variedades derivadas: informativo */}
                <div className={`transition-all duration-300 ${derivadas.length > 0 || derivadasLoading ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
                    <Field>
                        <FieldLabel>Frutas derivadas de la variedad seleccionada:</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                            {derivadasLoading ? (
                                <span className="text-[13px] text-ink-muted">Cargando variedades...</span>
                            ) : (
                                derivadas.map((derivada) => (
                                    <RemovableChip
                                        key={derivada.frutaDerivadaId}
                                        label={derivada.name}
                                    />
                                ))
                            )}
                        </div>
                    </Field>
                </div>
                {errors._form && <p role="alert" className="text-[13px] text-red-500 font-medium">{errors._form}</p>}
            </div>
        </AppModal>
    );
}
