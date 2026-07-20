import {
    IFetchXmlQuery,
    IFilter,
    ICondition,
    ILinkEntity,
    IOrder,
    FilterType,
    LinkType,
    createEmptyQuery,
    createEmptyFilter,
    createEmptyCondition,
    createEmptyLinkEntity,
    createId,
    isStructuralLinkType,
} from "../models/fetchXmlModel";
import { getOperator } from "../models/operators";

interface IEntityLike {
    allAttributes: boolean;
    attributes: string[];
    attributeAliases: Record<string, string>;
    orders: IOrder[];
    filter: IFilter;
    linkEntities: ILinkEntity[];
}

export interface IParseResult {
    query?: IFetchXmlQuery;
    error?: string;
}

const LINK_TYPE_XML_VALUE: Record<LinkType, string> = {
    inner: "inner",
    outer: "outer",
    any: "any",
    "not-any": "not any",
    all: "all",
    "not-all": "not all",
};

const LINK_TYPE_FROM_XML: Record<string, LinkType> = {
    inner: "inner",
    outer: "outer",
    any: "any",
    "not any": "not-any",
    all: "all",
    "not all": "not-all",
};

export function escapeXmlAttr(value: string): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function escapeXmlText(value: string): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function isFilterEmpty(filter: IFilter): boolean {
    if (filter.conditions.length > 0) return false;
    return filter.filters.every(isFilterEmpty);
}

function buildConditionLines(cond: ICondition, indent: number): string[] {
    const pad = "  ".repeat(indent);
    const op = getOperator(cond.operator);
    const arity = op?.valueArity ?? "one";
    const attrs: string[] = [`attribute="${escapeXmlAttr(cond.attribute)}"`, `operator="${escapeXmlAttr(cond.operator)}"`];
    if (cond.entityAlias) attrs.push(`entityname="${escapeXmlAttr(cond.entityAlias)}"`);
    const cv = cond.conditionValue;

    if (cv.mode === "compareColumn" && cv.compareTarget) {
        attrs.push(`valueof="${escapeXmlAttr(cv.compareTarget)}"`);
        return [`${pad}<condition ${attrs.join(" ")} />`];
    }
    if (cv.mode === "placeholder" && cv.placeholderName) {
        // The placeholder's name IS the literal token written into the FetchXml - the maker picks
        // whatever syntax they want ("anchorid", "${anchorid}", "[[anchorid]]", ...), there's no
        // delimiter added on top of it here.
        attrs.push(`value="${escapeXmlAttr(cv.placeholderName)}"`);
        return [`${pad}<condition ${attrs.join(" ")} />`];
    }

    if (arity === "none") {
        return [`${pad}<condition ${attrs.join(" ")} />`];
    }
    if (arity === "one" || arity === "xvalue") {
        attrs.push(`value="${escapeXmlAttr(cv.value ?? "")}"`);
        return [`${pad}<condition ${attrs.join(" ")} />`];
    }
    const innerPad = "  ".repeat(indent + 1);
    if (arity === "two") {
        return [
            `${pad}<condition ${attrs.join(" ")}>`,
            `${innerPad}<value>${escapeXmlText(cv.value ?? "")}</value>`,
            `${innerPad}<value>${escapeXmlText(cv.value2 ?? "")}</value>`,
            `${pad}</condition>`,
        ];
    }
    // many
    const valueLines = (cv.values ?? []).filter((v) => v !== "").map((v) => `${innerPad}<value>${escapeXmlText(v)}</value>`);
    return [`${pad}<condition ${attrs.join(" ")}>`, ...valueLines, `${pad}</condition>`];
}

/**
 * `extraLinkEntities` are existence-only (any/not-any/all/not-all) link-entities that must be
 * serialized INSIDE this filter rather than beside it - see buildEntityInnerLines.
 */
function buildFilterLines(filter: IFilter, indent: number, extraLinkEntities: ILinkEntity[] = []): string[] {
    const hasContent = !isFilterEmpty(filter) || extraLinkEntities.length > 0;
    if (!hasContent) return [];
    const pad = "  ".repeat(indent);
    const lines: string[] = [`${pad}<filter type="${filter.type}">`];
    for (const cond of filter.conditions) {
        lines.push(...buildConditionLines(cond, indent + 1));
    }
    for (const sub of filter.filters) {
        lines.push(...buildFilterLines(sub, indent + 1));
    }
    for (const link of extraLinkEntities) {
        lines.push(...buildLinkEntityLines(link, indent + 1, { suppressColumns: true }));
    }
    lines.push(`${pad}</filter>`);
    return lines;
}

