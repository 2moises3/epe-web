# Integración frontend ↔ backend

**Última revisión:** 2026-09-26
**Alcance:** contraste estático entre las pantallas y servicios de `epe-web/src` y los controladores/DTO de `epe-backend/src`. No representa una prueba contra la base de datos ni contra el servicio desplegado.

## Criterios

- **Completo:** la vista principal usa la API disponible para las operaciones que ofrece.
- **Parcial:** hay llamadas reales, pero falta CRUD, subrecursos o una vista secundaria.
- **Pendiente:** el backend tiene API, pero no se encontró una integración utilizable desde el frontend.
- **Sin API backend:** la pantalla no se puede conectar correctamente hasta que backend exponga el recurso. No tratar los datos de muestra como registros reales.

## Estado por módulo/vista

| Módulo o vista | Estado | Integración actual | Falta / observación |
|---|---|---|---|
| Campañas | **Parcial** | `GET/POST/PATCH/DELETE /campanas`; formularios/listado conectados. | Verificar todos los campos visibles frente a DTO; las métricas de cosecha no son un recurso independiente del backend. |
| Frutas y derivadas | **Parcial** | `GET /frutas` y `GET /frutas/:frutaId/derivadas` para opciones de campaña. | El CRUD de frutas/derivadas del backend no está expuesto como gestión completa en UI. |
| Proveedores de campaña | **Parcial** | `GET/POST /campanias-proveedores`, `GET /campanias-proveedores/campania/:campaniaId`, `PATCH/DELETE /campanias-proveedores/:cxpId`. El formulario de vinculación envía cantidad y MTD capturados por usuario; para `productor`, también los campos de finca requeridos por `CreateCampaniaProveedorDto`, y para `acopio` omite esos campos. Los errores de creación se reconcilian con la consulta por campaña: se confirma el éxito solo cuando todos los vínculos quedan verificados y se bloquean reintentos si la consulta no resuelve el resultado. Al recargar las opciones de proveedores, un fallo limpia las opciones anteriores para impedir que se usen datos obsoletos. | La integración está contrastada estáticamente con el DTO, pero no se verificó contra una API desplegada. |
| Clientes de campaña | **Parcial** | `GET/POST/DELETE /campanas/:campaniaId/clientes-negocio`. | Falta `PATCH` para aprovechar la edición que ofrece backend y confirmar todos los contratos visibles. |
| Certificados de campaña | **Parcial** | `GET/DELETE /campanas/:campaniaId/certificados`. | Falta integrar alta y edición (`POST/PATCH`). |
| Planificación comercial (`/planificacion-comercial`) | **Completo para CRUD** | La vista existente consume `GET /clientes-negocio`; alta usa `POST /clientes-negocio`, edición `PATCH /clientes-negocio/:clienteNegocioId` y baja confirmada `DELETE /clientes-negocio/:clienteNegocioId`. La edición proyecta exactamente los siete campos del DTO y los tipos `exportador`/`industria`. | Filtros limitados a empresa/contacto y tipo; el backend no ofrece estado ni fecha de registro como criterios funcionales de filtro en esta vista. No se verificó contra una API desplegada. |
| Proveedores | **Parcial** | `GET /proveedores` llena la tabla principal. | El backend expone `POST/PATCH/DELETE`, pero la pantalla no integra esas operaciones; el modal de entrevista/detalle contiene contenido de muestra. |
| Frutas por proveedor | **Pendiente** | Backend: `GET/POST/DELETE /proveedores/:proveedorId/frutas`. | No se encontró servicio de frontend conectado para asociar o quitar frutas. |
| Exámenes de proveedor | **Pendiente** | Backend: CRUD bajo `/proveedores/:proveedorId/examenes`. | No se encontró integración de frontend. |
| Certificados de proveedor | **Pendiente** | Backend: CRUD bajo `/proveedores/:proveedorId/certificados`. | No se encontró integración de frontend. |
| Empresas de transporte | **Completo para CRUD de empresa** | `epe-web/src/modules/carriers/api/carrier.api.ts`: `GET/POST/PATCH/DELETE /empresas-transporte-externo`; listado/detalle conectados. | Probar con backend alcanzable y manejar conflictos de unicidad/eliminación en interfaz. |
| Vehículos externos | **Completo para CRUD** | `GET/POST/PATCH/DELETE /vehiculos-externos`; alta/edición/baja desde el detalle de empresa. | La API rechaza borrado si el vehículo tiene asignaciones; el frontend informa ese caso. |
| Choferes externos | **Completo para CRUD** | `GET/POST/PATCH/DELETE /choferes-transporte-externo`; alta/edición/baja desde el detalle de empresa. | No existe una relación fija chofer↔vehículo en el modelo; se asignan por trazabilidad y rango de fechas. |
| Trazabilidad y asignación de transporte | **Pendiente** | Backend dispone de `trazabilidades-transporte`, `asignaciones-transporte` y `detalles-trazabilidad`. | Falta una vista y servicios frontend para contratos/cargas, asignaciones con fechas y detalles/costos. No inferir una asignación fija. |
| Pagos a transportistas (fuera de alcance) | **Sin API backend** | Solo datos de muestra y estado local; no se persisten mediante el backend. | El backend revisado no expone entidades ni endpoints de pagos. Se excluye su implementación; hace falta definir API/modelo antes de integrar pagos reales. |
| Contratos de cliente | **Pendiente** | Backend: `GET /clientes-negocio/:clienteNegocioId/contratos`. | No se encontró consumo frontend para esta ruta. |

