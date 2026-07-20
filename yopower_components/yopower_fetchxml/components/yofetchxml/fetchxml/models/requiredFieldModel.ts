export interface IRequiredField {
    /** Entity logical name this rule applies to. Omit to apply to the root entity only. */
    entity?: string;
    attribute: string;
    /** output alias for this attribute, e.g. "ac.name" -> <attribute name="name" alias="ac.name" /> */
    alias?: string;
}

export interface IRequiredFieldParseResult {
    requiredFields: IRequiredField[];
    error?: string;
}

export function parseRequiredFields(raw: string | null | undefined): IRequiredFieldParseResult {
    if (!raw?.trim()) {
        return { requiredFields: [] };
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return { requiredFields: [], error: "Required fields JSON must be an array" };
        }
        const result: IRequiredField[] = [];
        for (const item of parsed as Record<string, unknown>[]) {
            if (item && typeof item.attribute === "string") {
                result.push({
                    entity: typeof item.entity === "string" ? item.entity : undefined,
                    attribute: item.attribute,
                    alias: typeof item.alias === "string" ? item.alias : undefined,
                });
            }
        }
        return { requiredFields: result };
    } catch (e) {
        return { requiredFields: [], error: `Invalid required fields JSON: ${(e as Error).message}` };
    }
}
