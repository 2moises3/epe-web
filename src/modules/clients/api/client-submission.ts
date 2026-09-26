import type { ClienteNegocioInput } from "@/modules/clients/api/cliente-negocio.dto";
import type { ClienteNegocioFieldErrors } from "@/modules/clients/api/cliente-negocio.validation";
import type { createInFlightGuard } from "@/modules/clients/api/in-flight-guard";

type InFlightGuard = ReturnType<typeof createInFlightGuard>;
type Validator = (input: ClienteNegocioInput) => ClienteNegocioFieldErrors;

export type ClienteNegocioSubmissionResult<T> =
  | { status: "invalid"; errors: ClienteNegocioFieldErrors }
  | { status: "busy" }
  | { status: "saved"; value: T };

export async function submitValidatedClienteNegocio<T>(
  input: ClienteNegocioInput,
  validate: Validator,
  guard: InFlightGuard,
  save: (input: ClienteNegocioInput) => Promise<T>,
  onStart?: () => void,
): Promise<ClienteNegocioSubmissionResult<T>> {
  const errors = validate(input);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };
  if (!guard.acquire()) return { status: "busy" };

  try {
    onStart?.();
    return { status: "saved", value: await save(input) };
  } finally {
    guard.release();
  }
}
