type ActiveOperation = "load" | "mutation" | null;

export function createProviderSubresourceOperationGate() {
    let activeOperation: ActiveOperation = null;

    return {
        get isLoading() { return activeOperation === "load"; },
        get isMutating() { return activeOperation === "mutation"; },
        beginLoad() {
            if (activeOperation !== null) return false;
            activeOperation = "load";
            return true;
        },
        endLoad() {
            if (activeOperation === "load") activeOperation = null;
        },
        beginMutation() {
            if (activeOperation !== null) return false;
            activeOperation = "mutation";
            return true;
        },
        endMutation() {
            if (activeOperation === "mutation") activeOperation = null;
        },
    };
}