function buildEntityInnerLines(entity: IEntityLike, indent: number, options?: { suppressColumns?: boolean }): string[] {
    const pad = "  ".repeat(indent);
    const lines: string[] = [];
    if (!options?.suppressColumns) {
        if (entity.allAttributes) {
            lines.push(`${pad}<all-attributes />`);
        } else {
            for (const attr of entity.attributes) {
                if (!attr) continue;
                const alias = entity.attributeAliases[attr];
                const aliasAttr = alias ? ` alias="${escapeXmlAttr(alias)}"` : "";
                lines.push(`${pad}<attribute name="${escapeXmlAttr(attr)}"${aliasAttr} />`);
            }
        }
        for (const order of entity.orders) {
            if (!order.attribute) continue;
            lines.push(`${pad}<order attribute="${escapeXmlAttr(order.attribute)}"${order.descending ? ' descending="true"' : ""} />`);
        }
    }
    // Existence-only link-entities (any/not-any/all/not-all) must live inside this entity's own
    // filter rather than beside it; structural ones (inner/outer) render as normal siblings.
    const structuralLinks = entity.linkEntities.filter((l) => isStructuralLinkType(l.linkType));
    const existenceLinks = entity.linkEntities.filter((l) => !isStructuralLinkType(l.linkType));
    lines.push(...buildFilterLines(entity.filter, indent, existenceLinks));
    for (const link of structuralLinks) {
        lines.push(...buildLinkEntityLines(link, indent));
    }
    return lines;
}

function buildLinkEntityLines(link: ILinkEntity, indent: number, options?: { suppressColumns?: boolean }): string[] {
    const pad = "  ".repeat(indent);
    const attrs: string[] = [`name="${escapeXmlAttr(link.name)}"`, `from="${escapeXmlAttr(link.from)}"`, `to="${escapeXmlAttr(link.to)}"`];
    if (link.alias) attrs.push(`alias="${escapeXmlAttr(link.alias)}"`);
    if (link.linkType !== "inner") attrs.push(`link-type="${LINK_TYPE_XML_VALUE[link.linkType]}"`);
    const inner = buildEntityInnerLines(link, indent + 1, options);
    if (inner.length === 0) {
        return [`${pad}<link-entity ${attrs.join(" ")} />`];
    }
    return [`${pad}<link-entity ${attrs.join(" ")}>`, ...inner, `${pad}</link-entity>`];
}

export function buildFetchXml(query: IFetchXmlQuery): string {
    const fetchAttrs: string[] = ['version="1.0"', 'output-format="xml-platform"', 'mapping="logical"'];
    if (query.distinct) fetchAttrs.push('distinct="true"');
    if (query.pagingMode === "top" && query.top) fetchAttrs.push(`top="${query.top}"`);
    if (query.pagingMode === "page") {
        if (query.page) fetchAttrs.push(`page="${query.page}"`);
        if (query.count) fetchAttrs.push(`count="${query.count}"`);
    }
    const lines: string[] = [`<fetch ${fetchAttrs.join(" ")}>`, `  <entity name="${escapeXmlAttr(query.entityName)}">`, ...buildEntityInnerLines(query, 2), `  </entity>`, `</fetch>`];
    return lines.join("\n");
}

function childElements(el: Element, tagName?: string): Element[] {
    const result: Element[] = [];
    for (const node of Array.from(el.childNodes)) {
        if (node.nodeType === 1) {
            const elNode = node as Element;
            if (!tagName || elNode.nodeName.toLowerCase() === tagName) {
                result.push(elNode);
            }
        }
    }
    return result;
}

function firstChildElement(el: Element, tagName: string): Element | undefined {
    return childElements(el, tagName)[0];
}

function parseCondition(el: Element, placeholderNames: Set<string>): ICondition {
    const cond = createEmptyCondition();
    cond.attribute = el.getAttribute("attribute") ?? "";
    cond.operator = el.getAttribute("operator") ?? "eq";
    const alias = el.getAttribute("entityname");
    if (alias) cond.entityAlias = alias;
    const arity = getOperator(cond.operator)?.valueArity ?? "one";
    const valueOf = el.getAttribute("valueof");
    const literalValue = el.getAttribute("value");
    const valueChildren = childElements(el, "value");

    if (valueOf) {
        cond.conditionValue = { mode: "compareColumn", compareTarget: valueOf };
    } else if (literalValue !== null) {
        // A configured placeholder's name is the literal token as written in the FetchXml (any
        // syntax the maker chose), so recognizing one back is an exact match against the
        // currently configured placeholder names - not a fixed delimiter pattern.
        if (placeholderNames.has(literalValue)) {
            cond.conditionValue = { mode: "placeholder", placeholderName: literalValue };
        } else {
            cond.conditionValue = { mode: "literal", value: literalValue };
        }
    } else if (valueChildren.length > 0) {
        if (arity === "two" && valueChildren.length >= 2) {
            cond.conditionValue = { mode: "literal", value: valueChildren[0].textContent || "", value2: valueChildren[1].textContent || "" };
        } else {
            cond.conditionValue = { mode: "literal", values: valueChildren.map((v) => v.textContent || "") };
        }
    } else {
        cond.conditionValue = { mode: "literal", value: "", values: [] };
    }
    return cond;
}

