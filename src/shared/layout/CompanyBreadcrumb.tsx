import { forwardRef } from "react";
import { ChevronRight, Home } from "lucide-react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/shared/components/ui/breadcrumb";
import { getBreadcrumbLevels } from "@/shared/layout/breadcrumbRoutes";
import type { BreadcrumbLevel } from "@/shared/layout/breadcrumbRoutes";
import { cn } from "@/lib/utils";

const MotionBreadcrumbList = motion.create(BreadcrumbList);
const MotionBreadcrumbItem = motion.create(BreadcrumbItem);
const LAYOUT_TRANSITION = { type: "spring", duration: 0.5, bounce: 0 } as const;

interface BreadcrumbStepProps {
    level: BreadcrumbLevel;
    isCurrent: boolean;
    reduceMotion: boolean;
}

// Forward the list item's ref so popLayout can measure and retain exiting steps.
const BreadcrumbStep = forwardRef<HTMLLIElement, BreadcrumbStepProps>(function BreadcrumbStep(
    { level, isCurrent, reduceMotion }, ref,
) {
    const isPresent = useIsPresent();

    return (
        <MotionBreadcrumbItem
            ref={ref}
            layout={reduceMotion ? false : "position"}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -3 }}
            transition={{
                layout: reduceMotion ? { duration: 0 } : LAYOUT_TRANSITION,
                opacity: { duration: reduceMotion ? 0 : 0.2 },
                y: { duration: reduceMotion ? 0 : 0.3, ease: "easeOut" },
            }}
            aria-hidden={!isPresent || undefined}
            inert={!isPresent}
            className="shrink-0 gap-0 whitespace-nowrap"
        >
            <ChevronRight className="mx-2 size-4 shrink-0 text-ink-muted/70 sm:mx-2.5" aria-hidden="true" />
            {isCurrent ? (
                <BreadcrumbPage className="font-semibold text-brand">
                    {level.label}
                </BreadcrumbPage>
            ) : level.href ? (
                <BreadcrumbLink
                    render={<Link to={level.href} />}
                    className="rounded-sm font-semibold text-ink-muted outline-none hover:text-brand focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand/30"
                >
                    {level.label}
                </BreadcrumbLink>
            ) : (
                <span className="text-ink-muted">{level.label}</span>
            )}
        </MotionBreadcrumbItem>
    );
});

export default function CompanyBreadcrumb() {
    const { pathname } = useLocation();
    const levels = getBreadcrumbLevels(pathname);
    const reduceMotion = useReducedMotion() === true;
    const hasLevels = levels.length > 0;

    return (
        <Breadcrumb
            className={cn(
                "absolute left-1/2 top-1/2 z-10 hidden w-[38vw] -translate-x-1/2 -translate-y-1/2 justify-center transition-opacity duration-300 xl:flex motion-reduce:transition-none",
                hasLevels ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-label="Ruta de navegación"
            aria-hidden={!hasLevels || undefined}
            inert={!hasLevels}
        >
            <MotionBreadcrumbList
                layout={!reduceMotion}
                transition={{ layout: reduceMotion ? { duration: 0 } : LAYOUT_TRANSITION }}
                style={{ borderRadius: 8 }}
                className="relative max-w-full flex-nowrap gap-0 overflow-hidden border border-slate-200/70 bg-white px-4 py-2.5 text-[13px] font-semibold"
            >
                <MotionBreadcrumbItem
                    layout={reduceMotion ? false : "position"}
                    transition={{ layout: reduceMotion ? { duration: 0 } : LAYOUT_TRANSITION }}
                    className="shrink-0"
                >
                    <BreadcrumbLink
                        render={<Link to="/modules" />}
                        aria-label="Ir al inicio"
                        className="group inline-flex size-6 items-center justify-center rounded-md text-ink-muted outline-none transition-colors duration-200 hover:bg-slate-50 hover:text-brand focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand/30 motion-reduce:transition-none"
                    >
                        <Home
                            size={17}
                            strokeWidth={2.4}
                            className="text-brand transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
                            aria-hidden="true"
                        />
                    </BreadcrumbLink>
                </MotionBreadcrumbItem>

                {/* Stable ancestor keys keep shared steps visible; only changed steps enter/exit. */}
                <AnimatePresence initial={false} mode="popLayout">
                    {levels.map((level, index) => (
                        <BreadcrumbStep
                            key={levels.slice(0, index + 1).map((ancestor) => ancestor.label).join("/")}
                            level={level}
                            isCurrent={index === levels.length - 1}
                            reduceMotion={reduceMotion}
                        />
                    ))}
                </AnimatePresence>
            </MotionBreadcrumbList>
        </Breadcrumb>
    );
}
