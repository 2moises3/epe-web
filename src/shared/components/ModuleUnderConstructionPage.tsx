import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { navigationItems } from "@/shared/layout/navigationItems";

interface Props {
    moduleId: string;
}

/** Estado inicial compartido para módulos cuya funcionalidad todavía se está construyendo. */
export default function ModuleUnderConstructionPage({ moduleId }: Props) {
    const module = navigationItems.find((item) => item.id === moduleId);
    if (!module) return null;
    const Icon = module.icon;

    return (
        <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
            <div className="page-ambient absolute inset-0 -z-20" aria-hidden="true" />
            <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 overflow-hidden opacity-15 lg:block" aria-hidden="true">
                <img src={module.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-r from-surface-page via-surface-page/65 to-transparent" />
            </div>

            <section className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-brand-border bg-card p-7 shadow-xl sm:p-10">
                <div className="absolute -right-16 -top-20 size-64 rounded-full border border-brand-border/50" aria-hidden="true" />
                <div className="absolute -bottom-24 right-24 size-52 rounded-full border border-brand-border/30" aria-hidden="true" />
                <div className="relative flex flex-col items-start gap-6">
                    <div className="flex size-16 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface text-brand">
                        <Icon size={31} strokeWidth={1.8} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-bold text-brand">
                            <Construction size={14} /> Módulo en construcción
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{module.title}</h1>
                        <p className="max-w-xl text-[15px] leading-relaxed text-ink-muted">{module.description} Estamos preparando su experiencia principal y las operaciones que formarán parte de este módulo.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-page px-4 py-3 text-sm font-medium text-ink-body">
                        <Sparkles size={18} className="shrink-0 text-brand" /> Próximamente podrás gestionar esta operación desde aquí.
                    </div>
                    <Button variant="outline" size="xl" render={<Link to="/modules" />}><ArrowLeft size={18} /> Volver a módulos</Button>
                </div>
            </section>
        </main>
    );
}
