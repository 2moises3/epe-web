import { cn } from "@/lib/utils";
import { BRAND_ACTIVE_SURFACE } from "@/shared/styles/brandGradients";

export interface SegmentedControlOption {
    label: string;
    value: string;
}

interface SegmentedControlProps {
    options: SegmentedControlOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
    const activeIndex = Math.max(0, options.findIndex((opt) => opt.value === value));

    return (
        <div className={cn("relative inline-flex h-11 w-full p-1 bg-status-neutral-surface/60 rounded-lg items-center", className)}>
            <span
                aria-hidden
                className="absolute inset-y-1 left-1 rounded-md border border-transparent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{
                    ...BRAND_ACTIVE_SURFACE,
                    width: `calc((100% - 0.5rem) / ${options.length})`,
                    transform: `translateX(${activeIndex * 100}%)`,
                }}
            />
            {options.map((option) => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-pressed={isActive}
                        className={cn(
                            "relative z-10 flex-1 h-full text-[13px] font-bold rounded-md transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand/30 border border-transparent",
                            isActive 
                                ? "text-white" 
                                : "text-ink-muted hover:text-ink"
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
