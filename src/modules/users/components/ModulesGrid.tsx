import ModuleCard from "@/modules/users/components/ModuleCard";
import { CalendarDays, Users, User, Truck, ShieldCheck, Warehouse, ReceiptText, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CampaignPlanningImg from "@/assets/campaign_planning.webp";
import SupplierManagementImg from "@/assets/supplier_management.webp";
import CustomerManagementImg from "@/assets/customer_management.webp";
import TransportManagementImg from "@/assets/transport_management.webp";
import QualityManagementImg from "@/assets/quality_management.webp";
import LogisticsDispatchImg from "@/assets/logistics_dispatch.webp";
import BillingCollectionsImg from "@/assets/billing_collections.webp";
import PurchaseSettlementImg from "@/assets/purchase_settlement.webp";

export default function ModulesGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid w-full flex-1 auto-rows-[260px] grid-cols-1 content-start gap-4 px-4 py-4 sm:auto-rows-[270px] sm:grid-cols-2 sm:gap-5 sm:px-8 lg:grid-cols-3 lg:px-14 xl:grid-cols-4">
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
      <ModuleCard
        title="Logística y Despacho"
        description="Coordina almacenes, pedidos y despachos para cada operación de exportación."
        icon={<Warehouse size={28} strokeWidth={1.5} />}
        image={LogisticsDispatchImg}
        onClick={() => {}}
      />
      <ModuleCard
        title="Facturación y Cobros"
        description="Controla comprobantes, vencimientos y cobros de las operaciones comerciales."
        icon={<ReceiptText size={28} strokeWidth={1.5} />}
        image={BillingCollectionsImg}
        onClick={() => {}}
      />
      <ModuleCard
        title="Liquidación de Compra"
        description="Calcula y registra las liquidaciones de compra realizadas a productores."
        icon={<Scale size={28} strokeWidth={1.5} />}
        image={PurchaseSettlementImg}
        onClick={() => {}}
      />
    </div>
  );
}
