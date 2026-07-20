export type PlaceholderType = "guid" | "lookup" | "optionset" | "decimal" | "string" | "boolean" | "datetime";

export interface IPlaceholderDefinition {
    name: string;
    type: PlaceholderType;
    /** required for "lookup" (target entity to search), optional context for "optionset". When set, also restricts which condition's attribute this placeholder can be picked for. */
    entityName?: string;
    /** required for "optionset" (which attribute's choices to source), optional for "lookup". When set, also restricts which condition's attribute this placeholder can be picked for. */
    attributeName?: string;
    /** When true, the query must reference this placeholder at least once before it can be saved. Defaults to false. */
    required?: boolean;
}

export function isPlaceholderType(value: string): value is PlaceholderType {
    return ["guid", "lookup", "optionset", "decimal", "string", "boolean", "datetime"].includes(value);
}
