import HeroModulesImg from "@/assets/hero_modules.webp";
import HeroPhraseImg from "@/assets/hero_phrase.webp";
import { HERO_CLIP_ID, HERO_EDGE_D } from "@/modules/users/components/WaveClipDefs";
import { Sparkles } from "lucide-react";

/** Ancho de la foto dentro del hero. Lo comparten la foto y la línea decorativa. */
const PHOTO_WIDTH = "67%";

export default function HeroModules() {
  return (
    /* Alto en % del área disponible: el hero cede espacio al grid en pantallas
       bajas, así todo entra sin scroll sin depender de un alto fijo en px. */
    <section className="relative w-full h-auto py-8 lg:py-0 lg:h-[30.6%] shrink-0 overflow-hidden">
      {/* Foto. El borde curvo se recorta por CSS (no viene incrustado en el asset),
          así la altura del hero y la forma de la curva se ajustan por separado.
          En móvil se oculta: el recorte curvo y el 67% de ancho dejarían el texto
          ilegible, y el valor de la pantalla está en las tarjetas de módulo. */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0"
        style={{ width: PHOTO_WIDTH, clipPath: `url(#${HERO_CLIP_ID})` }}
      >
        <img
          src={HeroModulesImg}
          alt="Cultivo de palta de Agro Exportaciones F.V."
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Línea decorativa: el mismo borde, corrido 14px a la izquierda.
          `h-full` es obligatorio: el <svg> es un elemento reemplazado y con solo
          el ancho fijado toma el ratio intrínseco del viewBox (1:1), quedando de
          1013px de alto en vez de los 271 del hero.
          `preserveAspectRatio="none"` deja que el path 0..1 se estire igual que el
          clip-path, y `vectorEffect="non-scaling-stroke"` evita que ese estirado
          deforme el grosor del trazo. */}
      <svg
        className="hidden lg:block absolute inset-y-0 right-0 h-full z-10 pointer-events-none -translate-x-[14px]"
        style={{ width: PHOTO_WIDTH }}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={HERO_EDGE_D}
          fill="none"
          stroke="var(--brand)"
          strokeOpacity="0.3"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Lema. Antes venía incrustado en la foto; como asset aparte se puede
          reubicar y escalar sin volver a exportar la imagen de fondo. */}
      {/* Lema decorativo: se omite en móvil, donde compite con el título por el
          poco ancho disponible sin aportar información. */}
      <img
        src={HeroPhraseImg}
        alt="Del campo al mundo. Frutas que conectan futuros."
        className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 z-10 h-[115%] w-auto object-contain pointer-events-none"
      />

      {/* Columna de textos */}
      <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-8 lg:px-0 lg:pl-16 max-w-full lg:max-w-[35%] xl:max-w-[38%]">
        <div className="flex items-center gap-2 mb-2 lg:mb-3">
          <Sparkles size={16} className="text-brand shrink-0" strokeWidth={2} />
          <span className="text-[12px] sm:text-[14px] md:text-[16px] xl:text-[18px] font-medium tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em]">
            Bienvenido a tu
          </span>
        </div>

        <h1 className="text-[28px] sm:text-4xl lg:text-[42px] xl:text-[52px] leading-[1.1] lg:leading-[1.05] text-brand-dark font-semibold tracking-tight text-balance break-words">
          Centro de operaciones
          <br />
          <span className="text-brand font-medium">Agro F.V.</span>
        </h1>
      </div>
    </section>
  );
}