## Conectividad y verificación

- FE02 — planificación comercial: pruebas focalizadas del cliente API/validación/guardas/envío (10/10) y suite completa (13 archivos, 41 pruebas) aprobadas; `npm.cmd run build` aprobado con advertencia existente de chunk grande; ESLint focalizado aprobado. El lint global conserva 13 errores en archivos ajenos a FE02. La prueba de listado/CRUD es un mock de la frontera HTTP; no hubo verificación contra una API desplegada ni prueba de navegador automatizada.

- FE01 — formulario de vinculación de proveedores de campaña: pruebas Vitest focalizadas (11/11) aprobadas, incluidas validación/serialización, resultados de envío/reconciliación, duplicados y fallo al recargar opciones; suite completa aprobada (9 archivos, 31 tests); `npm.cmd run build` aprobado con advertencia de tamaño del bundle; ESLint focalizado del componente y módulos de contrato aprobados. La página contenedora conserva un error de lint preexistente en una línea fuera de este cambio. No se invocó una API desplegada.

- Se reportó que la API desplegada responde CORS con `Access-Control-Allow-Origin: http://54.196.9.41`, que no coincide con `http://localhost:5173`. Mientras no se corrija el `CORS_ORIGIN` del backend desplegado, los contratos no pueden probarse desde el navegador local.
- La configuración backend revisada admite un solo origen en `CORS_ORIGIN`; coordinar los orígenes de desarrollo y producción antes de la prueba end-to-end.
- En la integración de transporte se añadieron pruebas para rutas y mapeo de DTO. La compilación y los 18 tests frontend pasaron; el lint global conserva errores en archivos no modificados. Registrar resultados nuevos junto con cada fase.

## Siguiente orden recomendado

1. Resolver CORS y validar en navegador la integración ya hecha de transporte.
2. Conectar CRUD de clientes y proveedores a sus formularios/vistas reales.
3. Conectar frutas-proveedor, exámenes y certificados de proveedor.
4. Completar `PATCH` de clientes-campaña y `POST/PATCH` de certificados de campaña.
5. Implementar pantallas de trazabilidad, asignaciones y detalles contra los contratos existentes.
6. Definir con el usuario si pagos requieren crear API backend o si se retira/deshabilita esa vista; no construir integración con datos de muestra.

> Actualiza esta matriz con fecha y endpoints cuando una vista cambie. Si no está claro qué endpoint corresponde a una pantalla, confirma el mapeo antes de conectar o transformar datos.
