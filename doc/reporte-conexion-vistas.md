# Reporte de conexión de vistas al backend — epe-web

> **Actualización de auditoría: 2026-09-20.** Esta entrada complementa, no reemplaza, los estados históricos de 2026-09-08 que siguen abajo. En esta iteración se conectaron clientes (listar/crear/editar/eliminar e historial de contratos) y derivados de fruta en detalle de campaña, se reemplazaron KPIs de muestra por conteos de campañas reales y se deshabilitaron funciones sin API. Se conservan sus archivos fixture; las vistas activas no deben leerlos.

## Estado por vista/componente — revisión 2026-09-20

| Vista/componente | Estado — fecha | Alcance verificado / pendiente |
|---|---|---|
| `campaigns/pages/CampaignsPage.tsx` y campaña CRUD | **Parcial — 2026-09-20** | Campañas conectadas (lectura/crear/editar/eliminar según historial). Revisar operaciones de entidades relacionadas; fruta es catálogo de solo lectura. |
| `campaigns/pages/CampaignDetailsPage.tsx` | **Parcial — 2026-09-20** | Campaña y certificados consultados; Derivados consulta `GET /frutas/:frutaId/derivadas` según la fruta de la campaña (lectura solamente). Crear certificado sigue sin flujo claro de URL de documento; cosecha no tiene API. |
| `campaigns/pages/CampaignProvidersPage.tsx` / gestión de proveedores de campaña | **Parcial — 2026-09-20** | Relación campaña-proveedor conectada; contrato aún no cubre explícitamente todos los PATCH/DELETE y asignaciones posibles desde la vista. |
| `campaigns/pages/CampaignCarrierPaymentsPage.tsx` y modales de pago | **Sin cambios / deshabilitada — 2026-09-20 / API faltante** | No hay entidad ni endpoint de pagos/transportistas. La página muestra aviso y no monta tabla, filtros ni operaciones simuladas. Se conserva `campaigns/carrierPayments.data.ts` como referencia; no se usa desde esta vista. |
| `providers/pages/ProvidersPage.tsx` / `ProvidersTable.tsx` | **Parcial — 2026-09-20** | Lista real `GET /proveedores`; acción de entrevista deshabilitada por falta de API. CRUD y subrecursos existentes todavía no se exponen completamente. `ProviderViewModal.tsx` tiene datos de ejemplo y no está conectado a la tabla actual. |
| `commercial-planning/pages/CommercialPlanningPage.tsx` y componentes de clientes | **Parcial — 2026-09-20** | Lista, alta, edición y eliminación usan `/clientes-negocio`; detalle consulta `GET /clientes-negocio/:id/contratos`. Falta integrar “Añadir contrato”: la UI tiene archivos locales pero no hay API de almacenamiento; la asociación requiere campaignId y URLs para documento/ficha técnica. |
| `auth/pages/AdminLoginPage.tsx` | **Sin cambios — 2026-09-20 / decisión previa vigente** | Backend carece de autenticación; conservar mock hasta definir auth. |
| `campaigns/components/CampaignStatsOverview.tsx` | **Parcial — 2026-09-20** | KPIs de cantidades por estado calculados con `getCampanas()`. Se quitaron las tendencias porcentuales de muestra porque el backend no expone históricos/variaciones. |
| Entrevistas en `CampaignProvidersPage` y `ProvidersTable` | **Sin cambios / deshabilitadas — 2026-09-20 / API faltante** | No hay API de entrevistas; no se presenta contenido de ejemplo ni se simula guardado. |
| Certificados de campaña / certificados de proveedor | **Parcial — 2026-09-20** | APIs de certificados están disponibles; campaña permite listar/eliminar según historial. El formulario mostrado como cotizaciones no corresponde inequívocamente a certificado de proveedor/campaña. |
| `campaigns/components/CampaignHarvestCard` (bloque de avance) | **Sin cambios — 2026-09-20 / API faltante** | Backend no modela cosecha/kilos/progreso. Confirmado: esperar API específica y mantener documentada esta brecha. |
| Derivados de fruta en detalle de campaña | **Parcial — 2026-09-20** | Confirmado: listar derivados de la fruta asociada a la campaña; no hay vínculo separado. Implementado con `GET /frutas/:frutaId/derivadas`; no es una vista de administración CRUD. |
| `users/pages/UsersModulesPage.tsx` | **Sin cambios — 2026-09-20 / no aplica** | Navegación pura; no representa registros de negocio. |

