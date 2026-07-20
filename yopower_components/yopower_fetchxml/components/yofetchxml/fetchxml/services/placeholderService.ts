import { IFetchXmlQuery, IFilter, ICondition, ILinkEntity } from "../models/fetchXmlModel";
import { IPlaceholderDefinition, isPlaceholderType } from "../models/placeholderModel";
import { escapeXmlAttr } from "./fetchXmlSerializer";

export interface IPlaceholderParseResult {
    placeholders: IPlaceholderDefinition[];
    error?: string;
}

export function parsePlaceholderConfig(raw: string | null | undefined): IPlaceholderParseResult {
    if (!raw?.trim()) {
        return { placeholders: [] };
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return { placeholders: [], error: "Placeholders JSON must be an array" };
        }
        const result: IPlaceholderDefinition[] = [];
        for (const item of parsed as Record<string, unknown>[]) {
            // The name is used verbatim as the literal token written into a condition's value - the
            // maker owns its syntax entirely (e.g. "anchorid", "${anchorid}", "[[anchorid]]", "$x$").
            // An empty name is rejected because it would match every condition with an empty value.
            if (item && typeof item.name === "string" && item.name.length > 0 && typeof item.type === "string" && isPlaceholderType(item.type)) {
                result.push({
                    name: item.name,
                    type: item.type,
                    entityName: typeof item.entityName === "string" ? item.entityName : undefined,
                    attributeName: typeof item.attributeName === "string" ? item.attributeName : undefined,
                    required: item.required === true,
                });
            }
        }
        return { placeholders: result };
    } catch (e) {
        return { placeholders: [], error: `Invalid placeholders JSON: ${(e as Error).message}` };
    }
}

function walkConditions(filter: IFilter, visit: (c: ICondition) => void): void {
    filter.conditions.forEach(visit);
    filter.filters.forEach((f) => walkConditions(f, visit));
}

function walkEntity(entity: { filter: IFilter; linkEntities: ILinkEntity[] }, visit: (c: ICondition) => void): void {
    walkConditions(entity.filter, visit);
    entity.linkEntities.forEach((le) => walkEntity(le, visit));
}

/** Names of placeholders actually referenced by the query, in first-seen order. */
export function collectPlaceholderNames(query: IFetchXmlQuery): string[] {
    const names: string[] = [];
    const seen = new Set<string>();
    walkEntity(query, (c) => {
        if (c.conditionValue.mode === "placeholder" && c.conditionValue.placeholderName) {
            const name = c.conditionValue.placeholderName;
            if (!seen.has(name)) {
                seen.add(name);
                names.push(name);
            }
        }
    });
    return names;
}

/**
 * Substitutes each placeholder's literal token directly in the serialized FetchXML template with
 * a concrete value, for test-execution only. The bound field itself always keeps the
 * un-substituted template. Tokens are matched as exact text (escaped the same way buildFetchXml
 * escaped them into the attribute) rather than any fixed delimiter pattern, since a placeholder's
 * name IS its token syntax now - whatever the maker chose. Longest names are substituted first so
 * one token can't accidentally match inside a longer one that happens to contain it.
 */
export function resolveFetchXmlTemplate(xml: string, values: Record<string, string>): string {
    const names = Object.keys(values).sort((a, b) => b.length - a.length);
    return names.reduce((result, name) => {
        const value = values[name];
        if (value === undefined) return result;
        return result.split(escapeXmlAttr(name)).join(escapeXmlAttr(value));
    }, xml);
}
