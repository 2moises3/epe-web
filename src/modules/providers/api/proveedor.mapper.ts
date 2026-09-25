import type { ProveedorDto } from "@/modules/providers/api/proveedor.dto";

// DTO ya tiene la forma que necesita la UI (sin fechas ni renombrados) -> alias directo, sin mapeo.
export type Proveedor = ProveedorDto;
