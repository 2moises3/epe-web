import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  onClick?: () => void;
}

export default function ModuleCard({
  title,
  description,
  icon,
  image,
  onClick,
}: ModuleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ingresar a ${title}`}
      className="group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-left shadow-[0_3px_14px_rgb(0,0,0,0.06)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-brand-border hover:shadow-[0_14px_35px_rgb(0,0,0,0.12)] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page [--card-gutter:1rem] [--card-icon-size:3.5rem] sm:[--card-gutter:1.25rem] dark:shadow-[0_4px_18px_rgb(0,0,0,0.28)] dark:hover:shadow-[0_16px_38px_rgb(0,0,0,0.42)]"
    >
      {/* Efecto de iluminación (Shimmer on hover) */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        <div className="absolute top-0 left-[-150%] h-full w-full skew-x-[-25deg] bg-linear-to-r from-transparent via-white/45 to-transparent transition-all duration-1000 ease-in-out group-hover:left-[150%] dark:via-white/[0.05]"></div>
      </div>

      {/* Imagen protagonista */}
      <div className="relative h-[58%] min-h-36 w-full shrink-0 overflow-hidden bg-muted">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/10 via-transparent to-transparent dark:from-background/25"></div>
        {/* El punto alto (x=52) comparte centro con el icono, sin estirarse con la card. */}
        <svg
          viewBox="0 0 128 48"
          className="pointer-events-none absolute -bottom-px h-12 w-32 fill-card"
          style={{ left: "calc(var(--card-gutter) + var(--card-icon-size) / 2 - 3.25rem)" }}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 0 C9 17 19 27 29 26 C39 25 43 23 52 23 C77 23 82 47 112 47 H128 V48 H0 Z"
            fillOpacity="0.6"
          />
          <path d="M0 14 C9 27 19 31 29 30 C39 29 43 27 52 27 C76 27 80 47 112 47 H128 V48 H0 Z" />
        </svg>
      </div>

      {/* Panel de información unido al borde ondulado de la imagen */}
      <div className="relative z-10 flex min-h-0 flex-1 items-start gap-4 px-(--card-gutter) pb-4 pt-3.5">
        <span
          className="relative -mt-4 flex size-(--card-icon-size) shrink-0 items-center justify-center rounded-full bg-brand-border/80 text-brand-dark transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 dark:bg-brand/35 dark:text-ink"
          aria-hidden="true"
        >
          {icon}
        </span>

        <span className="relative flex min-w-0 flex-1 self-stretch flex-col">
          <span className="mb-1 text-[15px] font-bold leading-tight text-ink sm:text-base xl:text-[17px]">
            {title}
          </span>
          <span className="line-clamp-2 min-h-[2.7em] text-[11.5px] leading-[1.35] text-ink-muted sm:text-xs">
            {description}
          </span>
          <span className="mt-auto flex items-center gap-1 pt-1.5 text-xs font-bold text-brand sm:text-[12.5px]">
            Ingresar
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </span>
      </div>
    </button>
  );
}
