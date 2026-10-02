import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { getFrutas, getFrutaDerivadas, createCampana } from "@/modules/campaigns/api/campaign.api";
import type { FrutaDto, FrutaDerivadaDto } from "@/modules/campaigns/api/campaign.dto";
import { parseFecha } from "@/modules/campaigns/api/fecha.util";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { campaignFormSchema } from "@/modules/campaigns/api/campaign-form.schema";
import { getBadRequestFieldErrors, getZodFieldErrors, type FormFieldErrors } from "@/shared/validation/api-form-errors";
import FieldError from "@/shared/components/FieldError";

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[600px] sm:max-w-[700px] p-8 rounded-2xl bg-white border-none shadow-2xl gap-0">
                <DialogHeader className="mb-6">
                    <div className="flex items-start gap-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0 border border-brand-border">
                            <Leaf size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogTitle className="text-xl font-bold text-ink">
                                Nueva Campaña
                            </DialogTitle>
                            <DialogDescription className="text-[13.5px] text-ink-muted mt-1">
                                Completa la información para registrar una nueva campaña.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    {/* Nombre */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Nombre de Campaña:</label>
                        <Input
                            value={nombre}
                            onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: undefined })); }}
                            placeholder="Ej: Campaña Mango 2026"
                            className="rounded-lg h-11 border-border shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                        />
                        <FieldError message={errors.nombre} />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Fecha Inicio:</label>
                            <DatePicker
                                value={fechaInicio}
                                onChange={(value) => { setFechaInicio(value); setErrors((p) => ({ ...p, fechaInicio: undefined })); }}
                                className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                            <FieldError message={errors.fechaInicio} />
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[13px] font-semibold text-ink">Fecha Fin:</label>
                            <DatePicker
                                value={fechaFin}
                                onChange={(value) => { setFechaFin(value); setErrors((p) => ({ ...p, fechaFin: undefined })); }}
                                className="rounded-lg h-11 border-border text-ink-muted shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                            <FieldError message={errors.fechaFin} />
                        </div>
                    </div>
                    
                    {/* Frutas Derivadas */}
                    <div className="grid grid-cols-2 gap-4 ">
                        <div className="flex flex-col gap-2.5 ">
                            <label className="text-[13px] font-semibold text-ink">Seleccionar Frutas:</label>
                            <Select
                                value={frutaId !== null ? String(frutaId) : ""}
                                onValueChange={(val) => { setFrutaId(val ? Number(val) : null); setErrors((p) => ({ ...p, frutaId: undefined })); }}
                            >
                                <SelectTrigger className="w-full rounded-lg !h-11 border-border text-ink-muted shadow-none focus:ring-1 focus:ring-brand/30 focus:border-brand">
                                    <SelectValue placeholder="Selecciona una fruta">
                                        {frutas.find((f) => f.frutaId === frutaId)?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    {frutas.length === 0 ? (
                                        <SelectItem value="__no-fruits__" disabled className="justify-center text-ink-muted">
                                            No hay frutas registradas.
                                        </SelectItem>
                                    ) : frutas.map((fruta) => (
                                        <SelectItem key={fruta.frutaId} value={String(fruta.frutaId)} className="rounded-lg">
                                            {fruta.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.frutaId} />
                        </div>
                    </div>

                        {/* Derivadas de la fruta seleccionada (informativo, solo lectura) */}
                        <div className={`flex flex-col gap-2.5 transition-all duration-300 ${frutaId !== null ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
                            <label className="text-[13px] font-semibold text-ink">Frutas derivadas:</label>
                            <div className="flex flex-wrap gap-2">
                                {derivadasLoading ? (
                                    <span className="text-[13px] text-gray-500">Cargando derivadas...</span>
                                ) : derivadas.length === 0 ? (
                                    <span className="text-[13px] text-gray-500">Esta fruta no tiene derivadas registradas.</span>
                                ) : (
                                    derivadas.map((derivada) => (
                                        <div
                                            key={derivada.frutaDerivadaId}
                                            className="bg-brand-surface text-brand pr-3 pl-2 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-2"
                                    >
                                        {derivada.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Requerimientos */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-[13px] font-semibold text-ink">Requerimientos Comerciales:</label>
                        <div className="relative">
                            <Input
                                value={requerimientoComercial}
                                onChange={(e) => { setRequerimientoComercial(e.target.value); setErrors((p) => ({ ...p, requerimientoComercial: undefined })); }}
                                placeholder="Ej: 3000"
                                className="rounded-lg h-11 border-border pr-12 shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand placeholder:text-muted-foreground"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-surface text-brand text-[11px] font-bold px-2 py-1 rounded-md">
                                KG
                            </div>
                        </div>
                        <FieldError message={errors.requerimientoComercial} />
                    </div>

                    {errors._form && <p role="alert" className="text-[13px] text-red-500 font-medium">{errors._form}</p>}
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg h-11 px-8 border-border text-ink-muted font-bold hover:bg-muted hover:text-ink transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="rounded-lg h-11 px-6 bg-brand hover:bg-brand-dark text-white font-semibold gap-2 shadow-sm transition-colors active:scale-95"
                    >
                        <Leaf size={18} strokeWidth={2.5} />
                        Crear Campaña
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
