import { useId, type ReactNode } from "react";
import { brandShade } from "@/shared/styles/brandGradients";
import "@/shared/layout/ModuleLauncherIcon.css";

export type ModuleIconName = "campaigns" | "providers" | "commercial-planning" | "transport" | "quality" | "logistics" | "billing" | "purchase-settlement";

/** Ilustraciones vectoriales propias del selector. Comparten proporciones y la paleta de marca. */
const artwork: Record<ModuleIconName, ReactNode> = {
    campaigns: <>
        <rect x="9" y="12" width="43" height="43" rx="7" />
        <path d="M9 25h43v23a7 7 0 0 1-7 7H16a7 7 0 0 1-7-7Z" fill="white" opacity=".18" />
        <path d="M20 8v10m21-10v10" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
        <path d="M19 33h5m8 0h5m-18 9h5" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <g data-icon-part="leaf">
        <path d="M32 53c-5-15 5-22 25-21 1 18-11 27-25 21Z" stroke="var(--popover)" strokeWidth="2.5" />
        <path d="m32 55 16-15m-9 8v-7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </>,
    providers: <>
        <g data-icon-part="person-left" opacity=".72"><circle cx="13" cy="23" r="7" /><path d="M2 45c0-8 4-13 11-13s11 5 11 13v4H7a5 5 0 0 1-5-5Z" /></g>
        <g data-icon-part="person-right" opacity=".72"><circle cx="51" cy="23" r="7" /><path d="M40 45c0-8 4-13 11-13s11 5 11 13v-1a5 5 0 0 1-5 5H40Z" /></g>
        <g data-icon-part="person-center">
        <circle cx="32" cy="19" r="10" />
        <path d="M15 49c0-11 6-17 17-17s17 6 17 17v5H15Z" stroke="var(--popover)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M24 40c2-2 5-3 8-3" fill="none" stroke="white" opacity=".45" strokeWidth="3" strokeLinecap="round" />
        </g>
    </>,
    "commercial-planning": <>
        <rect data-icon-part="bar-first" x="8" y="35" width="11" height="21" rx="3.5" opacity=".7" />
        <rect data-icon-part="bar-second" x="26" y="23" width="11" height="33" rx="3.5" opacity=".87" />
        <g data-icon-part="bar-third"><rect x="44" y="8" width="11" height="48" rx="3.5" />
        <path d="M47 14v34" stroke="white" strokeWidth="2" opacity=".25" strokeLinecap="round" />
        </g>
        <path d="m9 24 14-12 10 3" fill="none" stroke="var(--brand-gradient-mid)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".5" />
    </>,
    transport: <>
        <g data-icon-part="truck-body">
        <rect x="5" y="15" width="34" height="33" rx="4" />
        <path d="M39 24h11l10 13v11H39Z" opacity=".82" />
        <path d="M43 28h5l7 10H43Z" fill="white" opacity=".9" />
        <path d="M10 22h22" stroke="white" opacity=".3" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g data-icon-part="wheel-rear">
            <circle cx="18" cy="49" r="8" stroke="var(--popover)" strokeWidth="2.5" />
            <circle cx="18" cy="49" r="2" fill="white" />
            <path d="M18 44v2m4 5-2-1m-6 1 2-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <g data-icon-part="wheel-front">
            <circle cx="49" cy="49" r="8" stroke="var(--popover)" strokeWidth="2.5" />
            <circle cx="49" cy="49" r="2" fill="white" />
            <path d="M49 44v2m4 5-2-1m-6 1 2-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <g fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round">
            <path data-icon-part="wind-top" d="M5 8h15m5 0h5" opacity="0" />
            <path data-icon-part="wind-back" d="M2 29h9M1 36h6" opacity="0" />
            <path data-icon-part="wind-bottom" d="M27 61h14m5 0h5" opacity="0" />
        </g>
    </>,
    quality: <>
        <path d="M32 6c7 5 15 7 23 8v18c0 12-11 21-23 27C20 53 9 44 9 32V14c8-1 16-3 23-8Z" />
        <path d="M32 6v53C20 53 9 44 9 32V14c8-1 16-3 23-8Z" fill="white" opacity=".17" />
        <path data-icon-part="check" pathLength="1" d="m21 31 8 8 15-16" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    logistics: <>
        <path d="m6 25 26-17 26 17v29a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z" />
        <path d="m6 25 26-17 26 17-26-11Z" fill="white" opacity=".2" />
        <g data-icon-part="parcel" opacity="0">
            <rect x="24" y="42" width="16" height="14" rx="2" fill="white" opacity=".85" />
            <path d="M32 42v5m-5 5h4" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g data-icon-part="shutter">
        <rect x="17" y="29" width="30" height="28" rx="3" fill="white" opacity=".95" />
        <path d="M23 36h18M23 43h18M23 50h18" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
        </g>
    </>,
    billing: <>
        <path d="M12 7h23l13 13v34a3 3 0 0 1-3 3H12a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4Z" />
        <path d="M35 7v11a2 2 0 0 0 2 2h11Z" fill="white" opacity=".5" />
        <path d="M17 20h9m-9 10h19m-19 9h11" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <g data-icon-part="coin">
        <circle cx="46" cy="47" r="14" stroke="var(--popover)" strokeWidth="2.5" />
        <path d="M50 41h-6a3 3 0 0 0 0 6h3a3 3 0 0 1 0 6h-6m5-15v18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </>,
    "purchase-settlement": <>
        <path d="M29 12h6v42h-6Z" /><rect x="20" y="53" width="24" height="5" rx="2.5" />
        <circle cx="32" cy="10" r="5" />
        <g data-icon-part="balance">
        <path d="M11 19h42" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" />
        <path d="m15 20-9 22h18Zm34 0-9 22h18Z" fill="none" stroke="var(--brand-gradient-mid)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M3 42h24c-1 7-5 11-12 11S4 49 3 42Zm34 0h24c-1 7-5 11-12 11s-11-4-12-11Z" />
        <path d="M8 45h14m20 0h14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".35" />
        </g>
    </>,
};

export default function ModuleLauncherIcon({ name, className }: { name: ModuleIconName; className?: string }) {
    const gradientId = `module-gradient-${useId().replace(/:/g, "")}`;
    return (
        <svg viewBox="0 0 64 64" width="52" height="52" className={className} data-module-icon={name} aria-hidden="true" focusable="false" fill={`url(#${gradientId})`}>
            <defs>
                <linearGradient id={gradientId} x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                    <stop stopColor={brandShade("+ 0.13", "1.35")} />
                    <stop offset=".55" stopColor={brandShade("+ 0.03", "1.3")} />
                    <stop offset="1" stopColor="var(--brand)" />
                </linearGradient>
            </defs>
            {artwork[name]}
        </svg>
    );
}
