import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Hint from "@/shared/components/Hint";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/shared/components/ui/popover";
import { navigationItems } from "@/shared/layout/navigationItems";
import ModuleLauncherIcon from "@/shared/layout/ModuleLauncherIcon";

/** Acceso a los ocho módulos: enlaces nativos en una cuadrícula navegable con Tab. */
export default function ModuleLauncher() {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Hint label="Módulos" side="bottom">
                <PopoverTrigger
                    aria-label="Abrir selector de módulos"
                    className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-ink-muted outline-none transition-colors duration-200 hover:bg-brand-surface hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40 data-popup-open:bg-brand-surface data-popup-open:text-brand motion-reduce:transition-none"
                >
                    <LayoutGrid size={22} strokeWidth={2} />
                </PopoverTrigger>
            </Hint>
            <PopoverContent
                align="center"
                sideOffset={14}
                showArrow
                className="w-[528px] max-w-[calc(100vw-24px)] gap-0 rounded-xl border border-border bg-popover p-4 shadow-xl ring-0 duration-200 motion-reduce:animate-none sm:p-5"
            >
                <PopoverTitle className="sr-only">Seleccionar módulo</PopoverTitle>
                <nav aria-label="Módulos de la aplicación" className="grid max-h-[min(560px,calc(100dvh-120px))] grid-cols-2 gap-2 overflow-y-auto p-1 min-[380px]:grid-cols-3 min-[520px]:grid-cols-4">
                    {navigationItems.map((item) => {
                        const active = pathname === item.url || pathname.startsWith(`${item.url}/`);
                        return (
                            <Link
                                key={item.id}
                                data-module-option
                                to={item.url}
                                aria-current={active ? "location" : undefined}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "group relative flex aspect-square w-full min-h-0 min-w-0 flex-col items-center justify-center gap-2 rounded-md p-2 text-center text-ink-body outline-none transition-colors duration-200 hover:bg-brand-surface/70 focus-visible:bg-brand-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50 motion-reduce:transition-none",
                                    active && "bg-brand-surface/60 text-ink",
                                )}
                            >
                                <span aria-hidden="true" className="pointer-events-none absolute top-2 right-2 size-3 -translate-x-0.5 translate-y-0.5 rounded-tr-[2px] border-t-[1.5px] border-r-[1.5px] border-brand/70 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none" />
                                <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 size-3 translate-x-0.5 -translate-y-0.5 rounded-bl-[2px] border-b-[1.5px] border-l-[1.5px] border-brand/70 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none" />
                                <ModuleLauncherIcon name={item.id} className="size-10 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none sm:size-12" />
                                <span className="flex min-h-8 items-center justify-center text-[11.5px] font-semibold leading-[1.35] sm:text-xs">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </PopoverContent>
        </Popover>
    );
}
