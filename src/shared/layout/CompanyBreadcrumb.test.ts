import { describe, expect, it } from "vitest";
import { getBreadcrumbLevels } from "@/shared/layout/breadcrumbRoutes";

describe("getBreadcrumbLevels", () => {
    it("builds the root campaign hierarchy", () => {
        expect(getBreadcrumbLevels("/campaigns")).toEqual([{ label: "Campañas" }]);
    });

    it("keeps the campaign root navigable from nested views", () => {
        expect(getBreadcrumbLevels("/campaigns/12/providers")).toEqual([
            { label: "Campañas", href: "/campaigns" },
            { label: "Proveedores" },
        ]);
    });

    it("builds detail hierarchy for other modules", () => {
        expect(getBreadcrumbLevels("/transportistas/8")).toEqual([
            { label: "Transporte", href: "/transportistas" },
            { label: "Detalle" },
        ]);
    });

    it("hides itself on non-operational routes", () => {
        expect(getBreadcrumbLevels("/modules")).toEqual([]);
    });
});
