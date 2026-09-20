import type { ClienteNegocio } from "@/modules/clients/api/cliente-negocio.mapper";

export interface Client extends ClienteNegocio {
    id: number;
    empresa: string;
    representante: string;
    numero: string;
    correo: string;
}

export function toClient(cliente: ClienteNegocio): Client {
    return {
        ...cliente,
        id: cliente.clienteNegocioId,
        empresa: cliente.nombreEmpresa,
        representante: cliente.nombreContacto,
        numero: cliente.telefono,
        correo: cliente.correoCorporativo,
    };
}