function parseFilter(el: Element, placeholderNames: Set<string>): IFilter {
    const filter = createEmptyFilter((el.getAttribute("type") as FilterType) || "and");
    filter.conditions = childElements(el, "condition").map((c) => parseCondition(c, placeholderNames));
    filter.filters = childElements(el, "filter").map((f) => parseFilter(f, placeholderNames));
    return filter;
}

function parseEntityInner(el: Element, target: IEntityLike, placeholderNames: Set<string>): void {
    target.allAttributes = !!firstChildElement(el, "all-attributes");
    const attributeEls = childElements(el, "attribute").filter((a) => a.getAttribute("name"));
    target.attributes = attributeEls.map((a) => a.getAttribute("name")!);
    target.attributeAliases = {};
    for (const a of attributeEls) {
        const alias = a.getAttribute("alias");
        if (alias) target.attributeAliases[a.getAttribute("name")!] = alias;
    }
    target.orders = childElements(el, "order").map((o) => ({
        id: createId("order"),
        attribute: o.getAttribute("attribute") ?? "",
        descending: o.getAttribute("descending") === "true",
    }));
    const filterEl = firstChildElement(el, "filter");
    target.filter = filterEl ? parseFilter(filterEl, placeholderNames) : createEmptyFilter();
    // Existence-only link-entities (any/not-any/all/not-all) live inside the filter; structural
    // ones (inner/outer) are direct children of the entity/link-entity - gather both here.
    const directLinks = childElements(el, "link-entity").map((l) => parseLinkEntity(l, placeholderNames));
    const filterLinks = filterEl ? childElements(filterEl, "link-entity").map((l) => parseLinkEntity(l, placeholderNames)) : [];
    target.linkEntities = [...directLinks, ...filterLinks];
}

function parseLinkEntity(el: Element, placeholderNames: Set<string>): ILinkEntity {
    const link = createEmptyLinkEntity();
    link.name = el.getAttribute("name") ?? "";
    link.from = el.getAttribute("from") ?? "";
    link.to = el.getAttribute("to") ?? "";
    link.alias = el.getAttribute("alias") ?? "";
    const rawLinkType = el.getAttribute("link-type") ?? "inner";
    link.linkType = LINK_TYPE_FROM_XML[rawLinkType] ?? "inner";
    parseEntityInner(el, link, placeholderNames);
    return link;
}

export function parseFetchXml(xml: string, placeholderNames: string[] = []): IParseResult {
    if (!xml?.trim()) {
        return { query: createEmptyQuery() };
    }
    let doc: Document;
    try {
        const parser = new DOMParser();
        doc = parser.parseFromString(xml, "application/xml");
    } catch (e) {
        return { error: `Unable to parse XML: ${(e as Error).message}` };
    }
    const parserError = doc.getElementsByTagName("parsererror")[0];
    if (parserError) {
        return { error: parserError.textContent || "Invalid XML" };
    }
    const fetchEl = doc.documentElement;
    if (!fetchEl || fetchEl.nodeName.toLowerCase() !== "fetch") {
        return { error: "Root element must be <fetch>" };
    }
    const entityEl = firstChildElement(fetchEl, "entity");
    if (!entityEl) {
        return { error: "<fetch> must contain an <entity> element" };
    }

    const query = createEmptyQuery(entityEl.getAttribute("name") ?? "");
    query.distinct = fetchEl.getAttribute("distinct") === "true";
    const topAttr = fetchEl.getAttribute("top");
    const pageAttr = fetchEl.getAttribute("page");
    const countAttr = fetchEl.getAttribute("count");
    if (topAttr) {
        query.pagingMode = "top";
        query.top = parseInt(topAttr, 10);
    } else if (pageAttr || countAttr) {
        query.pagingMode = "page";
        if (pageAttr) query.page = parseInt(pageAttr, 10);
        if (countAttr) query.count = parseInt(countAttr, 10);
    }

    parseEntityInner(entityEl, query, new Set(placeholderNames));
    return { query };
}
