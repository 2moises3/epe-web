import { useState, useMemo } from "react";
import { Link2, MapPin } from "lucide-react";
import AppModal from "@/shared/components/AppModal";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";
import { Combobox } from "@/shared/components/ui/combobox";
import { Button } from "@/shared/components/ui/button";

export interface FincaValues {
    id?: string;
    nombre: string;
    hectareas: string;
    zona: string;
}

interface CampaignFincaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (values: FincaValues) => void;
    linkedIds?: string[];
}

const MOCK_FINCAS: FincaValues[] = [
    { id: "finca-1", nombre: "Finca El Pedregal", hectareas: "15.5", zona: "Sullana Norte" },
    { id: "finca-2", nombre: "Finca San José", hectareas: "8.2", zona: "Tambogrande" },
    { id: "finca-3", nombre: "Finca La Esperanza", hectareas: "12.0", zona: "Piura Sur" },
    { id: "finca-4", nombre: "Finca Los Mangos", hectareas: "5.5", zona: "Chulucanas" },
];

export default function CampaignFincaModal({ open, onOpenChange, onSave, linkedIds = [] }: CampaignFincaModalProps) {
    const [selectedId, setSelectedId] = useState<string>("");
    const [error, setError] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableFincas = useMemo(() => {
        return MOCK_FINCAS.filter(f => !linkedIds.includes(f.id!));
    }, [linkedIds]);

    const options = availableFincas.map(f => ({
        label: `${f.nombre} (${f.hectareas} ha) - ${f.zona}`,
        value: f.id!,
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) {
            setError("Debes seleccionar una finca.");
            return;
        }
        setIsSubmitting(true);
        try {
            const finca = MOCK_FINCAS.find(f => f.id === selectedId)!;
            onSave(finca);
            setSelectedId("");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            icon={<MapPin size={22} strokeWidth={2} />}
            title="Vincular Finca"
            description="Selecciona una de las fincas registradas del proveedor para vincularla a la campaña actual."
            className="sm:max-w-150"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
                <Field>
                    <FieldLabel>Fincas disponibles <span className="text-brand">*</span></FieldLabel>
                    <Combobox
                        options={options}
                        value={selectedId}
                        onChange={(val) => {
                            setSelectedId(val);
                            setError(undefined);
                        }}
                        placeholder="Selecciona una finca..."
                        emptyMessage="No se encontraron fincas."
                        disabled={isSubmitting || options.length === 0}
                    />
                    {options.length === 0 && !isSubmitting && (
                        <p className="text-xs text-ink-muted mt-1">Este proveedor no tiene más fincas disponibles para vincular.</p>
                    )}
                    {error && <FieldError>{error}</FieldError>}
                </Field>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || options.length === 0}>
                        <Link2 size={16} strokeWidth={2.5} className="mr-2" /> Vincular
                    </Button>
                </div>
            </form>
        </AppModal>
    );
}
