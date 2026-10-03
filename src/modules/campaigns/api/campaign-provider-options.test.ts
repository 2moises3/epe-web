import { describe, expect, it, vi } from "vitest";
import { fetchCampaignProviderOptions } from "@/modules/campaigns/api/campaign-provider-options";

describe("campaign provider option loading", () => {
  it("returns freshly loaded provider options", async () => {
    const providers = [{ proveedorId: 4 }];

    await expect(fetchCampaignProviderOptions(async () => providers)).resolves.toEqual({
      providers,
      failed: false,
    });
  });

  it("returns an empty list after a failed refresh instead of preserving stale options", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("refresh failed"));

    await expect(fetchCampaignProviderOptions(loader)).resolves.toEqual({
      providers: [],
      failed: true,
    });
  });
});
