export type ValueMode = "literal" | "compareColumn" | "placeholder";

export interface IConditionValue {
    mode: ValueMode;
    /** literal mode: primary value (single-value operators) */
    value?: string;
    /** literal mode: second value, only for two-value operators (between/not-between) */
    value2?: string;
    /** literal mode: value list, only for many-value operators (in/not-in) */
    values?: string[];
    /** compareColumn mode: fetchxml `valueof` target - either "attribute" (same row) or "alias.attribute" (joined table) */
    compareTarget?: string;
    /** placeholder mode: name of the configured placeholder */
    placeholderName?: string;
}

export interface ICondition {
    id: string;
    attribute: string;
    operator: string;
    entityAlias?: string;
    conditionValue: IConditionValue;
}

export type FilterType = "and" | "or";

export interface IFilter {
    id: string;
    type: FilterType;
    conditions: ICondition[];
    filters: IFilter[];
}

export interface IOrder {
    id: string;
    attribute: string;
    descending: boolean;
}

/**
 * inner/outer are structural joins (return columns, sit beside the entity's filter).
 * any/not-any/all/not-all are existence-only checks (return no columns, must sit inside the
 * entity's own filter) - see https://learn.microsoft.com/power-apps/developer/data-platform/fetchxml/filter-rows#filter-on-values-in-related-records
 */
export type LinkType = "inner" | "outer" | "any" | "not-any" | "all" | "not-all";

export function isStructuralLinkType(linkType: LinkType): boolean {
    return linkType === "inner" || linkType === "outer";
}

export interface ILinkEntity {
    id: string;
    name: string;
    from: string;
    to: string;
    alias: string;
    linkType: LinkType;
    allAttributes: boolean;
    attributes: string[];
    /** attribute logical name -> output alias, e.g. { name: "ac.name" } -> <attribute name="name" alias="ac.name" /> */
    attributeAliases: Record<string, string>;
    filter: IFilter;
    orders: IOrder[];
    linkEntities: ILinkEntity[];
    /** UI-only: which relationship picker option produced this link (not serialized to FetchXML). */
    relationshipSchemaName?: string;
}

export type PagingMode = "none" | "top" | "page";

export interface IFetchXmlQuery {
    entityName: string;
    distinct: boolean;
    pagingMode: PagingMode;
    top?: number;
    page?: number;
    count?: number;
    allAttributes: boolean;
    attributes: string[];
    /** attribute logical name -> output alias, e.g. { name: "ac.name" } -> <attribute name="name" alias="ac.name" /> */
    attributeAliases: Record<string, string>;
    orders: IOrder[];
    filter: IFilter;
    linkEntities: ILinkEntity[];
}

