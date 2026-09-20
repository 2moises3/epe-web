export interface CampaignGrower {
    id: number;
    name: string;
    location: string;
    hectares: number;
    owner: string;
    phone: string;
    varieties: string[];
}

export interface CampaignClient {
    id: number;
    name: string;
    type: string;
    contact: string;
    email: string;
    orders: number;
    status: "Activo" | "Inactivo";
}

export interface CampaignCertification {
    id: number;
    name: string;
    files: string[];
    expires: string;
    icon: "leaf" | "file" | "tree" | "shield";
}

interface CampaignDetails {
    harvested: number;
    estimated: number | null;
    providers: CampaignGrower[];
    clients: CampaignClient[];
    certifications: CampaignCertification[];
}

/** Existing demo relationships belong to campaign 1, not to every campaign. */
const DETAILS: Record<number, CampaignDetails> = {
    1: {
        harvested: 0,
        estimated: null,
        providers: [
            { id: 1, name: "Fundo Los Olivos", location: "Piura", hectares: 45, owner: "Carlos Mendoza", phone: "+51 973 441 220", varieties: ["Mango Kent", "Mango Tommy"] },
            { id: 2, name: "Agrícola San Martín", location: "Lambayeque", hectares: 28, owner: "Rosa Gutiérrez", phone: "+51 945 882 331", varieties: ["Mango Kent", "Mango Ataulfo"] },
            { id: 3, name: "Fundo El Milagro", location: "La Libertad", hectares: 62, owner: "Jorge Paredes", phone: "+51 961 334 775", varieties: ["Mango Dulce", "Mango Haden"] },
            { id: 4, name: "Cooperativa Valle Verde", location: "Piura", hectares: 110, owner: "Ana Flores", phone: "+51 987 221 004", varieties: ["Mango Kent", "Mango Edward", "Mango Tommy"] },
        ],
        clients: [
            { id: 1, name: "Ripley", type: "Ecommerce", contact: "Sofía Vargas", email: "svargas@ripley.com.pe", orders: 12, status: "Activo" },
            { id: 2, name: "Saga Falabella", type: "Retail", contact: "Marco Ríos", email: "mrios@falabella.com.pe", orders: 8, status: "Activo" },
            { id: 3, name: "Plaza Vea", type: "Supermercado", contact: "Lucía Torres", email: "ltorres@plazavea.com.pe", orders: 21, status: "Activo" },
            { id: 4, name: "Metro", type: "Supermercado", contact: "Pedro Cárdenas", email: "pcardenas@metro.com.pe", orders: 5, status: "Inactivo" },
        ],
        certifications: [
            { id: 1, name: "GlobalG.A.P.", files: ["certificado_globalgap.pdf", "informe_auditoria.pdf", "anexo_tecnico.pdf"], expires: "31/12/2026", icon: "leaf" },
            { id: 2, name: "SENASA Export", files: ["certificado_senasa.pdf", "registro_exportador.pdf"], expires: "15/06/2026", icon: "file" },
            { id: 3, name: "Rainforest Alliance", files: ["certificado_ra.pdf", "informe_social.pdf", "informe_ambiental.pdf", "plan_mejora.pdf"], expires: "20/09/2025", icon: "tree" },
            { id: 4, name: "BRC Food Safety", files: ["certificado_brc.pdf", "auditoria_brc.pdf", "plan_haccp.pdf"], expires: "01/03/2025", icon: "shield" },
        ],
    },
};

const EMPTY_DETAILS: CampaignDetails = { harvested: 0, estimated: null, providers: [], clients: [], certifications: [] };

export const getCampaignDetails = (id: number): CampaignDetails => DETAILS[id] ?? EMPTY_DETAILS;

export const getGrowerTotals = (providers: CampaignGrower[]) => ({
    hectares: providers.reduce((sum, provider) => sum + provider.hectares, 0),
    varieties: new Set(providers.flatMap((provider) => provider.varieties)).size,
});
