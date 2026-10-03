import { useState } from "react";
import CampaignStatsOverview from "@/modules/campaigns/components/CampaignStatsOverview";
import CampaignFilters from "@/modules/campaigns/components/CampaignFilters";
import CampaignTable from "@/modules/campaigns/components/CampaignTable";
import CampaignCreateModal from "@/modules/campaigns/components/CampaignCreateModal";
import CampaignSuccessModal from "@/modules/campaigns/components/CampaignSuccessModal";
import CampaignStatusTabs from "@/modules/campaigns/components/CampaignStatusTabs";
import { Leaf, Sprout } from "lucide-react";
import PageHeader from "@/shared/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";

export default function CampaignsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [tableKey, setTableKey] = useState(0);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("planificacion");

    const hasActiveFilters = search.trim() !== "" || startDate !== "" || endDate !== "";
    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setIsSuccessModalOpen(true);
        setTableKey((k) => k + 1);
    };

    return (
        <div className="px-4 py-5 sm:px-8 lg:px-14">
            <PageHeader
                icon={<Leaf size={24} strokeWidth={2.5} />}
                title="Gestión de Campaña"
                description="Organiza y planifica tus campañas de exportación."
                action={
                    <Button size="xl" onClick={() => setIsCreateModalOpen(true)}>
                        <Sprout size={20} strokeWidth={2.5} /> Nueva Campaña
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
                key={tableKey}
                status={status}
                search={search}
                startDate={startDate}
                endDate={endDate}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
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
