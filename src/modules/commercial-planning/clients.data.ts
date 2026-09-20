export interface Client {
    id: number;
    empresa: string;
    representante: string;
    numero: string;
    correo: string;
    ruc: string;
}

/** Datos de muestra mientras el módulo no consume el backend. */
export const clients: Client[] = [
    { id: 1, empresa: "SUTRIMEX", representante: "Brayayin", numero: "987456321", correo: "SUTRIMEX@gmail.com", ruc: "209874563210" },
    { id: 2, empresa: "FIXGROM", representante: "Luchito", numero: "962541387", correo: "FIXGROM@gmail.com", ruc: "209874563210" },
];
