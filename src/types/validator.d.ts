declare module "validator" {
    export function isURL(value: string, options?: { require_protocol?: boolean }): boolean;
}
