import { useState, useMemo } from "react";
import { Truck, Send, Building2 } from "lucide-react";
import CarriersFilters from "@/modules/carriers/components/CarriersFilters";
import CarriersTable from "@/modules/carriers/components/CarriersTable";
import CarrierFormModal from "@/modules/carriers/components/CarrierFormModal";
import CarrierSendRequirementModal from "@/modules/carriers/components/CarrierSendRequirementModal";
import CarrierSuccessModal, { type CarrierSuccessMode } from "@/modules/carriers/components/CarrierSuccessModal";
import PageHeader from "@/shared/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { carriers as initialCarriers } from "@/modules/carriers/carriers.data";

export default function CarriersPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);

    const [carriers, setCarriers] = useState(initialCarriers);
    const [success, setSuccess] = useState<{ open: boolean; mode: CarrierSuccessMode }>({ open: false, mode: "carrier-created" });
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const hasActiveFilters = search !== "";

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return carriers.filter((item) => item.nombre.toLowerCase().includes(searchLower));
    }, [carriers, search]);

    const selectedCarriers = useMemo(() => carriers.filter((item) => selectedIds.has(item.id)), [carriers, selectedIds]);

    const showSuccess = (mode: CarrierSuccessMode) => setSuccess({ open: true, mode });

    const deleteCarrier = (id: number) => {
        setCarriers((current) => current.filter((item) => item.id !== id));
        setSelectedIds((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
        });
    };

    const toggleRow = (id: number) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = (ids: number[]) => {
        setSelectedIds((current) => {
            const allSelected = ids.every((id) => current.has(id));
            const next = new Set(current);
            ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
            return next;
        });
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Truck size={24} strokeWidth={2.5} />}
                title="Gestión de Transporte"
                description={`${carriers.length} empresas de transporte registradas${selectedIds.size > 0 ? ` · ${selectedIds.size} seleccionados` : ""}`}
                action={
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 [&>button]:w-full sm:[&>button]:w-auto">
                        <Button
                            variant="outline"
                            size="xl"
                            disabled={selectedIds.size === 0}
                            onClick={() => setIsRequirementModalOpen(true)}
                        >
                            <Send size={20} strokeWidth={2.5} /> Enviar requerimiento
                            {selectedIds.size > 0 && (
                                <Badge variant="brand" className="ml-1">{selectedIds.size}</Badge>
                            )}
                        </Button>
                        <Button
                            size="xl"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Building2 size={20} strokeWidth={2.5} /> Agregar empresa de transporte
                        </Button>
                    </div>
                }
            />

            <CarriersFilters
                search={search}
                onSearchChange={setSearch}
                hasActiveFilters={hasActiveFilters}
                onClear={() => setSearch("")}
            />

            <CarriersTable
                data={filteredData}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={() => setSearch("")}
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                onToggleAll={toggleAll}
                onDelete={deleteCarrier}
            />

            <CarrierFormModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    showSuccess("carrier-created");
                }}
            />

            <CarrierSendRequirementModal
                open={isRequirementModalOpen}
                onOpenChange={setIsRequirementModalOpen}
                selectedCarriers={selectedCarriers}
                onRemoveCarrier={toggleRow}
                onSuccess={() => {
                    setIsRequirementModalOpen(false);
                    setSelectedIds(new Set());
                    showSuccess("requirement-sent");
                }}
            />

            <CarrierSuccessModal
                open={success.open}
                onOpenChange={(open) => setSuccess((current) => ({ ...current, open }))}
                mode={success.mode}
            />
        </div>
    );
}
