export interface Carrier {
    id: number;
    nombre: string;
    numero: string;
    correo: string;
    ruc: string;
}

/** Medidas en metros y pesos en toneladas */
export interface Vehicle {
    id: number;
    carrierId: number;
    placa: string;
    ancho: number;
    altura: number;
    profundidad: number;
    pesoNeto: number;
    pesoBruto: number;
}

/** Cada chofer se vincula directamente a un vehículo; `null` mientras no tenga uno asignado */
export interface Driver {
    id: number;
    carrierId: number;
    nombre: string;
    telefono: string;
    correo: string;
    vehiculoId: number | null;
}

/** Datos de muestra mientras el módulo no consume el backend. */
export const carriers: Carrier[] = [
    { id: 1, nombre: "SUTRIMEX", numero: "987456321", correo: "SUTRIMEX@gmail.com", ruc: "20987456321" },
    { id: 2, nombre: "FIXGROM", numero: "962541387", correo: "FIXGROM@gmail.com", ruc: "20962541387" },
    { id: 3, nombre: "TRANSPACK", numero: "943218876", correo: "transpack@gmail.com", ruc: "20943218876" },
    { id: 4, nombre: "CARGO NORTE", numero: "978123400", correo: "cargonorte@gmail.com", ruc: "20978123400" },
    { id: 5, nombre: "Transportes del Pacífico S.A.C.", numero: "981245670", correo: "contacto@transportespacifico.pe", ruc: "20654321876" },
    { id: 6, nombre: "Logística Integral Norte E.I.R.L.", numero: "964378210", correo: "operaciones@loginorte.pe", ruc: "20498123654" },
    { id: 7, nombre: "Servicios de Carga Andina S.R.L.", numero: "955621498", correo: "carga@andina.pe", ruc: "20567432109" },
    { id: 8, nombre: "Distribuciones Valle Verde S.A.C.", numero: "972114586", correo: "info@valleverde.pe", ruc: "20345678912" },
];

export const vehicles: Vehicle[] = [
    { id: 1, carrierId: 1, placa: "C4K-908", ancho: 2.4, altura: 2.5, profundidad: 6.1, pesoNeto: 5.3, pesoBruto: 12 },
    { id: 2, carrierId: 1, placa: "T6A-482", ancho: 2.6, altura: 2.75, profundidad: 10.2, pesoNeto: 8.2, pesoBruto: 28 },
    { id: 3, carrierId: 2, placa: "B9Q-714", ancho: 2.5, altura: 2.6, profundidad: 8, pesoNeto: 6.5, pesoBruto: 18 },
    { id: 4, carrierId: 3, placa: "A7R-221", ancho: 2.4, altura: 2.55, profundidad: 7.2, pesoNeto: 6, pesoBruto: 15 },
];

export const drivers: Driver[] = [
    { id: 1, carrierId: 1, nombre: "Miguel Torres", telefono: "987 431 222", correo: "mtorres@sutrimex.pe", vehiculoId: 2 },
    { id: 2, carrierId: 2, nombre: "Elena Ruiz", telefono: "956 882 114", correo: "eruiz@fixgrom.pe", vehiculoId: 3 },
    { id: 3, carrierId: 3, nombre: "Joel Cárdenas", telefono: "943 172 008", correo: "jcardenas@transpack.pe", vehiculoId: 4 },
];

/** Volumen interno en m³ = ancho × altura × profundidad */
export const vehicleVolume = (vehicle: Vehicle) => vehicle.ancho * vehicle.altura * vehicle.profundidad;
