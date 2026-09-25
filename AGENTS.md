# AGENTS.md — epe-web

Guía rápida de arquitectura para agentes que trabajen en este proyecto (React + Vite + TypeScript).

## Screaming Architecture

- `src/modules/<domain>/{components,pages}` — un módulo por feature de negocio (`auth`, `campaigns`, `users`).
- `components/` es **plano**: sin anidamiento atomic-design (`molecules`/`organisms`). Se descartó deliberadamente por ser indirección innecesaria.
- Cada módulo es autocontenido: sus páginas importan sus propios componentes vía `@/modules/<domain>/components/...`.

## `src/shared/`

Todo lo transversal / no-dominio vive aquí:

- `shared/components/ui/` — catálogo shadcn vendorizado. Se trae con `npx shadcn@latest add`, pero **es código nuestro y se personaliza ahí mismo**: estilos por defecto de la app, variantes (`cva`) y la lógica propia del control (estado interno, accesibilidad) van dentro del componente.
  - **No envolver un componente de `ui/` en otro archivo solo para darle estilo o lógica.** Ese envoltorio duplica la API, obliga a mantener dos piezas y esconde el componente real. Si a un `Input` le falta algo, se le agrega a `ui/input.tsx` y se usa `<Input>` directo.
  - Un componente propio en `shared/components/` se justifica cuando compone **varias** piezas en un patrón nuevo (p. ej. `AppModal`, `RowActions`), no cuando reexporta una sola con clases encima.
  - Lo que sí queda fuera: lógica de negocio/dominio. Eso vive en el módulo.
- `shared/layout/` — chrome de la app: `Sidebar.tsx`, `TopNavBar.tsx`, `DashboardLayout.tsx`.

## Convención de imports

- Usar el alias `@/` para todo import interno (`@/modules/...`, `@/shared/...`, `@/lib/...`).
- Los imports relativos (`./`, `../`) quedan reservados **exclusivamente** para archivos dentro de `shared/components/ui/` (convención propia de shadcn, se deja intacta para no divergir del upstream).

## Config de shadcn

`components.json` define `aliases.ui` y `aliases.components` apuntando a `@/shared/components(/ui)`. Por eso `npx shadcn@latest add` ya coloca los componentes nuevos en el lugar correcto sin ajustes manuales.

## Integración con backend (API)

- Cliente HTTP único: `shared/api/client.ts` (axios, `baseURL` desde `VITE_API_BASE_URL`). Ningún módulo crea su propia instancia de axios.
- Por dominio, en `modules/<domain>/api/` (crear solo cuando ese dominio empiece a consumir el backend, no especulativamente):
  - `<domain>.api.ts` — llamadas axios usando el cliente compartido, funciones `get<Domain>()`, `create<Domain>(dto)`, etc. Reciben/devuelven DTOs.
  - `<domain>.dto.ts` — tipos que espejan la forma cruda del backend.
  - `<domain>.mapper.ts` — funciones `to<Domain>(dto)` que transforman DTO → modelo de frontend.
- Regla dura: componentes y páginas **nunca** importan un DTO ni el cliente axios directamente — solo consumen el modelo de frontend ya mapeado, vía `<domain>.api.ts`. Un cambio de forma en el backend se absorbe en el mapper de ese dominio, sin tocar componentes.
- Sin TanStack Query / SWR por ahora (decisión explícita, YAGNI) — si más adelante hace falta caché/refetch automático, ese es el upgrade natural.
- Variable de entorno `VITE_API_BASE_URL` documentada en `.env.example`.

## Documentación del proyecto

- Existe una única carpeta de documentación: `doc/` (se consolidó `docs/` dentro de `doc/`). No recrear `docs/`.
- Cuando un agente realice la tarea de "revisar vistas sin conexión a backend", el **único** archivo que debe crear o editar para reportar el estado es `doc/reporte-conexion-vistas.md` (o el nombre que ya exista si la tarea se re-ejecuta — se reutiliza el mismo archivo, nunca se crea uno nuevo). Ningún otro archivo de `doc/` debe tocarse como parte de ese reporte.
- Ese reporte debe indicar, por vista: si está conectada al backend o no; si no lo está, si la conexión es obvia (y qué se hizo) o ambigua (y qué falta decidir/preguntar al usuario).
- Regla dura: si no es obvio cómo conectar una vista al backend (falta contrato de API, el dato no existe, o requiere una decisión de producto), el agente **nunca** debe inventar datos ni endpoints — debe preguntarle al usuario antes de escribir código, y mientras tanto dejar esa vista listada como pendiente/ambigua en el reporte.
- Cada vez que se trabaje en la rama `developer`, el agente debe revisar `doc/reporte-conexion-vistas.md` y `doc/entidades-vistas.md` para identificar qué vistas/documentos quedaron pendientes de avanzar y priorizar continuarlos. Existe un hook de `SessionStart` (configurado en `.claude/settings.json`) que ya inyecta automáticamente la rama actual en cada sesión, así que esta regla se cumple **incluso sin que el usuario lo recuerde**.

## Organización de archivos — checklist

Antes de crear un archivo nuevo, decidir en este orden:

1. ¿Es código de un dominio de negocio? → va en `src/modules/<domain>/{components,pages,api}`.
2. ¿Es transversal / sin dominio? → va en `src/shared/`.
3. No modificar `shared/components/ui/` a mano (se actualiza vía `npx shadcn@latest add`).
4. Cuando el dominio empiece a consumir backend, seguir el patrón `<domain>.api.ts` / `<domain>.dto.ts` / `<domain>.mapper.ts` — nunca importar el DTO ni axios directo desde componentes/páginas.
5. Usar siempre el alias `@/`, salvo dentro de `shared/components/ui/` (imports relativos, convención de shadcn).
