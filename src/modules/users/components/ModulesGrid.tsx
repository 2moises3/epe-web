import ModuleCard from "@/modules/users/components/ModuleCard";
import { CalendarDays, Users, User, Truck, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CampaignPlanningImg from "@/assets/campaign_planning.webp";
import SupplierManagementImg from "@/assets/supplier_management.webp";
import CustomerManagementImg from "@/assets/customer_management.webp";
import TransportManagementImg from "@/assets/transport_management.webp";
import QualityManagementImg from "@/assets/quality_management.webp";

export default function ModulesGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 autorows-[-minmax(140px,auto)] sm:autorows-[-minmax(155px,auto)] content-start gap-4 sm:gap-6 w-full flex-1 min-h-0 px-4 py-5 sm:px-8 lg:px-14">
      <ModuleCard
        title="Gestión de Campaña"
        description="Organiza y planifica tus campañas de exportación."
        icon={<CalendarDays size={28} strokeWidth={1.5} />}
        image={CampaignPlanningImg}
        onClick={() => navigate("/campaigns")}
      />
      <ModuleCard
        title="Gestión de Proveedores"
        description="Administra y evalúa a tus proveedores."
        icon={<Users size={28} strokeWidth={1.5} />}
        image={SupplierManagementImg}
        onClick={() => navigate("/proveedores")}
      />
      <ModuleCard
        title="Planificación Comercial"
        description="Administra y da seguimiento a tus clientes."
        icon={<User size={28} strokeWidth={1.5} />}
        image={CustomerManagementImg}
        onClick={() => navigate("/planificacion-comercial")}
      />
      <ModuleCard
        title="Gestión de Transporte"
        description="Coordina la logística y flota de transporte de forma eficiente."
        icon={<Truck size={28} strokeWidth={1.5} />}
        image={TransportManagementImg}
        onClick={() => navigate("/transportistas")}
      />
      <ModuleCard
        title="Gestión de Calidad"
        description="Supervisa y garantiza los estándares de calidad de exportación."
        icon={<ShieldCheck size={28} strokeWidth={1.5} />}
        image={QualityManagementImg}
        onClick={() => {}}
      />
    </div>
  );
}
