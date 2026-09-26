export interface CampaignProviderOptionsResult<TProvider> {
  providers: TProvider[];
  failed: boolean;
}

export async function fetchCampaignProviderOptions<TProvider>(
  load: () => Promise<TProvider[]>,
): Promise<CampaignProviderOptionsResult<TProvider>> {
  try {
    return { providers: await load(), failed: false };
  } catch {
    return { providers: [], failed: true };
  }
}
