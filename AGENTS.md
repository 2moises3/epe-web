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
