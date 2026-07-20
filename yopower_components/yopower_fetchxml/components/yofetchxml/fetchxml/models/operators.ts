/**
 * Attribute type buckets used to decide which operators apply. Mirrors Dataverse
 * AttributeTypeCode values, collapsed into the groups the FetchXML operator set cares about.
 */
export type AttributeCategory =
    | "string"
    | "integer"
    | "decimal"
    | "boolean"
    | "datetime"
    | "optionset"
    | "lookup"
    | "uniqueidentifier"
    | "unknown";

export type ValueArity = "none" | "one" | "two" | "many" | "xvalue";

export interface IOperatorDefinition {
    id: string;
    label: string;
    category: string;
    valueArity: ValueArity;
    applicableTypes: AttributeCategory[];
}

const ALL_COMPARABLE: AttributeCategory[] = ["string", "integer", "decimal", "boolean", "datetime", "optionset", "lookup", "uniqueidentifier"];
const TEXT_TYPES: AttributeCategory[] = ["string"];
const NUMERIC_TYPES: AttributeCategory[] = ["integer", "decimal"];
const DATE_TYPES: AttributeCategory[] = ["datetime"];
const REFERENCE_TYPES: AttributeCategory[] = ["lookup", "uniqueidentifier"];

export const OPERATORS: IOperatorDefinition[] = [
    // Equality
    { id: "eq", label: "Equals", category: "Equality", valueArity: "one", applicableTypes: ALL_COMPARABLE },
    { id: "ne", label: "Does Not Equal", category: "Equality", valueArity: "one", applicableTypes: ALL_COMPARABLE },

    // Comparison
    { id: "gt", label: "Greater Than", category: "Comparison", valueArity: "one", applicableTypes: [...NUMERIC_TYPES, ...DATE_TYPES] },
    { id: "ge", label: "Greater Than or Equal", category: "Comparison", valueArity: "one", applicableTypes: [...NUMERIC_TYPES, ...DATE_TYPES] },
    { id: "lt", label: "Less Than", category: "Comparison", valueArity: "one", applicableTypes: [...NUMERIC_TYPES, ...DATE_TYPES] },
    { id: "le", label: "Less Than or Equal", category: "Comparison", valueArity: "one", applicableTypes: [...NUMERIC_TYPES, ...DATE_TYPES] },

    // String
    { id: "like", label: "Like", category: "String", valueArity: "one", applicableTypes: TEXT_TYPES },
    { id: "not-like", label: "Not Like", category: "String", valueArity: "one", applicableTypes: TEXT_TYPES },
    { id: "begins-with", label: "Begins With", category: "String", valueArity: "one", applicableTypes: TEXT_TYPES },
    { id: "not-begin-with", label: "Does Not Begin With", category: "String", valueArity: "one", applicableTypes: TEXT_TYPES },
    { id: "ends-with", label: "Ends With", category: "String", valueArity: "one", applicableTypes: TEXT_TYPES },
    { id: "not-end-with", label: "Does Not End With", category: "String", valueArity: "one", applicableTypes: TEXT_TYPES },

    // Null checks
    { id: "null", label: "Does Not Contain Data (Is Null)", category: "Null", valueArity: "none", applicableTypes: ALL_COMPARABLE },
    { id: "not-null", label: "Contains Data (Is Not Null)", category: "Null", valueArity: "none", applicableTypes: ALL_COMPARABLE },

    // Set
    { id: "in", label: "In", category: "Set", valueArity: "many", applicableTypes: [...TEXT_TYPES, ...NUMERIC_TYPES, "optionset", ...REFERENCE_TYPES] },
    { id: "not-in", label: "Not In", category: "Set", valueArity: "many", applicableTypes: [...TEXT_TYPES, ...NUMERIC_TYPES, "optionset", ...REFERENCE_TYPES] },
    { id: "contain-values", label: "Contains Values", category: "Set", valueArity: "many", applicableTypes: ["optionset"] },
    { id: "not-contain-values", label: "Does Not Contain Values", category: "Set", valueArity: "many", applicableTypes: ["optionset"] },

    // Range
    { id: "between", label: "Between", category: "Range", valueArity: "two", applicableTypes: [...NUMERIC_TYPES, ...DATE_TYPES] },
    { id: "not-between", label: "Not Between", category: "Range", valueArity: "two", applicableTypes: [...NUMERIC_TYPES, ...DATE_TYPES] },

    // User / team / business unit
    { id: "eq-userid", label: "Equals Current User", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "ne-userid", label: "Does Not Equal Current User", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "eq-userteams", label: "Equals Current User's Teams", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "eq-useroruserteams", label: "Equals Current User or User's Teams", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "eq-useroruserhierarchy", label: "Equals Current User or User's Hierarchy", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "eq-useroruserhierarchyandteams", label: "Equals Current User, Hierarchy and Teams", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "eq-businessid", label: "Equals Current Business Unit", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "ne-businessid", label: "Does Not Equal Current Business Unit", category: "User", valueArity: "none", applicableTypes: REFERENCE_TYPES },
    { id: "eq-userlanguage", label: "Equals Current User's Language", category: "User", valueArity: "none", applicableTypes: [...NUMERIC_TYPES] },

    // Hierarchical (self-referential lookups)
    { id: "above", label: "Above (Hierarchy)", category: "Hierarchy", valueArity: "one", applicableTypes: REFERENCE_TYPES },
    { id: "eq-or-above", label: "At or Above (Hierarchy)", category: "Hierarchy", valueArity: "one", applicableTypes: REFERENCE_TYPES },
    { id: "eq-or-under", label: "At or Under (Hierarchy)", category: "Hierarchy", valueArity: "one", applicableTypes: REFERENCE_TYPES },
    { id: "not-under", label: "Not Under (Hierarchy)", category: "Hierarchy", valueArity: "one", applicableTypes: REFERENCE_TYPES },

    // Fixed date keywords (no value)
    { id: "today", label: "Today", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "yesterday", label: "Yesterday", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "tomorrow", label: "Tomorrow", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "this-week", label: "This Week", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "last-week", label: "Last Week", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "next-week", label: "Next Week", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "this-month", label: "This Month", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "last-month", label: "Last Month", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "next-month", label: "Next Month", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "this-year", label: "This Year", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "last-year", label: "Last Year", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "next-year", label: "Next Year", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "this-fiscal-year", label: "This Fiscal Year", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "last-fiscal-year", label: "Last Fiscal Year", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "next-fiscal-year", label: "Next Fiscal Year", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "this-fiscal-period", label: "This Fiscal Period", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "last-fiscal-period", label: "Last Fiscal Period", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },
    { id: "next-fiscal-period", label: "Next Fiscal Period", category: "Date - Fixed", valueArity: "none", applicableTypes: DATE_TYPES },

    // Exact date point operators (take a single date value)
    { id: "on", label: "On", category: "Date - Exact", valueArity: "one", applicableTypes: DATE_TYPES },
    { id: "on-or-before", label: "On or Before", category: "Date - Exact", valueArity: "one", applicableTypes: DATE_TYPES },
    { id: "on-or-after", label: "On or After", category: "Date - Exact", valueArity: "one", applicableTypes: DATE_TYPES },
    { id: "in-fiscal-year", label: "In Fiscal Year", category: "Date - Exact", valueArity: "one", applicableTypes: DATE_TYPES },
    { id: "in-fiscal-period", label: "In Fiscal Period", category: "Date - Exact", valueArity: "one", applicableTypes: DATE_TYPES },
    { id: "in-fiscal-period-and-year", label: "In Fiscal Period and Year", category: "Date - Exact", valueArity: "two", applicableTypes: DATE_TYPES },
    { id: "in-or-after-fiscal-period-and-year", label: "In or After Fiscal Period and Year", category: "Date - Exact", valueArity: "two", applicableTypes: DATE_TYPES },
    { id: "in-or-before-fiscal-period-and-year", label: "In or Before Fiscal Period and Year", category: "Date - Exact", valueArity: "two", applicableTypes: DATE_TYPES },

    // Relative "last/next X units" and "older than X units" (take a numeric X value)
    { id: "last-x-hours", label: "Last X Hours", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "next-x-hours", label: "Next X Hours", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "last-x-days", label: "Last X Days", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "next-x-days", label: "Next X Days", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "last-x-weeks", label: "Last X Weeks", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "next-x-weeks", label: "Next X Weeks", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "last-x-months", label: "Last X Months", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "next-x-months", label: "Next X Months", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "last-x-years", label: "Last X Years", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "next-x-years", label: "Next X Years", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "last-x-fiscal-years", label: "Last X Fiscal Years", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "next-x-fiscal-years", label: "Next X Fiscal Years", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "last-x-fiscal-periods", label: "Last X Fiscal Periods", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "next-x-fiscal-periods", label: "Next X Fiscal Periods", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "olderthan-x-minutes", label: "Older Than X Minutes", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "olderthan-x-hours", label: "Older Than X Hours", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "olderthan-x-days", label: "Older Than X Days", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "olderthan-x-weeks", label: "Older Than X Weeks", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "olderthan-x-months", label: "Older Than X Months", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
    { id: "olderthan-x-years", label: "Older Than X Years", category: "Date - Relative", valueArity: "xvalue", applicableTypes: DATE_TYPES },
];

export function getOperatorsForType(category: AttributeCategory): IOperatorDefinition[] {
    return OPERATORS.filter((op) => op.applicableTypes.includes(category));
}

export function getOperator(id: string): IOperatorDefinition | undefined {
    return OPERATORS.find((op) => op.id === id);
}

/** Our own placeholder-token feature makes sense for any single-value operator. */
export function supportsPlaceholder(operatorId: string): boolean {
    const op = getOperator(operatorId);
    return !!op && op.valueArity === "one";
}

/**
 * Real FetchXML `valueof` column-comparison is restricted by Dataverse to these operators only
 * (https://learn.microsoft.com/power-apps/developer/data-platform/fetchxml/filter-rows#limitations-on-column-comparison-filters).
 */
const COLUMN_COMPARISON_OPERATORS = new Set(["eq", "ne", "gt", "ge", "lt", "le"]);

export function supportsColumnComparison(operatorId: string): boolean {
    return COLUMN_COMPARISON_OPERATORS.has(operatorId);
}

const CDS_TYPE_MAP: Record<string, AttributeCategory> = {
    string: "string",
    memo: "string",
    integer: "integer",
    biginteger: "integer",
    decimal: "decimal",
    double: "decimal",
    money: "decimal",
    boolean: "boolean",
    datetime: "datetime",
    picklist: "optionset",
    state: "optionset",
    status: "optionset",
    multiselectpicklist: "optionset",
    lookup: "lookup",
    owner: "lookup",
    customer: "lookup",
    uniqueidentifier: "uniqueidentifier",
};

export function mapAttributeTypeToCategory(attributeType: string | undefined): AttributeCategory {
    if (!attributeType) return "unknown";
    return CDS_TYPE_MAP[attributeType.toLowerCase()] ?? "unknown";
}
