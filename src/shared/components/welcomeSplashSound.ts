/**
 * Banda sonora de la intro, sintetizada en el navegador con Web Audio: sin archivos que descargar, sin
 * licencias de terceros y sincronizada con la línea de tiempo de WelcomeSplash.css.
 *
 * Los navegadores solo dejan sonar audio después de un gesto del usuario: `unlockSplashAudio` se llama en el
 * clic que confirma el inicio de sesión, y `playSplashSoundtrack` reutiliza ese mismo contexto ya habilitado.
 */
const MUTE_KEY = "epe:intro-muted";
const MASTER_VOLUME = 0.85;

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

type AudioContextCtor = typeof AudioContext;

/** Habilita el audio. Debe llamarse dentro de un manejador de clic o tecla. */
export function unlockSplashAudio() {
    try {
        const Ctor: AudioContextCtor | undefined =
            window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
        if (!Ctor) return;
        context ??= new Ctor();
        if (context.state === "suspended") void context.resume();
    } catch {
        context = null;
    }
}

export function isSplashMuted(): boolean {
    try {
        return localStorage.getItem(MUTE_KEY) === "1";
    } catch {
        return false;
    }
}

export function saveSplashMuted(muted: boolean) {
    try {
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
        /* Sin almacenamiento: la preferencia dura solo esta sesión */
    }
}

export interface SplashSoundtrack {
    setMuted: (muted: boolean) => void;
    /** Barrido de salida, al cerrarse el iris */
    exit: () => void;
    stop: () => void;
}

/** Programa toda la banda sonora desde ahora. Devuelve null si el audio no está disponible o no se habilitó. */
export function playSplashSoundtrack(): SplashSoundtrack | null {
    if (!context || context.state !== "running") return null;
    const ctx = context;
    const t0 = ctx.currentTime + 0.04;
    const sources: AudioScheduledSourceNode[] = [];

    const master = ctx.createGain();
    master.gain.value = isSplashMuted() ? 0 : MASTER_VOLUME;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.ratio.value = 4;
    master.connect(compressor).connect(ctx.destination);

    if (!noise) {
        noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }

    const at = (seconds: number) => t0 + seconds;
    const panner = (from: number, to: number, start: number, end: number) => {
        if (typeof ctx.createStereoPanner !== "function") return null;
        const pan = ctx.createStereoPanner();
        pan.pan.setValueAtTime(from, start);
        pan.pan.linearRampToValueAtTime(to, end);
        return pan;
    };

    /** Ráfaga de aire filtrada: el "swoosh" de cada transición */
    const whoosh = (time: number, duration: number, fromHz: number, toHz: number, volume: number, panFrom = 0, panTo = 0) => {
        const start = at(time);
        const end = start + duration;
        const source = ctx.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 1.4;
        filter.frequency.setValueAtTime(fromHz, start);
        filter.frequency.exponentialRampToValueAtTime(toHz, end);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + duration * 0.45);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        const pan = panner(panFrom, panTo, start, end);
        source.connect(filter).connect(gain);
        if (pan) gain.connect(pan).connect(master);
        else gain.connect(master);
        source.start(start);
        source.stop(end + 0.05);
        sources.push(source);
    };

    // Solo los barridos de las transiciones, alineados con cada corte de escena
    whoosh(0, 1.2, 180, 900, 0.18);
    // A → B: zoom al sol y círculo naranja
    whoosh(0.85, 0.6, 400, 4200, 0.3);
    // B → C: bandas que barren la pantalla de derecha a izquierda
    whoosh(2.3, 0.75, 2600, 300, 0.34, 0.9, -0.9);
    // C → D: zoom al globo
    whoosh(3.45, 0.55, 250, 3200, 0.3);
    // D → E: los módulos se recogen y aparece el logo
    whoosh(5.0, 0.4, 3000, 200, 0.26);

    let stopped = false;
    const stop = () => {
        if (stopped) return;
        stopped = true;
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(0, now, 0.06);
        sources.forEach((source) => {
            try {
                source.stop(now + 0.4);
            } catch {
                /* Ya detenido */
            }
        });
        window.setTimeout(() => master.disconnect(), 600);
    };

    return {
        setMuted: (muted) => {
            if (stopped) return;
            master.gain.cancelScheduledValues(ctx.currentTime);
            master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, ctx.currentTime, 0.05);
        },
        exit: () => {
            if (stopped) return;
            whoosh(ctx.currentTime - t0, 0.6, 2400, 220, 0.24);
        },
        stop,
    };
}