let idCounter = 0;
export function createId(prefix: string): string {
    idCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function createEmptyFilter(type: FilterType = "and"): IFilter {
    return { id: createId("filter"), type, conditions: [], filters: [] };
}

export function createEmptyCondition(): ICondition {
    return {
        id: createId("cond"),
        attribute: "",
        operator: "eq",
        conditionValue: { mode: "literal", value: "" },
    };
}

export function createEmptyOrder(): IOrder {
    return { id: createId("order"), attribute: "", descending: false };
}

export function createEmptyLinkEntity(): ILinkEntity {
    return {
        id: createId("link"),
        name: "",
        from: "",
        to: "",
        alias: "",
        linkType: "inner",
        allAttributes: false,
        attributes: [],
        attributeAliases: {},
        filter: createEmptyFilter(),
        orders: [],
        linkEntities: [],
    };
}

export function createEmptyQuery(entityName = ""): IFetchXmlQuery {
    return {
        entityName,
        distinct: false,
        pagingMode: "none",
        allAttributes: false,
        attributes: [],
        attributeAliases: {},
        orders: [],
        filter: createEmptyFilter(),
        linkEntities: [],
    };
}

/** Recursively updates a link-entity anywhere in the tree by id, for editors that live outside the filter tree (e.g. a dedicated Columns tab). */
export function updateLinkEntityById(links: ILinkEntity[], id: string, updater: (link: ILinkEntity) => ILinkEntity): ILinkEntity[] {
    return links.map((link) => {
        if (link.id === id) return updater(link);
        if (link.linkEntities.length === 0) return link;
        return { ...link, linkEntities: updateLinkEntityById(link.linkEntities, id, updater) };
    });
}

export interface IAliasedEntity {
    alias: string;
    entityName: string;
}

interface IAttributeHolder {
    allAttributes: boolean;
    attributes: string[];
    attributeAliases: Record<string, string>;
}

interface IRequiredFieldLike {
    entity?: string;
    attribute: string;
    alias?: string;
}

/** A required field with no `entity` applies to the root entity only; otherwise it must match the entity name. */
function requiredFieldMatches(rf: IRequiredFieldLike, entityName: string, isRoot: boolean): boolean {
    if (rf.entity) return rf.entity.toLowerCase() === entityName.toLowerCase();
    return isRoot;
}

export interface IMissingRequiredField {
    /** "(root)" for the query's own entity, otherwise the link-entity's alias (falling back to its name). */
    entityLabel: string;
    attribute: string;
}

/**
 * Reports every configured required field that's absent from an entity occurrence ALREADY in the
 * query - the root entity, and any related link-entity whose target entity name matches. Never
 * creates a new link, and never mutates the query - this is alert-only, the maker adds the column
 * themselves via the Columns tab.
 */
export function findMissingRequiredFields<T extends IRequiredFieldLike>(query: IFetchXmlQuery, requiredFields: T[]): IMissingRequiredField[] {
    if (requiredFields.length === 0) return [];
    const missing: IMissingRequiredField[] = [];

    function checkEntity(entity: IAttributeHolder, entityName: string, entityLabel: string, isRoot: boolean): void {
        if (entity.allAttributes) return;
        for (const rf of requiredFields) {
            if (requiredFieldMatches(rf, entityName, isRoot) && !entity.attributes.includes(rf.attribute)) {
                missing.push({ entityLabel, attribute: rf.attribute });
            }
        }
    }

    function walkLinks(links: ILinkEntity[]): void {
        for (const link of links) {
            checkEntity(link, link.name, link.alias || link.name || "related entity", false);
            walkLinks(link.linkEntities);
        }
    }

    checkEntity(query, query.entityName, "(root)", true);
    walkLinks(query.linkEntities);
    return missing;
}

/** Required-field attribute names that apply to a given entity occurrence, for locking their remove control in the UI. */
export function getRequiredAttributeNames<T extends IRequiredFieldLike>(requiredFields: T[], entityName: string, isRoot: boolean): string[] {
    return requiredFields.filter((rf) => requiredFieldMatches(rf, entityName, isRoot)).map((rf) => rf.attribute);
}

/** Every link-entity in the query that has an alias set, for cross-table `valueof` column comparisons. */
export function collectAliasedEntities(query: IFetchXmlQuery): IAliasedEntity[] {
    const result: IAliasedEntity[] = [];
    const walk = (links: ILinkEntity[]): void => {
        for (const link of links) {
            if (link.alias) result.push({ alias: link.alias, entityName: link.name });
            walk(link.linkEntities);
        }
    };
    walk(query.linkEntities);
    return result;
}

interface IRequiredAliasLike {
    alias: string;
    binding: string[];
}

export interface IRequiredAliasIssue {
    alias: string;
    /** "missing": no attribute in the query outputs this alias. "type-mismatch": it does, but the attribute's resolved type isn't in `binding`. */
    kind: "missing" | "type-mismatch";
    /** "(root)" for the query's own entity, otherwise the link-entity's alias (falling back to its name) - only set for type-mismatch. */
    entityLabel?: string;
    attribute?: string;
    actualType?: string;
}

/**
 * For each configured required alias, finds the attribute in the query (root or any link entity,
 * first match wins) whose output alias matches, and reports an issue if the alias is absent
 * entirely, or present but bound to an attribute whose resolved type isn't in the allowed `binding`
 * list. `resolveBindingType` is injected so this stays synchronous - callers resolve live Dataverse
 * metadata (async) themselves and pass in the already-resolved type. Alert-only, like
 * findMissingRequiredFields - never mutates the query.
 */
export function findRequiredAliasIssues<T extends IRequiredAliasLike>(
    query: IFetchXmlQuery,
    requiredAliases: T[],
    resolveBindingType: (entityName: string, attributeLogicalName: string) => string | undefined
): IRequiredAliasIssue[] {
    if (requiredAliases.length === 0) return [];

    const occurrences = new Map<string, { entityLabel: string; entityName: string; attribute: string }>();

    function scan(entity: IAttributeHolder, entityName: string, entityLabel: string): void {
        for (const [attribute, alias] of Object.entries(entity.attributeAliases)) {
            if (!occurrences.has(alias)) {
                occurrences.set(alias, { entityLabel, entityName, attribute });
            }
        }
    }

    function walkLinks(links: ILinkEntity[]): void {
        for (const link of links) {
            scan(link, link.name, link.alias || link.name || "related entity");
            walkLinks(link.linkEntities);
        }
    }

    scan(query, query.entityName, "(root)");
    walkLinks(query.linkEntities);

    const issues: IRequiredAliasIssue[] = [];
    for (const ra of requiredAliases) {
        const occurrence = occurrences.get(ra.alias);
        if (!occurrence) {
            issues.push({ alias: ra.alias, kind: "missing" });
            continue;
        }
        const actualType = resolveBindingType(occurrence.entityName, occurrence.attribute);
        if (!actualType || !ra.binding.includes(actualType)) {
            issues.push({
                alias: ra.alias,
                kind: "type-mismatch",
                entityLabel: occurrence.entityLabel,
                attribute: occurrence.attribute,
                actualType,
            });
        }
    }
    return issues;
}
