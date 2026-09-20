export interface Provider {
    id: number;
    nombre: string;
    dni: string;
    fruta: string;
    categoria: string;
    estado: string;
}

/** Datos de muestra mientras el módulo no consume el backend. */
export const providers: Provider[] = [
    { id: 1, nombre: "Moises Chilet", dni: "98765412", fruta: "mango", categoria: "Mango Eduard", estado: "Aprobado" },
    { id: 2, nombre: "Brayan Ponce", dni: "78451296", fruta: "mango", categoria: "Mango Eduard", estado: "Por aprobar" },
];
