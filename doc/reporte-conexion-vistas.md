# Reporte de conexión de vistas al backend — epe-web

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