## Inventario de APIs backend revisadas — 2026-09-20

Los controladores actuales exponen:

| Recurso | Rutas/operaciones | Correspondencia frontend observada |
|---|---|---|
| `campanas` | CRUD `/campanas` | `campaigns`; presente API CRUD. |
| `frutas` | CRUD `/frutas`; derivadas GET/POST/GET individual `/frutas/:frutaId/derivadas...` | Catálogo GET conectado en formularios de campaña; detalle de campaña lista derivadas de su `frutaId`. Administración de fruta/derivadas no tiene vista confirmada. |
| `proveedores` | CRUD `/proveedores` | Listado conectado; alta/edición/baja requieren revisar formulario vigente. |
| `proveedores/:proveedorId/examenes` | CRUD de exámenes | No integrado en vista de proveedor observada. |
| `proveedores/:proveedorId/certificados` | CRUD de certificados | Sin correspondencia inequívoca con las cotizaciones de certificación de UI. |
| `proveedores/:proveedorId/frutas` | GET/asignar POST/quitar DELETE | No integrado en la vista de proveedor observada. |
| `campanias-proveedores` | CRUD; filtro GET `/campanias-proveedores/campania/:campaniaId` | Relación vinculada a vistas de proveedores de campaña; verificar cobertura de actualización y baja en UI. |
| `campanas/:campaniaId/clientes-negocio` | CRUD | Modal de vínculo campaña-cliente tiene cobertura parcial según historial. |
| `clientes-negocio` | CRUD y GET `/:clienteNegocioId/contratos` | Cliente CRUD e historial conectados a Planificación Comercial. Alta de contrato por vínculo campaña-cliente no se puede completar hasta definir selección de campaña y URLs de documentos/storage. |
| `campanas/:campaniaId/certificados` | CRUD | Consulta/baja conectadas según historial; alta espera definición para `documentUrl`/subida. |
| `health` | GET `/health`, `/health/cicd` | APIs técnicas, sin vista de negocio asociada; no aplica integrarlas a una pantalla funcional. |

## Definiciones que necesito antes de continuar integraciones ambiguas

1. **Planificación Comercial / clientes — respondido:** esta vista representa clientes y contratos. Cliente CRUD e historial integrados; creación de contrato queda pendiente por falta de almacenamiento de archivos y de seleccionar campaña en el flujo actual.
2. **Certificaciones — ubicación:** no hay página independiente activa de certificaciones en `App.tsx`. Existe tarjeta Certificaciones en `Campañas` → detalle de campaña, asociada a `certificado-campana`. No equivale necesariamente a una vista de cotizaciones descrita en documentación histórica; no se identificó una ruta activa para esa vista.
3. **Derivados — respondido e implementado:** listar los derivados de la fruta asociada a la campaña, sin vínculo independiente; usa `GET /frutas/:frutaId/derivadas`.
4. **Pagos y cosecha — respondido:** esperar APIs específicas. En el backend actual no existen endpoints para pagos a transportistas ni cosecha.
5. **Ficha de proveedor:** está en `Proveedores` → `Gestión de Proveedores` → acción **Ver detalles** (icono ojo), archivo `providers/components/ProviderViewModal.tsx`. Se recomienda agregar ahí frutas/exámenes/certificados. El modal aún usa datos mock y no se cambió porque el destino de estos bloques no ha sido confirmado.

Pagos, cosecha y entrevistas permanecen deshabilitados hasta que existan APIs específicas. La acción “Añadir contrato” no debe simular éxito: el backend exige campaignId, URLs de documento/ficha técnica y kilos; no hay API de almacenamiento. Confirmar si se acepta ingresar URLs manualmente y elegir campaña, o si se espera a crear API de almacenamiento. Los archivos de muestra se conservan; no deben usarse como fallback de API.

> Único archivo a editar para este proceso (ver regla en `AGENTS.md` → "Documentación del proyecto"). Se reutiliza en cada re-ejecución de la auditoría, no se crea uno nuevo.

**Última actualización:** 2026-09-08
**Backend de referencia:** `epe-backend` (NestJS), `VITE_API_BASE_URL=http://localhost:3000/`

## Resumen ejecutivo

Se auditaron todas las vistas de `epe-web`. De las vistas sin conexión a backend, las que tenían un endpoint real y evidente ya quedaron conectadas. Las que dependían de un dato o concepto de negocio que **no existe en el backend actual** se dejaron documentadas como pendientes — sin inventar datos ni endpoints — a la espera de decisión de producto/backend, confirmando con el usuario en cada caso.

