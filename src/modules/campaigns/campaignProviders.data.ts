export type ProviderType = "Productor" | "Acopiador";

export interface CampaignProvider {
    id: number;
    nombre: string;
    dni: string;
    zona: string;
    tipo: ProviderType;
    estado: string;
    /** Solo aplica a Productor: si ya tiene entrevista registrada, la acción pasa de "Registrar" a "Ver" */
    entrevistaRegistrada?: boolean;
}

/** Datos de muestra mientras el módulo no consume el backend. */
export const campaignProviders: CampaignProvider[] = [
    { id: 1, nombre: "Robertp", dni: "75369841", zona: "Lima", tipo: "Productor", estado: "Desconocido", entrevistaRegistrada: false },
    { id: 2, nombre: "Felipe", dni: "74125896", zona: "Piura", tipo: "Productor", estado: "Desconocido", entrevistaRegistrada: true },
    { id: 3, nombre: "Juan Pérez", dni: "80215934", zona: "Trujillo", tipo: "Acopiador", estado: "Desconocido" },
    { id: 4, nombre: "Carlos Mendoza", dni: "71542698", zona: "Chiclayo", tipo: "Acopiador", estado: "Desconocido" },
];
