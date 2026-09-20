# Entidades del backend ↔ Vistas del frontend (epe-web)

Este documento es la fuente de verdad de qué entidad del backend (`epe-backend`) está conectada
a qué vista del frontend, y cuáles todavía no tienen ninguna conexión. El backend seguirá
evolucionando — **toda entidad que no aparezca en la tabla de "Conectadas" se considera pendiente**,
sin importar si existe o no en el backend actual.

## Conectadas

| Entidad (backend) | Vista/componente | Alcance | Archivos frontend |
|---|---|---|---|
| Campana | `CampaignsPage`, `CampaignDetailsPage`, `CampaignTable` | CRUD completo (listar, crear, editar, eliminar) | `modules/campaigns/api/campaign.{dto,mapper,api}.ts` |
| Fruta | Dropdown en `CampaignCreateModal` y `CampaignEditModal` | Solo catálogo de lectura (`getFrutas`), sin vista de gestión propia | `FrutaDto`/`getFrutas()` en `modules/campaigns/api/campaign.{dto,api}.ts` |
| CampaniaProveedor | `CampaignProvidersModal` (dentro de `CampaignDetailsPage`) | CRUD completo (agregar, listar, eliminar proveedor de una campaña) | `modules/campaigns/api/campania-proveedor.{dto,mapper,api}.ts` |
| Proveedor | Select dentro de `CampaignProvidersModal` | Solo catálogo de lectura (`getProveedores`), sin vista de gestión propia | `ProveedorDto`/`getProveedores()` en `modules/campaigns/api/campania-proveedor.{dto,api}.ts` |
| CertificadoCampana | `CampaignCertificationsModal` (dentro de `CampaignDetailsPage`) | Solo listar y eliminar. Crear queda pendiente: el backend exige `documentUrl` válida y no existe endpoint de upload/storage para convertir un archivo local en URL | `modules/campaigns/api/certificado-campana.{dto,mapper,api}.ts` |

## Pendientes (sin ninguna vista ni conexión)

| Entidad (backend) | Notas |
|---|---|
| FrutaDerivada | Sub-recurso de Fruta, sin vista. |
| ProveedorFruta | Relación N:N proveedor↔fruta, sin vista. |
| CertificadoProveedor | Certificados propios de un proveedor, sin vista (no existe módulo de gestión de Proveedor todavía). |
| ClienteNegocio | Sin vista. El sidebar/`ModulesGrid` tiene una card "Gestión de Clientes" pero apunta por error a `/certificaciones` (bug preexistente, no corregido por decisión explícita de no crear/tocar rutas nuevas). |
| ClienteNegocioCampana | Relación cliente↔campaña, sin vista. |

## Notas de convenciones adoptadas

- Fechas de negocio (`fechaInicio`, `fechaFin`, `fechaVencimiento`): se convierten a `Date` en el mapper del frontend, parseadas con `new Date(fecha + "T00:00:00")` para evitar corrimiento de día por timezone, y formateadas de vuelta a `"YYYY-MM-DD"` al enviar al backend.
- Decimales (`requerimientoComercial`, `cantidadProveedor`, `mtdCeratitis`): se mantienen como `string` en todo el flujo frontend, nunca se castean a `number` (para no perder precisión).
- Naming inconsistente `documentUrl`/`documentoUrl` en el backend: el DTO crudo respeta el nombre exacto que manda cada endpoint; el modelo de frontend normaliza siempre a `documentoUrl`.
- Cuando un DTO ya tiene exactamente la forma que necesita el frontend (sin fechas, decimales o renombrados), no se crea un mapper "passthrough" innecesario — se usa un alias de tipo (`export type X = XDto`) o se reutiliza el DTO directamente. Ejemplos: `CampaniaProveedor`.
- Patrón de archivos por dominio: `<dominio>.dto.ts` (espejo del JSON crudo del backend), `<dominio>.mapper.ts` (transforma DTO↔modelo, solo si hace falta transformación real), `<dominio>.api.ts` (funciones que usan el `apiClient` compartido de `shared/api/client.ts` y devuelven siempre el modelo mapeado, nunca el DTO crudo). Catálogos de solo lectura sin entidad propia en la UI (ej. Fruta, Proveedor usados como dropdown) pueden vivir dentro del archivo `.api.ts`/`.dto.ts` del dominio que los consume, en vez de crear un módulo nuevo, mientras no tengan vista de gestión propia.
