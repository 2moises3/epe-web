import { useNavigate } from "react-router-dom";
import ModuleCard from "@/modules/users/components/ModuleCard";
import { navigationItems } from "@/shared/layout/navigationItems";

export default function ModulesGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid w-full flex-1 auto-rows-[260px] grid-cols-1 content-start gap-4 px-4 py-4 sm:auto-rows-[270px] sm:grid-cols-2 sm:gap-5 sm:px-8 lg:grid-cols-3 lg:px-14 xl:grid-cols-4">
      {navigationItems.map((module) => (
        <ModuleCard
          key={module.id}
          title={module.title}
          description={module.description}
          icon={<module.icon size={28} strokeWidth={1.5} />}
          image={module.image}
          onClick={() => navigate(module.url)}
        />
      ))}
    </div>
  );
}
