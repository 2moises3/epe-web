import type { CampaniaProveedorDto } from "@/modules/campaigns/api/campania-proveedor.dto";

// DTO ya tiene la forma que necesita la UI (sin fechas ni renombrados) -> alias directo, sin mapeo.
export type CampaniaProveedor = CampaniaProveedorDto;
