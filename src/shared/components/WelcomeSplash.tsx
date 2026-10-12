import { useCallback, useEffect, useRef, useState, type AnimationEvent, type CSSProperties, type JSX } from "react";
import { Volume2, VolumeX } from "lucide-react";
import companyLogo from "@/assets/image/logo_empresa_only.webp";
import { navigationItems } from "@/shared/layout/navigationItems";
import { isSplashMuted, playSplashSoundtrack, saveSplashMuted, type SplashSoundtrack } from "@/shared/components/welcomeSplashSound";
import "@/shared/components/WelcomeSplash.css";

interface WelcomeSplashProps {
    /** El padre pone true cuando la pantalla siguiente ya cargó sus imágenes */
    ready: boolean;
    /** Se llama una vez, cuando la animación de salida terminó */
    onFinished: () => void;
}

type SplashPhase = "playing" | "exiting" | "finished";

/**
 * Línea de tiempo de la intro (ms). Las escenas A–D son motion graphics con cámara y transiciones; la escena
 * E (logo + "Cargando recursos") aparece a los 5.25 s y se sostiene más de 2 s antes de poder salir. Los mismos
 * valores viven en WelcomeSplash.css (--at de cada escena) y en welcomeSplashSound.ts: se cambian juntos.
 */
const MINIMUM_MS = 7_500;
const MAXIMUM_MS = 13_000;