| Estado | Cantidad |
|---|---|
| ✅ Conectadas al backend | 9 |
| ⏸️ Pendientes / ambiguas (documentadas, no tocadas) | 6 |
| ➖ No aplica (vista de navegación pura) | 1 |

## ✅ Vistas conectadas

| Vista | Ruta | Conectado vía | Notas |
|---|---|---|---|
| `campaigns/pages/CampaignsPage.tsx` (`CampaignTable.tsx`) | `/campaigns` | `getCampanas()` | Ya estaba conectada; se corrigió un bug: el contador "Mostrando X de X" usaba un array mock residual (`data.length`) en vez de `campaigns.length`. Array mock eliminado. |
| `campaigns/pages/CampaignDetailsPage.tsx` | `/campaigns/:id` | `getCampana(id)` + `getCertificadosCampana(id)` | Ahora lee `:id` con `useParams()`. Nombre, estado, fechas y días de duración (calculado real desde fechaInicio/fechaFin) vienen del backend. Certificaciones reales con estado vigente/por vencer/vencida. |
| `campaigns/pages/CampaignProvidersPage.tsx` | `/campaigns/:id/providers` | `getCampaniaProveedoresByCampania(id)` | Lee `:id` con `useParams()`. Filtra por tipo de proveedor (productor/acopio) según tab. |
| `campaigns/components/CampaignManagementProvidersModal.tsx` | modal (desde `CampaignDetailsPage`) | `getCampaniaProveedoresByCampania(campaniaId)` | `campaniaId` ahora se pasa correctamente desde `CampaignDetailsPage`. |
| `campaigns/components/CampaignLinkProviderModal.tsx` | modal (desde `CampaignProvidersPage`) | `getProveedores()` + `createCampaniaProveedor()` | Selector con catálogo real de proveedores; guarda vínculo real al confirmar. |
| `clients/pages/ClientsPage.tsx` (`ClientsTable.tsx`) | `/clientes` | `getClientesNegocio()` (dominio `clients/api/` creado desde cero) | Dominio no tenía capa `api/` — se creó completa (`.api.ts`/`.dto.ts`/`.mapper.ts`) siguiendo el patrón del proyecto. |
| `providers/pages/ProvidersPage.tsx` (`ProvidersTable.tsx`) | `/proveedores` | `getProveedores()` (dominio `providers/api/` creado desde cero) | `getProveedores()` vivía "prestada" dentro de `campaigns/api/campania-proveedor.api.ts`; se movió a `providers/api/proveedor.api.ts` como dueño canónico, y `campaigns` ahora importa desde ahí (sin duplicar código). Columnas "Fruta"/"Categoría de Fruta"/"Estado" no existen en el modelo `Proveedor` base — quedan como `—`, ver pendientes. |
| `campaigns/components/CampaignManagementClientsModal.tsx` | modal (desde `CampaignDetailsPage`) | `getClientesNegocioCampana(campaniaId)` (dominio `campaigns/api/cliente-negocio-campana.*` creado desde cero) | Reutiliza el modelo `ClienteNegocio` de `clients/api/` (no lo duplica). `campaniaId` ya cableado. |
| `campaigns/components/CampaignLinkClientModal.tsx` | modal (desde `CampaignTable.tsx`) | `getClientesNegocio()` + `createClienteNegocioCampana()` / `deleteClienteNegocioCampana()` | `campaniaId` ya cableado. El campo `documentoUrl` (requerido por el backend) no tiene endpoint de subida de archivos — se implementó como input de URL de texto, no como upload real (ver pendientes). |

## ⏸️ Pendientes / ambiguas — requieren decisión antes de conectar

Ninguna de estas se tocó con datos inventados. Cada una quedó documentada en código con un comentario `// TODO: pendiente de backend...` donde aplica.

