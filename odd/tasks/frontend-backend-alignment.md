# Frontend/backend integration alignment

## Objective and rationale

Connect approved frontend flows to existing backend contracts, replace fixture-backed workflows where approved, and make form outcomes accessible and honest. The integration matrix must distinguish persisted API data from local/sample state.

## Scope and exclusions

- **In scope:** FE01–FE09 below, limited to the user-approved requirements and verified backend contracts.
- **Payments are completely excluded:** no payment source changes, endpoints, persistence, or implementation. Documentation may only state that current payment screens use sample/local state and do not persist through the backend.
- **Also excluded:** deployed API calls, remote operations, credentials, and `.env` access. A local fixture or callback must never be described as backend persistence.
- **Repository guidance:** update `docs/backend-api-integration.md` whenever a view, frontend service, or backend endpoint is connected/changed/completed/retired. Include date, per-view status, exact routes, and remaining gaps; label fixtures/local state honestly.

## Resolved working mode

- Strict TDD: **enabled** by the user's repository instructions.
- Required cycle: **RED → GREEN → REFACTOR**. Observe a failing focused test before implementation; do not claim RED without actual output.
- Test runner: `npm.cmd run test` (`vitest run`). Build check: `npm.cmd run build`. Focused test paths and observed outcomes are recorded below.
- Delivery strategy: `ask-on-risk`; selected chain strategy: `stacked-to-main` (each independent work-unit PR targets `main`). No PR is authorized or being created in this implementation task.
- Route: delegated exploration was required because understanding the feature crosses 4+ files. A single delegated writer implemented the authorized FE01 multi-file slice; FE02–FE07 remain unstarted, FE08 UX work is partial and limited to this form, and FE09 is partial with only FE01-paired tests/docs completed.

## Tasks

| ID | Task | Dependencies | Acceptance criteria | Rollback boundary |
|---|---|---|---|---|
| FE01 | Capture complete finca data and real MTD for campaign-linked producers. | Confirm exact backend finca contract before implementation; do not infer it from similarly named UI fields. | Producer link form captures/sends the required finca fields and user-provided MTD; no hardcoded `"0"`; valid producer and acopio paths are covered; UI only presents supported API data. | Revert finca/MTD form, mapping, service, and paired tests/docs without disturbing other campaign workflows. |
| FE02 | Integrate client CRUD and replace commercial-planning client fixtures with API-backed data. | Existing `/clientes-negocio` CRUD contract; FE06 may be implemented in the same cohesive slice if forecast and reviewability permit. | List/create/edit/delete and loading/error/empty states reflect API results; planning table/detail no longer report local fixture mutations as persisted. | Revert client API integration and corresponding planning data wiring/tests/docs only. |
| FE03 | Integrate provider CRUD and provider detail. | Verify existing provider CRUD DTOs and response fields before wiring. | List/create/edit/detail use API data and report loading/errors; mock details are removed from this flow. | Revert provider CRUD/detail integration and paired tests/docs. |
| FE04 | Integrate provider fruits, exams, and certificates. | FE03 provider identity/details; verify each existing subresource route and DTO. | Read/write supported provider subresources through the documented API; no hardcoded fruit list or mock result presented as persisted. | Revert only provider subresource screens/services/tests/docs. |
| FE05 | Add campaign-client editing and campaign-certificate create/edit. | Verify campaign relation and certificate DTOs/routes; backend contract tests/fixes in BE01. | Requested client relation and certificate edits/creation use confirmed routes, with visible success only after API confirmation. | Revert campaign-client/certificate mutations and paired tests/docs. |
| FE06 | Integrate client contract viewing and relevant contract workflow. | FE02 client identity; existing `GET /clientes-negocio/:clienteNegocioId/contratos` response; confirm write workflow separately before assuming one exists. | Contract list uses the existing read route and renders its returned fields accurately; no unsupported persistence action is shown. | Revert contract-specific UI/service/tests/docs without undoing FE02 client CRUD. |
| FE07 | Integrate transport traceability, assignments, and details. | Verify backend routes/DTOs and driver/date-range assignment semantics; BE01 contract tests/fixes. | Traceability, assignments, and detail flows use exact confirmed routes and preserve time-scoped driver assignment semantics; loading/error/empty states are explicit. | Revert traceability/assignment/detail integration and paired tests/docs without changing existing carrier CRUD. |
| FE08 | Add basic UX validation/accessibility: mandatory asterisks and legend, accessible required state, field errors, loading states, and duplicate-submit prevention. | Apply as each form is touched; align requiredness with actual DTO/business rules, including FE01–FE07. | Required marks include a legend and programmatic state; field errors are associated with inputs; async submits expose loading and disable duplicate submission; no invented requiredness. | Revert the affected form behavior/accessibility changes with their tests, preserving unrelated features. |
| FE09 | Maintain FE tests and integration documentation as each flow changes; finish with a cross-flow audit. | Runs alongside every prior task; final audit after FE01–FE08. | Tests ship with the behavior they verify; `docs/backend-api-integration.md` records date, exact routes, per-view status, and remaining gaps; payments are documented only as sample/local state without backend persistence. | Revert only documentation/test changes coupled to reverted behavior; preserve unrelated integration-matrix entries. |

## Verification

- Focused and full frontend tests: `npm.cmd run test`.
- TypeScript and production bundle check when source changes require it: `npm.cmd run build`.
- Validate relevant forms against local/mock test boundaries, including API errors, empty/loading states, required-field errors, and duplicate-submit behavior. Do not use a deployed API or treat build/tests as proof of deployed CORS/network connectivity.
- For each integration-matrix row, confirm the exact route in the backend contract and record whether runtime connectivity remains unverified.