const style = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Texto cinético: cada línea sube desde una máscara, con su retraso; `accent` la pinta con el verde lima. */
function Line({ children, delay = 0, accent = false }: { children: string; delay?: number; accent?: boolean }) {
    return (
        <span className="ws-line">
            <span className={accent ? "ws-accent" : undefined} style={style({ "--d": `${delay}ms` })}>{children}</span>
        </span>
    );
}

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function WelcomeSplash({ ready, onFinished }: WelcomeSplashProps): JSX.Element {
    const [phase, setPhase] = useState<SplashPhase>("playing");
    const [muted, setMuted] = useState(isSplashMuted);
    const rootRef = useRef<HTMLDivElement>(null);
    const mountedAtRef = useRef<number | null>(null);
    const exitStartedRef = useRef(false);
    const finishedRef = useRef(false);
    const onFinishedRef = useRef(onFinished);
    const soundtrackRef = useRef<SplashSoundtrack | null>(null);

    useEffect(() => {
        onFinishedRef.current = onFinished;
    }, [onFinished]);

    // Banda sonora: arranca con la intro y se corta si el componente se desmonta (también en StrictMode)
    useEffect(() => {
        if (prefersReducedMotion()) return;
        const soundtrack = playSplashSoundtrack();
        soundtrackRef.current = soundtrack;
        return () => {
            soundtrack?.stop();
            soundtrackRef.current = null;
        };
    }, []);

    useEffect(() => {
        // El reloj sobrevive a la doble ejecución de StrictMode y a los cambios de ready
        const mountedAt = mountedAtRef.current ?? performance.now();
        mountedAtRef.current = mountedAt;

        const check = () => {
            if (exitStartedRef.current || finishedRef.current) return;
            const elapsed = performance.now() - mountedAt;
            if (elapsed >= MAXIMUM_MS || (ready && elapsed >= MINIMUM_MS)) {
                exitStartedRef.current = true;
                soundtrackRef.current?.exit();
                setPhase("exiting");
            }
        };

        const cancellations = [MINIMUM_MS, MAXIMUM_MS].map((deadline) => {
            let timer: number | undefined;
            const wait = () => {
                const remaining = deadline - (performance.now() - mountedAt);
                // Los navegadores pueden redondear los timers: nunca adelantar la salida mínima
                if (remaining > 0) {
                    timer = window.setTimeout(wait, Math.ceil(remaining));
                    return;
                }
                check();
            };
            wait();
            return () => window.clearTimeout(timer);
        });
        // Un ready tardío (después del mínimo) se atiende de inmediato
        check();

        return () => cancellations.forEach((cancel) => cancel());
    }, [ready]);

    const finish = useCallback(() => {
        // El evento de CSS y su respaldo pueden llegar juntos: solo uno entrega el control
        if (finishedRef.current || !exitStartedRef.current) return;
        finishedRef.current = true;
        setPhase("finished");
        onFinishedRef.current();
    }, []);

    useEffect(() => {
        if (phase !== "exiting" || !rootRef.current) return;
        // Respaldo si el navegador omite animationend: toma la duración real, también en modo reducido
        const seconds = Number.parseFloat(getComputedStyle(rootRef.current).animationDuration);
        const duration = Number.isFinite(seconds) ? seconds * 1_000 : 700;
        const timer = window.setTimeout(finish, duration + 100);
        return () => window.clearTimeout(timer);
    }, [phase, finish]);

    const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && event.animationName.startsWith("ws-exit")) finish();
    };

    const toggleSound = () => {
        const next = !muted;
        setMuted(next);
        saveSplashMuted(next);
        soundtrackRef.current?.setMuted(next);
    };

    return (
        <div
            ref={rootRef}
            className="ws"
            data-phase={phase}
            hidden={phase === "finished"}
            role="status"
            aria-label="Cargando AgroExportaciones"
            onAnimationEnd={handleAnimationEnd}
        >
            {/* ESCENA A · Campo: la cámara baja al horizonte y termina zambulléndose en el sol */}
            <section className="ws-scene ws-a" aria-hidden="true">
                <div className="ws-cam">
                    <svg className="ws-bgsvg" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" fill="none">
                        <defs>
                            <radialGradient id="ws-sun-fill" cx="50%" cy="40%" r="60%">
                                <stop offset="0" stopColor="#fff7b8" />
                                <stop offset=".55" stopColor="#ffd84a" />
                                <stop offset="1" stopColor="#ffb21e" />
                            </radialGradient>
                        </defs>
                        <circle className="ws-sun-halo" cx="80" cy="60" r="38" />
                        <circle className="ws-sun-halo ws-sun-halo-2" cx="80" cy="60" r="29" />
                        <circle className="ws-sun" cx="80" cy="60" r="21" fill="url(#ws-sun-fill)" />
                        <g className="ws-hill ws-hill-far"><path d="M-10 62C20 50 50 58 80 52s60 4 90 -2V90H-10Z" /></g>
                        <g className="ws-hill ws-hill-mid"><path d="M-10 70C24 60 56 68 88 62s52 4 82 0V90H-10Z" /></g>
                        <g className="ws-rows">
                            <path pathLength="100" d="M80 63 4 90" style={style({ "--d": "300ms" })} />
                            <path pathLength="100" d="M80 63 34 90" style={style({ "--d": "380ms" })} />
                            <path pathLength="100" d="M80 63 64 90" style={style({ "--d": "460ms" })} />
                            <path pathLength="100" d="M80 63 96 90" style={style({ "--d": "460ms" })} />
                            <path pathLength="100" d="M80 63 126 90" style={style({ "--d": "380ms" })} />
                            <path pathLength="100" d="M80 63 156 90" style={style({ "--d": "300ms" })} />
                        </g>
                        <g className="ws-hill ws-hill-near"><path d="M-10 80C30 74 60 82 96 77s46 3 74 -1V90H-10Z" /></g>
                    </svg>
                    <div className="ws-leaves">
                        {[8, 22, 37, 63, 78, 92].map((left, index) => (
                            <svg key={left} viewBox="0 0 24 24" style={style({ "--l": `${left}%`, "--d": `${index * 140}ms`, "--s": 1.1 + (index % 3) * 0.5 })}>
                                <path d="M3 18C2 8 11 2 21 3 21 13 15 21 3 18Z" />
                            </svg>
                        ))}
                    </div>
                    <div className="ws-copy ws-copy-center">
                        <p className="ws-tag"><Line delay={150}>Bienvenido a AgroExportaciones</Line></p>
                        <h2 className="ws-headline ws-on-dark">
                            <Line delay={300}>DE LA</Line>
                            <Line delay={420} accent>COSECHA</Line>
                        </h2>
                    </div>
                </div>
            </section>

            {/* ESCENA B · Fruta: cámara con paneo e inclinación, frutas que entran volando con rebote */}
            <section className="ws-scene ws-b" aria-hidden="true">
                <div className="ws-cam">
                    <div className="ws-blob ws-blob-1" />
                    <div className="ws-blob ws-blob-2" />
                    <div className="ws-rays" />
                    <svg className="ws-fruitsvg" viewBox="0 0 100 100" fill="none" strokeLinejoin="round" strokeLinecap="round">
                        <g transform="translate(8 26) rotate(-20) scale(.55)">
                            <g className="ws-fly" style={style({ "--fx": "-70px", "--fy": "-30px", "--d": "380ms" })}>
                                <g className="ws-float"><path className="ws-leaf" d="M0 20C-4 0 16-8 35-1 33 19 18 28 0 20Z" /></g>
                            </g>
                        </g>
                        <g transform="translate(86 20) rotate(40) scale(.5)">
                            <g className="ws-fly" style={style({ "--fx": "70px", "--fy": "-40px", "--d": "460ms" })}>
                                <g className="ws-float"><path className="ws-leaf" d="M0 0C15-17 33-8 38 8 23 19 8 17 0 0Z" /></g>
                            </g>
                        </g>

                        {/* Mango */}
                        <g transform="translate(50 52) rotate(-8) scale(.5) translate(-35 -45)">
                            <g className="ws-fly" style={style({ "--fx": "0px", "--fy": "90px", "--d": "100ms" })}>
                                <g className="ws-float ws-float-slow">
                                    <path className="ws-mango" d="M40 21C65 18 78 36 67 59 58 79 34 89 18 72 1 53 11 28 40 21Z" />
                                    <path className="ws-blush" d="M52 30c10 6 12 20 6 32" />
                                    <path className="ws-shine" d="M22 46c-5 13 0 23 8 26" />
                                    <path className="ws-leaf" d="M40 22C31 7 42 0 64 7 60 19 51 24 40 22Z" />
                                </g>
                            </g>
                        </g>
                        {/* Uvas */}
                        <g transform="translate(21 52) rotate(-12) scale(.44) translate(-30 -45)">
                            <g className="ws-fly" style={style({ "--fx": "-90px", "--fy": "20px", "--d": "240ms" })}>
                                <g className="ws-float">
                                    <path className="ws-stem" d="M29 20c-7-13 0-18 10-19" />
                                    <path className="ws-leaf" d="M29 17C39 0 56 7 54 18 44 25 36 24 29 17Z" />
                                    <g className="ws-grape">
                                        <circle cx="16" cy="30" r="12" /><circle cx="39" cy="30" r="12" />
                                        <circle cx="11" cy="49" r="11" /><circle cx="31" cy="48" r="12" /><circle cx="49" cy="47" r="10" />
                                        <circle cx="21" cy="66" r="11" /><circle cx="40" cy="65" r="10" /><circle cx="31" cy="81" r="9" />
                                    </g>
                                    <path className="ws-shine" d="m13 26 4-2m11 21 4-2m-14 19 3-2" />
                                </g>
                            </g>
                        </g>
                        {/* Palta */}
                        <g transform="translate(80 58) rotate(18) scale(.5) translate(-26 -42)">
                            <g className="ws-fly" style={style({ "--fx": "90px", "--fy": "30px", "--d": "320ms" })}>
                                <g className="ws-float ws-float-slow">
                                    <path className="ws-avo-skin" d="M26 0C8 0 13 18 2 35-15 61 0 84 26 84S67 61 50 35C39 18 44 0 26 0Z" />
                                    <path className="ws-avo-flesh" d="M26 7c-10 0-7 17-17 34C-3 62 8 77 26 77s29-15 17-36C33 24 36 7 26 7Z" />
                                    <ellipse className="ws-avo-seed" cx="26" cy="55" rx="15" ry="18" />
                                    <path className="ws-shine" d="M19 50c0-4 3-7 6-8" />
                                </g>
                            </g>
                        </g>
                        {/* Arándanos */}
                        <g transform="translate(66 82) rotate(-6) scale(.46) translate(-30 -30)">
                            <g className="ws-fly" style={style({ "--fx": "60px", "--fy": "80px", "--d": "520ms" })}>
                                <g className="ws-float">
                                    <path className="ws-leaf" d="M23 13C9 10 6 1 12-7 24-6 29 2 23 13Z" />
                                    <circle className="ws-berry-back" cx="39" cy="21" r="20" />
                                    <circle className="ws-berry" cx="17" cy="39" r="23" />
                                    <path className="ws-crown" d="m15 24 3 5 6-1-2 6 3 5-6 1-4 4-3-6-5-2 5-4Z" />
                                    <path className="ws-crown" d="m38 10 2 4 5-1-2 4 2 4-5-1-3 3-1-5-4-2 4-2Z" />
                                </g>
                            </g>
                        </g>
                    </svg>
                    <div className="ws-copy ws-copy-top">
                        <h2 className="ws-headline ws-on-orange">
                            <Line delay={420}>A LA</Line>
                            <Line delay={540} accent>EXPORTACIÓN</Line>
                        </h2>
                    </div>
                </div>
            </section>

            {/* ESCENA C · Mundo: dolly hacia el globo, rutas lima hacia los mercados y zambullida final */}
            <section className="ws-scene ws-c" aria-hidden="true">
                <div className="ws-cam">
                    <div className="ws-grid" />
                    <svg className="ws-globesvg" viewBox="0 0 100 100" fill="none" strokeLinecap="round">
                        <circle className="ws-globe-halo" cx="50" cy="50" r="38" />
                        <circle className="ws-globe" cx="50" cy="50" r="26" />
                        <g className="ws-globe-lines">
                            <ellipse cx="50" cy="50" rx="26" ry="26" className="ws-meridian" style={style({ "--p": "0ms" })} />
                            <ellipse cx="50" cy="50" rx="26" ry="26" className="ws-meridian" style={style({ "--p": "660ms" })} />
                            <ellipse cx="50" cy="50" rx="26" ry="26" className="ws-meridian" style={style({ "--p": "1320ms" })} />
                            <path d="M25 40h50M25 60h50M24 50h52" />
                        </g>
                        <g className="ws-routes">
                            <path pathLength="100" d="M40 60Q27 47 33 38" style={style({ "--d": "450ms" })} />
                            <path pathLength="100" d="M40 60Q54 42 57 35" style={style({ "--d": "650ms" })} />
                            <path pathLength="100" d="M40 60Q62 68 69 47" style={style({ "--d": "850ms" })} />
                        </g>
                        <g className="ws-ports">
                            <circle cx="40" cy="60" r="2.4" className="ws-port ws-port-origin" style={style({ "--d": "300ms" })} />
                            <circle cx="33" cy="38" r="2" className="ws-port" style={style({ "--d": "1250ms" })} />
                            <circle cx="57" cy="35" r="2" className="ws-port" style={style({ "--d": "1450ms" })} />
                            <circle cx="69" cy="47" r="2" className="ws-port" style={style({ "--d": "1650ms" })} />
                            <circle cx="33" cy="38" r="2" className="ws-port-ping" style={style({ "--d": "1250ms" })} />
                            <circle cx="57" cy="35" r="2" className="ws-port-ping" style={style({ "--d": "1450ms" })} />
                            <circle cx="69" cy="47" r="2" className="ws-port-ping" style={style({ "--d": "1650ms" })} />
                        </g>
                    </svg>
                    <div className="ws-copy ws-copy-bottom">
                        <h2 className="ws-headline ws-on-teal">
                            <Line delay={350}>MERCADOS</Line>
                            <Line delay={470} accent>GLOBALES</Line>
                        </h2>
                    </div>
                </div>
            </section>

            {/* ESCENA D · Módulos: la cámara retrocede, los ocho módulos entran y al final se recogen al centro */}
            <section className="ws-scene ws-d" aria-hidden="true">
                <div className="ws-cam">
                    <div className="ws-glow" />
                    <div className="ws-copy ws-copy-top ws-copy-d">
                        <p className="ws-tag"><Line delay={200}>Todo en un solo lugar</Line></p>
                        <h2 className="ws-headline ws-headline-sm ws-on-dark">
                            <Line delay={320}>OCHO MÓDULOS.</Line>
                            <Line delay={440} accent>UNA OPERACIÓN.</Line>
                        </h2>
                    </div>
                    <ul className="ws-modules">
                        {navigationItems.map((item, index) => {
                            const Icon = item.icon;
                            const angle = (index / navigationItems.length) * Math.PI * 2;
                            return (
                                <li
                                    key={item.id}
                                    style={style({
                                        "--d": `${150 + index * 50}ms`,
                                        "--fx": `${Math.round(Math.cos(angle) * 60)}vmin`,
                                        "--fy": `${Math.round(Math.sin(angle) * 45)}vmin`,
                                        "--fr": `${index % 2 === 0 ? -35 : 35}deg`,
                                    })}
                                >
                                    <span className="ws-chip"><Icon strokeWidth={2.2} /></span>
                                    <span className="ws-chip-label">{item.navTitle}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ESCENA E · Logo y carga: sigue el tema del sistema (claro/oscuro) */}
            <section className="ws-scene ws-e">
                <div className="ws-cam">
                    <div className="ws-e-glow" aria-hidden="true" />
                    <div className="ws-logo-stage" aria-hidden="true">
                        <span className="ws-ring ws-ring-1" />
                        <span className="ws-ring ws-ring-2" />
                        <span className="ws-ring ws-ring-3" />
                        <span className="ws-logo-disc" />
                        <img className="ws-logo" src={companyLogo} alt="" draggable={false} />
                    </div>
                    <div className="ws-loading">
                        <p className="ws-loading-label">
                            Cargando recursos<span className="ws-dots" aria-hidden="true"><i /><i /><i /></span>
                        </p>
                        <div className="ws-bar" aria-hidden="true"><span /></div>
                    </div>
                </div>
            </section>

            {/* Transiciones encima de las escenas: destellos de corte y bandas de color que barren la pantalla */}
            <div className="ws-fx" aria-hidden="true">
                <span className="ws-burst" style={style({ "--x": "50%", "--y": "66%", "--t": "1050ms" })} />
                <span className="ws-swipe ws-swipe-1" />
                <span className="ws-swipe ws-swipe-2" />
                <span className="ws-swipe ws-swipe-3" />
                <span className="ws-burst ws-burst-globe" style={style({ "--x": "50%", "--y": "45%", "--t": "3750ms" })} />
                <span className="ws-burst ws-burst-lime" style={style({ "--x": "50%", "--y": "44%", "--t": "5230ms" })} />
            </div>

            <button
                type="button"
                className="ws-sound"
                onClick={toggleSound}
                aria-label={muted ? "Activar sonido de la intro" : "Silenciar la intro"}
                aria-pressed={!muted}
            >
                {muted ? <VolumeX size={18} strokeWidth={2.2} /> : <Volume2 size={18} strokeWidth={2.2} />}
            </button>
        </div>
    );
}
