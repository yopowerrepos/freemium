/**
 * Binding vocabulary for the requiredAlias config - deliberately coarser than the raw Dataverse
 * AttributeType, but finer than operators.ts's AttributeCategory (splits integer/long/decimal/
 * double/float apart instead of collapsing them, since this is about exact column-type contracts
 * with a consumer, not which filter operators apply).
 */
export type RequiredAliasBindingType = "id" | "string" | "decimal" | "integer" | "long" | "float" | "double" | "boolean" | "lookup";

const VALID_BINDING_TYPES: readonly RequiredAliasBindingType[] = ["id", "string", "decimal", "integer", "long", "float", "double", "boolean", "lookup"];

export interface IRequiredAlias {
    alias: string;
    binding: RequiredAliasBindingType[];
}

export interface IRequiredAliasParseResult {
    requiredAliases: IRequiredAlias[];
    error?: string;
}

export function parseRequiredAliases(raw: string | null | undefined): IRequiredAliasParseResult {
    if (!raw?.trim()) {
        return { requiredAliases: [] };
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return { requiredAliases: [], error: "Required alias JSON must be an array" };
        }
        const result: IRequiredAlias[] = [];
        for (const item of parsed as Record<string, unknown>[]) {
            if (!item || typeof item.alias !== "string" || !Array.isArray(item.binding)) continue;
            const binding = item.binding.filter((b): b is RequiredAliasBindingType => typeof b === "string" && VALID_BINDING_TYPES.includes(b as RequiredAliasBindingType));
            if (binding.length === 0) continue;
            result.push({ alias: item.alias, binding });
        }
        return { requiredAliases: result };
    } catch (e) {
        return { requiredAliases: [], error: `Invalid required alias JSON: ${(e as Error).message}` };
    }
}

/** Raw Dataverse AttributeType (from IAttributeMetadata.attributeType) -> requiredAlias binding vocabulary. "float" has no live Dataverse equivalent, so nothing ever maps to it. */
const ATTRIBUTE_TYPE_TO_BINDING: Record<string, RequiredAliasBindingType> = {
    uniqueidentifier: "id",
    string: "string",
    memo: "string",
    integer: "integer",
    bigint: "long",
    decimal: "decimal",
    money: "decimal",
    double: "double",
    boolean: "boolean",
    lookup: "lookup",
    owner: "lookup",
    customer: "lookup",
};

export function mapAttributeTypeToBinding(attributeType: string | undefined): RequiredAliasBindingType | undefined {
    if (!attributeType) return undefined;
    return ATTRIBUTE_TYPE_TO_BINDING[attributeType.toLowerCase()];
}