## Exploration evidence and first-task implications

- Campaign provider linking currently hardcodes MTD as `"0"`; the interview screen's finca hectares fields are static/presentational, while backend DTO requires finca fields conditionally for producer records. The approved FE01 needs exact backend contract clarification before field mapping.
- `/clients` has a GET-only API service; commercial planning clients are fixture-backed with callback/local state. Backend CRUD and customer-contract read routes exist, but frontend client CRUD/contract services do not.
- Provider list reads the API, but create/edit/detail and fruits/exams/certificates remain callback/mock-backed. Provider subresources should be integrated against their exact existing routes, not inferred from names.
- Campaign-client service currently provides GET/POST/DELETE; campaign certificate service GET/DELETE. FE05 requires confirmation of the exact backend edit/create routes and payloads before implementation.
- Carrier company/vehicle/driver CRUD already exists in the frontend; traceability, assignments, and details are not connected. Preserve the backend's date-scoped driver assignment semantics, not a fixed driver-to-vehicle assumption.
- Relevant evidence paths include `src/modules/campaigns/components/CampaignLinkProviderModal.tsx`, `CampaignInterviewModal.tsx`, `src/modules/clients/api/cliente-negocio.api.ts`, `src/modules/commercial-planning/`, `src/modules/providers/api/proveedor.api.ts`, `src/modules/providers/components/`, `src/modules/campaigns/api/cliente-negocio-campana.api.ts`, `certificado-campana.api.ts`, `src/modules/carriers/api/carrier.api.ts`, `src/modules/carriers/`, `src/modules/campaigns/CampaignCarrierPaymentsPage.tsx`, `src/modules/campaigns/carrierPayments.data.ts`, and `docs/backend-api-integration.md`.

## Forecast and delivery slices

Estimated authored change for FE01–FE09: **about 1,200–2,000 changed lines** (additions plus deletions; generated output excluded). This clearly exceeds the 400-line review budget. `ask-on-risk` applies; the user selected `stacked-to-main` (each independent slice targets `main`). No PR is authorized in this task. Proposed cohesive slices, with tests and integration-matrix updates carried alongside each behavior change:

1. FE01 finca and MTD campaign-provider contract.
2. FE02 client CRUD and commercial-planning data replacement, with FE06 contracts if it remains a coherent/reviewable client workflow.
3. FE03 provider CRUD/detail plus FE04 provider fruits/exams/certificates.
4. FE05 campaign-client edits and campaign certificate create/edit.
5. FE07 transport traceability/assignments/details.
6. FE08 shared form UX improvements and FE09 final cross-flow integration-matrix audit; FE09 tests/docs remain paired with all earlier slices rather than deferred as a documentation-only change.

## Current status and next step

- FE01 implementation and verification are complete on `feat/frontend-backend-alignment`, based on the user's completed `6dc843ae0bac86753da5c5721eb8f6ac035cd31e` websocket/cache commit; it awaits the authorized work-unit commit. FE02–FE07 remain pending, FE08 UX work is partial and limited to the touched form, and FE09 is partial with only FE01-paired tests/documentation complete. Delivery remains `ask-on-risk` / `stacked-to-main`; no PR is authorized or being created.
- TDD: strict mode enabled. Observed RED before production changes: `npm.cmd run test -- src/modules/campaigns/api/campania-proveedor-form.test.ts` failed because the new form-contract module did not yet exist. After implementation, that focused test passed (3/3).
- Confirmed backend `CreateCampaniaProveedorDto` contract: all provider types require `campaniaId`, `proveedorId`, nonnegative `cantidadProveedor` and `mtdCeratitis` (maximum 3 decimal places), plus `tipoProveedor`. `productor` additionally requires nonempty `departamento`, `provincia`, `distrito`, and `nombreAplicacion`; coordinates must be within latitude [-90, 90]/longitude [-180, 180] with at most 7 decimals; planting density and spacing are nonnegative with at most 3 decimals; irrigation frequency, total hectares, crop hectares, and applications/year are nonnegative integers. Acopio omits finca fields.
- Payments remain outside implementation scope; documentation may only clarify that the current screen is sample/local state and does not persist through the backend.
- No deployed API, credentials, `.env`, or remote operations are authorized. Frontend checks do not prove deployed connectivity.
- FE01 final verification: full `npm.cmd run test` passed (9 files, 31 tests); `npm.cmd run build` passed with the existing large-chunk warning; focused ESLint passed for modified form, DTO, and form/submission/options modules; `git diff --check` passed (line-ending conversion warnings only). `CampaignProvidersPage.tsx` has a pre-existing `react-hooks/set-state-in-effect` error at line 60; that line predates FE01, was already reported by global lint, and was not changed. No mounted React DOM test was added because the current Vitest setup has no DOM environment; async submission/recovery and provider reload failure are tested through pure helpers.
- FE01 form and async-submission tests cover contract validation/serialization, sequential submission, partial success, failed-read locking, later GET reconciliation, uncertain-response reconciliation, duplicate submissions, and clearing stale provider options after reload failure. `onSave` is called only for confirmed completion; partial results use `onRefresh`, and unresolved results block resubmission until reopen/reconciliation.
- The authored FE01 slice is larger than the 400-line review budget (rough estimate ~700 additions plus deletions including paired tests/docs/tracking); do not code-golf it. No PR was created. The Engram mirror remains pending because the runtime session identity was unavailable and project detection is ambiguous at the multi-repository workspace root.
