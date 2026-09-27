import { apiClient } from "@/shared/api/client";
import type {
    CertificadoProveedorDto,
    CertificadoProveedorInput,
    ExamenProveedorDto,
    ExamenProveedorInput,
    FrutaDto,
    ProveedorFrutaDto,
} from "@/modules/providers/api/provider-subresources.dto";

export async function getFrutasCatalogo(): Promise<FrutaDto[]> {
    const { data } = await apiClient.get<FrutaDto[]>("/frutas");
    return data;
}

export async function getFrutasProveedor(proveedorId: number): Promise<ProveedorFrutaDto[]> {
    const { data } = await apiClient.get<ProveedorFrutaDto[]>(`/proveedores/${proveedorId}/frutas`);
    return data;
}

export async function assignProveedorFruta(proveedorId: number, frutaId: number): Promise<ProveedorFrutaDto> {
    const { data } = await apiClient.post<ProveedorFrutaDto>(`/proveedores/${proveedorId}/frutas/${frutaId}`);
    return data;
}

export async function unassignProveedorFruta(proveedorId: number, frutaId: number): Promise<void> {
    await apiClient.delete(`/proveedores/${proveedorId}/frutas/${frutaId}`);
}

export async function getExamenesProveedor(proveedorId: number): Promise<ExamenProveedorDto[]> {
    const { data } = await apiClient.get<ExamenProveedorDto[]>(`/proveedores/${proveedorId}/examenes`);
    return data;
}

export async function createExamenProveedor(proveedorId: number, input: ExamenProveedorInput): Promise<ExamenProveedorDto> {
    const { data } = await apiClient.post<ExamenProveedorDto>(`/proveedores/${proveedorId}/examenes`, input);
    return data;
}

export async function updateExamenProveedor(proveedorId: number, examenProveedorId: number, input: ExamenProveedorInput): Promise<ExamenProveedorDto> {
    const { data } = await apiClient.patch<ExamenProveedorDto>(`/proveedores/${proveedorId}/examenes/${examenProveedorId}`, input);
    return data;
}

export async function deleteExamenProveedor(proveedorId: number, examenProveedorId: number): Promise<void> {
    await apiClient.delete(`/proveedores/${proveedorId}/examenes/${examenProveedorId}`);
}

export async function getCertificadosProveedor(proveedorId: number): Promise<CertificadoProveedorDto[]> {
    const { data } = await apiClient.get<CertificadoProveedorDto[]>(`/proveedores/${proveedorId}/certificados`);
    return data;
}

export async function createCertificadoProveedor(proveedorId: number, input: CertificadoProveedorInput): Promise<CertificadoProveedorDto> {
    const { data } = await apiClient.post<CertificadoProveedorDto>(`/proveedores/${proveedorId}/certificados`, input);
    return data;
}

export async function updateCertificadoProveedor(proveedorId: number, certificadoProveedorId: number, input: CertificadoProveedorInput): Promise<CertificadoProveedorDto> {
    const { data } = await apiClient.patch<CertificadoProveedorDto>(`/proveedores/${proveedorId}/certificados/${certificadoProveedorId}`, input);
    return data;
}

export async function deleteCertificadoProveedor(proveedorId: number, certificadoProveedorId: number): Promise<void> {
    await apiClient.delete(`/proveedores/${proveedorId}/certificados/${certificadoProveedorId}`);
}
