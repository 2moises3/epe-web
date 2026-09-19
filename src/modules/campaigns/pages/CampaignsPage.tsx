import { useMemo, useState } from "react";
import CampaignStatsOverview from "@/modules/campaigns/components/CampaignStatsOverview";
import CampaignFilters from "@/modules/campaigns/components/CampaignFilters";
import CampaignTable from "@/modules/campaigns/components/CampaignTable";
import CampaignCreateModal from "@/modules/campaigns/components/CampaignCreateModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignStatusTabs from "@/modules/campaigns/components/CampaignStatusTabs";
import { campaigns } from "@/modules/campaigns/campaigns.data";
import { Leaf, Plus } from "lucide-react";
import PageHeader from "@/shared/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";

/** Las campañas guardan dd/mm/aaaa; se pasa a aaaa-mm-dd para compararlas con lo que entrega el DatePicker */
const toIsoDate = (value: string) => value.split("/").reverse().join("-");

export default function CampaignsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("Planificado");

    const hasActiveFilters = search !== "" || startDate !== "" || endDate !== "";

    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
    };

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((campaign) => {
            const matchesStatus = campaign.estado === status;
            const matchesSearch = campaign.nombre.toLowerCase().includes(search.trim().toLowerCase());
            // El DatePicker entrega aaaa-mm-dd, así que las fechas de la campaña se llevan a ese formato para comparar
            const matchesStart = !startDate || toIsoDate(campaign.inicio) >= startDate;
            const matchesEnd = !endDate || toIsoDate(campaign.fin) <= endDate;
            return matchesStatus && matchesSearch && matchesStart && matchesEnd;
        });
    }, [search, startDate, endDate, status]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setIsSuccessModalOpen(true);
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Leaf size={24} strokeWidth={2.5} />}
                title="Gestión de Campañas"
                description="Organiza y planifica tus campañas de exportación."
                action={
                    <Button size="xl" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={20} strokeWidth={2.5} /> Nueva Campaña
                    </Button>
                }
            />

            <CampaignStatsOverview />

            <CampaignStatusTabs value={status} onChange={setStatus} className="mt-4 mb-6" />

            <CampaignFilters
                search={search}
                onSearchChange={setSearch}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                hasActiveFilters={hasActiveFilters}
                onClear={clearFilters}
            />

            <CampaignTable
                data={filteredCampaigns}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <CampaignCreateModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={handleCreateSuccess}
            />

            <CampaignSuccessModal
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
            />
        </div>
    );
}