| Vista / bloque | Por qué está pendiente | Decisión del usuario |
|---|---|---|
| `auth/pages/AdminLoginPage.tsx` | El backend (`epe-backend`) no tiene ningún módulo de autenticación: sin `/login`, sin JWT, sin tabla de usuarios. Hoy el login solo guarda una bandera en `localStorage`. | **Confirmado 2026-09-08:** dejar como está (mock local) hasta que el backend defina el mecanismo de auth real. |
| `campaigns/components/CampaignStatsOverview.tsx` (4 KPIs en `CampaignsPage`) | No existe endpoint de resumen/estadísticas en el backend. Los KPIs y sus tendencias (`+33%`, etc.) siguen 100% hardcodeados. | **Confirmado 2026-09-08:** dejar todo el bloque pendiente, sin tocar, hasta definir si se calcula en frontend o se pide endpoint nuevo. |
| `certifications/pages/CertificationsPage.tsx` y `CertificationsCreatePage.tsx` | La tabla muestra "cotizaciones de certificados" con estado y pago. El backend solo tiene `certificado-proveedor` y `certificado-campana`, ninguno con esos campos — no está claro a qué entidad mapea el concepto de negocio. | **Confirmado 2026-09-08:** dejar pendiente, sin crear dominio `api/` para `certifications` hasta aclarar el concepto de negocio. |
| `campaigns/pages/CampaignDetailsPage.tsx` — bloque "Avance de cosecha" (kilos cosechados/estimados, % de progreso) | La entidad `Campana` del backend no tiene esos campos. | **Confirmado 2026-09-08:** dejar como placeholder (`----`/`0%`), documentado con TODO en el código. |
| `campaigns/pages/CampaignProvidersPage.tsx` — badge de "estado" del proveedor (Aprobado/Por aprobar) | No existe campo de estado en `Proveedor` ni en `CampaniaProveedor`. | **Confirmado 2026-09-08:** badge en estado neutro "Sin definir", documentado con TODO en el código. |
| `campaigns/pages/CampaignDetailsPage.tsx` — sección "Derivados de Fruta" (chips tipo "Mango Kent"/"Mango Eduard") | **Hallazgo nuevo durante la implementación** (no estaba en el inventario original): sigue 100% hardcodeada. No se identificó a qué entidad del backend debería mapear. | **Sin confirmar todavía — pendiente de que el usuario indique el origen de este dato.** |

## Deuda técnica menor detectada durante la implementación

- `campaigns/components/CampaignLinkProviderModal.tsx`: el DTO `CreateCampaniaProveedorDto` exige `mtdCeratitis: string`, pero el formulario de UI no captura ese campo todavía. Se envía `"0"` como placeholder con TODO en el código — falta decidir si se agrega un input real al formulario.
- `campaigns/components/CampaignLinkClientModal.tsx`: el campo `documentoUrl` es obligatorio en el backend pero no hay endpoint de subida de archivos; se implementó como input de texto (URL) en vez de un flujo de carga de archivo real — confirmar si se necesita un upload real más adelante.
- `providers/pages/ProvidersPage.tsx`: columnas "Fruta", "Categoría de Fruta" quedan como `—` — el backend expone `GET /proveedores/:proveedorId/frutas` y `GET /proveedores/:proveedorId/examenes`, que permitirían completarlas, pero no se conectaron en esta pasada (fuera del alcance original, quedan como mejora futura obvia).

## Cambios de arquitectura realizados

- **Fusión de carpetas de documentación**: `docs/` se fusionó dentro de `doc/` (ya no existe `docs/`). Regla agregada a `AGENTS.md`.
- **`getProveedores()` reubicado**: de `campaigns/api/campania-proveedor.api.ts` a `providers/api/proveedor.api.ts` (dueño canónico), eliminando duplicación. `campaigns` ahora importa el tipo/mapper desde `providers`.
- **Nuevo dominio `clients/api/`**: `cliente-negocio.api.ts` / `.dto.ts` / `.mapper.ts`, contra `GET /clientes-negocio`.
- **Nuevo dominio `campaigns/api/cliente-negocio-campana.*`**: contra `GET/POST /campanas/:campaniaId/clientes-negocio` y `DELETE .../:id`, reutilizando el modelo `ClienteNegocio` del dominio `clients` (sin duplicar tipos).
- **Hook `SessionStart`** agregado en `epe-web/.claude/settings.json`: detecta la rama git actual y, si es `developer`, inyecta un recordatorio automático de revisar este reporte y `doc/entidades-vistas.md`.
- **Reglas nuevas en `AGENTS.md`**: carpeta única `doc/`, archivo único de reporte, regla de rama `developer`, y checklist de organización de archivos.

## Vistas que no aplican

| Vista | Motivo |
|---|---|
| `users/pages/UsersModulesPage.tsx` | Landing de navegación pura (grid de módulos), no representa datos de negocio que deban salir de un backend. |
