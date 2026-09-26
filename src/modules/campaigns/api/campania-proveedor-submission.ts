export interface CampaignProviderSubmissionOperations<TProvider extends { proveedorId: number }> {
  create: (campaniaId: number, provider: TProvider) => Promise<unknown>;
  list: (campaniaId: number) => Promise<Array<{ proveedorId: number }>>;
}

export interface CampaignProviderSubmissionResult {
  status: "complete" | "partial" | "unresolved" | "duplicate";
  persistedProviderIds: number[];
  pendingProviderIds: number[];
}

export function createCampaniaProveedorSubmissionController<
  TProvider extends { proveedorId: number },
>(operations: CampaignProviderSubmissionOperations<TProvider>) {
  let inFlight: Promise<CampaignProviderSubmissionResult> | null = null;
  let hasUnresolvedOutcome = false;

  const result = (
    status: CampaignProviderSubmissionResult["status"],
    persistedProviderIds: number[],
    pendingProviderIds: number[],
  ): CampaignProviderSubmissionResult => ({
    status,
    persistedProviderIds,
    pendingProviderIds,
  });

  const reconcile = async (
    campaniaId: number,
    pendingProviderIds: number[],
    knownPersistedProviderIds: number[] = [],
  ): Promise<CampaignProviderSubmissionResult> => {
    try {
      const linkedProviders = await operations.list(campaniaId);
      const linkedIds = new Set(linkedProviders.map((provider) => provider.proveedorId));
      const persistedProviderIds = [...new Set([
        ...knownPersistedProviderIds,
        ...pendingProviderIds.filter((providerId) => linkedIds.has(providerId)),
      ])];
      const persisted = new Set(persistedProviderIds);
      const unresolvedProviderIds = pendingProviderIds.filter((providerId) => !persisted.has(providerId));
      hasUnresolvedOutcome = false;
      return result(
        unresolvedProviderIds.length === 0 ? "complete" : "partial",
        persistedProviderIds,
        unresolvedProviderIds,
      );
    } catch {
      hasUnresolvedOutcome = true;
      return result("unresolved", knownPersistedProviderIds, pendingProviderIds);
    }
  };

  const submit = (
    campaniaId: number,
    providers: TProvider[],
  ): Promise<CampaignProviderSubmissionResult> => {
    const providerIds = providers.map((provider) => provider.proveedorId);
    if (inFlight) return inFlight;
    if (hasUnresolvedOutcome) {
      return Promise.resolve(result("unresolved", [], providerIds));
    }
    if (new Set(providerIds).size !== providerIds.length) {
      return Promise.resolve(result("duplicate", [], [...new Set(providerIds)]));
    }

    const request = (async () => {
      const confirmedIds: number[] = [];
      for (let index = 0; index < providers.length; index += 1) {
        try {
          await operations.create(campaniaId, providers[index]);
          confirmedIds.push(providers[index].proveedorId);
        } catch {
          return reconcile(
            campaniaId,
            providers.slice(index).map((provider) => provider.proveedorId),
            confirmedIds,
          );
        }
      }
      return result("complete", confirmedIds, []);
    })();

    inFlight = request.finally(() => {
      inFlight = null;
    });
    return inFlight;
  };

  return {
    submit,
    reconcile: (campaniaId: number, pendingProviderIds: number[]) =>
      reconcile(campaniaId, pendingProviderIds),
  };
}
