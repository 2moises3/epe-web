import { describe, expect, it } from "vitest";
import { apiClient } from "@/shared/api/client";

describe("apiClient cache policy", () => {
  it("requests that intermediaries do not cache API responses", () => {
    expect(apiClient.defaults.headers["Cache-Control"]).toBe("no-store");
    expect(apiClient.defaults.headers.Pragma).toBe("no-cache");
  });
});
